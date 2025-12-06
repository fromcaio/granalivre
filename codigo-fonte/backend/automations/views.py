import json

from django.http import QueryDict
from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from automations.models import Automation
from automations.serializers import (
    AutomationSerializer,
    AutomationIdSerializer,
    AutomationFilterSerializer,
)


class AutomationViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = AutomationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Automation.objects.filter(owner=self.request.user)
            .select_related("account")
            .order_by("-created_at", "-id")
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

            # Normalize query params into a plain dict with proper types
            params = {}
            for k, v in request.query_params.items():
                params[k] = v

            # Convert known params to proper types
            if "account_id" in params:
                try:
                    params["account_id"] = int(params["account_id"])
                except (TypeError, ValueError):
                    raise ValidationError("account_id must be an integer")

            if "active" in params:
                val = params["active"].lower()
                if val in ("true", "1", "t", "yes"):
                    params["active"] = True
                elif val in ("false", "0", "f", "no"):
                    params["active"] = False
                else:
                    raise ValidationError("active must be a boolean")

            return params

        return request.data

    @extend_schema(
        request=AutomationFilterSerializer,
        responses={200: AutomationSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        payload = self._get_filter_payload(request)

        filter_serializer = AutomationFilterSerializer(
            data=payload,
            context=self.get_serializer_context(),
        )
        filter_serializer.is_valid(raise_exception=True)
        filters = filter_serializer.validated_data

        queryset = self.filter_queryset(self.get_queryset())

        account_id = filters.get("account_id")
        if account_id is not None:
            queryset = queryset.filter(account_id=account_id)

        active = filters.get("active")
        if active is not None:
            queryset = queryset.filter(active=active)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def _get_automation(self, automation_id):
        try:
            return self.get_queryset().get(id=automation_id)
        except Automation.DoesNotExist as exc:
            raise NotFound("Automation not found.") from exc

    def update(self, request, *args, **kwargs):
        id_serializer = AutomationIdSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        id_serializer.is_valid(raise_exception=True)

        instance = self._get_automation(id_serializer.validated_data["id"])

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        id_serializer = AutomationIdSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        id_serializer.is_valid(raise_exception=True)

        instance = self._get_automation(id_serializer.validated_data["id"])

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        id_serializer = AutomationIdSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        id_serializer.is_valid(raise_exception=True)

        instance = self._get_automation(id_serializer.validated_data["id"])
        self.perform_destroy(instance)

        return Response(status=status.HTTP_204_NO_CONTENT)
