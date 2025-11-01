from decimal import Decimal

from rest_framework import serializers

from accounts.models import Account
from transactions.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.none())
    account_info = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = (
            "id",
            "name",
            "value",
            "description",
            "account",
            "category",
            "payment_method",
            "datetime",
            "owner",
            "account_info",
        )
        read_only_fields = ("id", "account_info")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["account"].queryset = Account.objects.filter(owner=request.user)

    def validate_value(self, value: Decimal) -> Decimal:
        if value == 0:
            raise serializers.ValidationError("Transaction value cannot be zero.")
        return value.quantize(Decimal("0.01"))

    def get_account_info(self, obj: Transaction):
        account = obj.account
        return {
            "id": account.id,
            "name": account.name,
            "account_number": account.account_number,
            "agency": account.agency,
            "initial_balance": account.initial_balance,
        }


class TransactionIdSerializer(serializers.Serializer):
    id = serializers.IntegerField(min_value=1)

    def validate_id(self, value: int) -> int:
        request = self.context.get("request")
        if request is None:
            return value

        transaction_exists = Transaction.objects.filter(
            owner=request.user,
            id=value,
        ).exists()

        if not transaction_exists:
            raise serializers.ValidationError("Transaction not found.")

        return value


class TransactionFilterSerializer(serializers.Serializer):
    account_id = serializers.IntegerField(required=False, min_value=1)
    type = serializers.ChoiceField(
        choices=("income", "expense"),
        required=False,
    )
    start = serializers.IntegerField(required=False, min_value=0)
    end = serializers.IntegerField(required=False, min_value=0)

    def validate_account_id(self, value: int) -> int:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            exists = Account.objects.filter(id=value, owner=request.user).exists()
            if not exists:
                raise serializers.ValidationError("Account not found.")
        return value

    def validate(self, attrs):
        start = attrs.get("start")
        end = attrs.get("end")
        if (start is None) ^ (end is None):
            raise serializers.ValidationError(
                {"start": "Provide both start and end for pagination."}
            )
        if start is not None and end is not None and end <= start:
            raise serializers.ValidationError(
                {"end": "End must be greater than start."}
            )
        return attrs
