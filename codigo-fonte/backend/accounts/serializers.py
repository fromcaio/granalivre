from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import Coalesce
from rest_framework import serializers

from accounts.models import Account
from transactions.models import Transaction


class AccountSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Account
        fields = (
            "id",
            "name",
            "account_number",
            "agency",
            "initial_balance",
            "owner",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_initial_balance(self, value: Decimal) -> Decimal:
        if value is None:
            return Decimal("0.00")
        return value.quantize(Decimal("0.01"))


class AccountIdSerializer(serializers.Serializer):
    id = serializers.IntegerField(min_value=1)

    def validate_id(self, value: int) -> int:
        request = self.context.get("request")
        if request is None:
            return value

        account_exists = Account.objects.filter(
            owner=request.user,
            id=value,
        ).exists()

        if not account_exists:
            raise serializers.ValidationError("Account not found.")

        return value


class AccountBalanceSerializer(serializers.Serializer):
    account_id = serializers.IntegerField(read_only=True)
    account_name = serializers.CharField(read_only=True)
    initial_balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    transactions_total = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    current_balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    @staticmethod
    def _quantize(value: Decimal) -> Decimal:
        return value.quantize(Decimal("0.01"))

    @classmethod
    def from_account(cls, account: Account) -> "AccountBalanceSerializer":
        totals = Transaction.objects.filter(
            account=account,
            owner=account.owner,
        ).aggregate(
            total=Coalesce(Sum("value"), Decimal("0.00"))
        )
        transactions_total = cls._quantize(totals["total"] or Decimal("0.00"))
        current_balance = cls._quantize(account.initial_balance + transactions_total)
        data = {
            "account_id": account.id,
            "account_name": account.name,
            "initial_balance": cls._quantize(account.initial_balance),
            "transactions_total": transactions_total,
            "current_balance": current_balance,
        }
        serializer = cls(instance=data)
        return serializer

    def to_representation(self, instance):
        return {
            "account_id": instance["account_id"],
            "account_name": instance["account_name"],
            "initial_balance": Decimal(instance["initial_balance"]),
            "transactions_total": Decimal(instance["transactions_total"]),
            "current_balance": Decimal(instance["current_balance"]),
        }
