from django.shortcuts import render

import json

from django.db import transaction as db_transaction
from django.http import QueryDict
from django.utils import timezone
from django.db.models import Q

from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from assets.models import Patrimonio
from assets.serializers import (
    PatrimonioFilterSerializer,
    PatrimonioIdSerializer,
    PatrimonioSerializer,
    LiquidarPatrimonioSerializer,
)
from transactions.models import Transaction


class PatrimonioViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = PatrimonioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Patrimonio.objects.filter(owner=self.request.user).order_by("-data_aquisicao", "-id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def _get_filter_payload(self, request):
        if request.method == "GET":
            if request.body:
                try:
                    payload = json.loads(request.body.decode("utf-8") or "{}")
                except (TypeError, ValueError) as exc:
                    raise ValidationError("Invalid JSON payload.") from exc
                if not isinstance(payload, dict):
                    raise ValidationError("Payload must be a JSON object.")
                return payload
            if isinstance(request.query_params, QueryDict):
                return request.query_params
            return dict(request.query_params)
        return request.data

    @extend_schema(
        request=PatrimonioFilterSerializer,
        responses={200: PatrimonioSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        payload = self._get_filter_payload(request)
        filter_serializer = PatrimonioFilterSerializer(
            data=payload,
            context=self.get_serializer_context(),
        )
        filter_serializer.is_valid(raise_exception=True)
        filters = filter_serializer.validated_data

        queryset = self.filter_queryset(self.get_queryset())

        # search: busca em nome OU tipo (OR)
        search = filters.get("search")
        if search:
            queryset = queryset.filter(Q(nome__icontains=search) | Q(tipo__icontains=search))

        data_inicio = filters.get("data_inicio")
        data_fim = filters.get("data_fim")
        if data_inicio and data_fim:
            queryset = queryset.filter(data_aquisicao__range=(data_inicio, data_fim))
        elif data_inicio:
            queryset = queryset.filter(data_aquisicao__gte=data_inicio)
        elif data_fim:
            queryset = queryset.filter(data_aquisicao__lte=data_fim)

        start = filters.get("start")
        end = filters.get("end")
        if start is not None and end is not None:
            queryset = queryset[start:end]
        else:
            queryset = queryset[:10]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def _get_patrimonio(self, patrimonio_id: int) -> Patrimonio:
        try:
            return self.get_queryset().get(id=patrimonio_id)
        except Patrimonio.DoesNotExist as exc:
            raise NotFound(detail="Patrimônio não encontrado.") from exc

    def update(self, request, *args, **kwargs):
        id_serializer = PatrimonioIdSerializer(data=request.data, context=self.get_serializer_context())
        id_serializer.is_valid(raise_exception=True)
        instance = self._get_patrimonio(id_serializer.validated_data["id"])

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        id_serializer = PatrimonioIdSerializer(data=request.data, context=self.get_serializer_context())
        id_serializer.is_valid(raise_exception=True)
        instance = self._get_patrimonio(id_serializer.validated_data["id"])

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        id_serializer = PatrimonioIdSerializer(data=request.data, context=self.get_serializer_context())
        id_serializer.is_valid(raise_exception=True)
        instance = self._get_patrimonio(id_serializer.validated_data["id"])
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"], url_path="liquidar")
    @extend_schema(
        request=LiquidarPatrimonioSerializer,
        responses={200: PatrimonioSerializer()},
    )
    def liquidar(self, request, *args, **kwargs):
        """
        Liquidar um patrimônio: cria uma Transação de entrada na conta selecionada
        e marca o patrimônio como 'liquidado'.
        """
        serializer = LiquidarPatrimonioSerializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        patrimonio_id = serializer.validated_data["patrimonio_id"]
        conta_id = serializer.validated_data["conta_id"]

        patrimonio = self._get_patrimonio(patrimonio_id)

        if patrimonio.status == "liquidado":
            raise ValidationError("Patrimônio já está liquidado.")

        # Cria a transação e marca patrimonio como liquidado dentro de uma transação DB
        with db_transaction.atomic():
            tx = Transaction.objects.create(
                name=f"Liquidação - {patrimonio.nome}",
                value=patrimonio.valor_original,  # entrada positiva
                description=f"Liquidação do patrimônio #{patrimonio.id} - {patrimonio.nome}",
                account_id=conta_id,
                datetime=timezone.now(),
                owner=request.user,
            )
            patrimonio.status = "liquidado"
            patrimonio.save()

        patr_serializer = PatrimonioSerializer(patrimonio, context=self.get_serializer_context())
        # devolve o patrimônio atualizado e referência mínima da transação
        return Response({"patrimonio": patr_serializer.data, "transacao_id": tx.id})

