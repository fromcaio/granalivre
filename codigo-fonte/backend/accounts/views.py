from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import Account
from accounts.serializers import (
    AccountBalanceSerializer,
    AccountIdSerializer,
    AccountSerializer,
)


class AccountViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet handling CRUD operations for accounts using body-based identifiers.
    """

    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(owner=self.request.user).order_by("name", "id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def _get_account(self, account_id: int) -> Account:
        try:
            return self.get_queryset().get(id=account_id)
        except Account.DoesNotExist as exc:
            raise NotFound(detail="Account not found.") from exc

    def update(self, request, *args, **kwargs):
        id_serializer = AccountIdSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        id_serializer.is_valid(raise_exception=True)
        account = self._get_account(id_serializer.validated_data["id"])

        serializer = self.get_serializer(account, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        DELETE /api/accounts/
        Body:
        {
            "id": <account_id>
        }

        Remove a conta do usuário autenticado.
        Retorna 204 em caso de sucesso.
        """
        id_serializer = AccountIdSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        id_serializer.is_valid(raise_exception=True)
        account = self._get_account(id_serializer.validated_data["id"])
        self.perform_destroy(account)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"], url_path="balance")
    def balance(self, request):
        id_serializer = AccountIdSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        id_serializer.is_valid(raise_exception=True)
        account = self._get_account(id_serializer.validated_data["id"])
        balance_serializer = AccountBalanceSerializer.from_account(account)
        return Response(balance_serializer.data)
