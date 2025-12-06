from decimal import Decimal

from rest_framework import serializers

from accounts.models import Account
from automations.models import Automation


class AutomationSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.none())
    account_info = serializers.SerializerMethodField()

    class Meta:
        model = Automation
        fields = (
            "id",
            "name",
            "value",
            "frequency",
            "day_of_month",
            "category",
            "description",
            "active",
            "account",
            "owner",
            "created_at",
            "account_info",
        )
        read_only_fields = ("id", "created_at", "account_info", "owner")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["account"].queryset = Account.objects.filter(owner=request.user)

    def validate_value(self, value: Decimal):
        if value <= 0:
            raise serializers.ValidationError("Value must be positive.")
        return value.quantize(Decimal("0.01"))

    def validate_day_of_month(self, day):
        if day is not None and (day < 1 or day > 31):
            raise serializers.ValidationError("Day of month must be 1–31.")
        return day

    def get_account_info(self, obj: Automation):
        acc = obj.account
        return {
            "id": acc.id,
            "name": acc.name,
            "agency": acc.agency,
            "account_number": acc.account_number,
        }


class AutomationIdSerializer(serializers.Serializer):
    id = serializers.IntegerField(min_value=1)

    def validate_id(self, value):
        request = self.context.get("request")
        exists = Automation.objects.filter(id=value, owner=request.user).exists()
        if not exists:
            raise serializers.ValidationError("Automation not found.")
        return value


class AutomationFilterSerializer(serializers.Serializer):
    account_id = serializers.IntegerField(required=False, min_value=1)
    active = serializers.BooleanField(required=False)
