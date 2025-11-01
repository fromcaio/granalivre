import json

from django.http import QueryDict
from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from transactions.models import Transaction
from transactions.serializers import (
    TransactionFilterSerializer,
    TransactionIdSerializer,
    TransactionSerializer,
)


class TransactionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    Handles CRUD operations for transactions without ID path parameters.
    """

    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Transaction.objects.filter(owner=self.request.user)
            .select_related("account")
            .order_by("-datetime", "-id")
        )

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
        request=TransactionFilterSerializer,
        responses={200: TransactionSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        payload = self._get_filter_payload(request)
        filter_serializer = TransactionFilterSerializer(
            data=payload,
            context=self.get_serializer_context(),
        )
        filter_serializer.is_valid(raise_exception=True)
        filters = filter_serializer.validated_data

        queryset = self.filter_queryset(self.get_queryset())

        account_id = filters.get("account_id")
        if account_id is not None:
            queryset = queryset.filter(account_id=account_id)

        txn_type = filters.get("type")
        if txn_type == "income":
            queryset = queryset.filter(value__gt=0)
        elif txn_type == "expense":
            queryset = queryset.filter(value__lt=0)

        start = filters.get("start")
        end = filters.get("end")
        if start is not None and end is not None:
            queryset = queryset[start:end]
        else:
            queryset = queryset[:10]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def _get_transaction(self, transaction_id: int) -> Transaction:
        try:
            return self.get_queryset().get(id=transaction_id)
        except Transaction.DoesNotExist as exc:
            raise NotFound(detail="Transaction not found.") from exc

    def update(self, request, *args, **kwargs):
        id_serializer = TransactionIdSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        id_serializer.is_valid(raise_exception=True)
        instance = self._get_transaction(id_serializer.validated_data["id"])

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        id_serializer = TransactionIdSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        id_serializer.is_valid(raise_exception=True)
        instance = self._get_transaction(id_serializer.validated_data["id"])

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        id_serializer = TransactionIdSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        id_serializer.is_valid(raise_exception=True)
        instance = self._get_transaction(id_serializer.validated_data["id"])
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
