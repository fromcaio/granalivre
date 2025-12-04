from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from assets.models import Patrimonio
from transactions.models import Transaction  # para a ação de liquidar
from accounts.models import Account


class PatrimonioSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    criado_em = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Patrimonio
        fields = (
            "id",
            "nome",
            "data_aquisicao",
            "valor_original",
            "variacao_anual_percent",
            "tipo",
            "manutencao_mensal",
            "descricao",
            "status",
            "owner",
            "criado_em",
        )
        read_only_fields = ("id", "status", "criado_em")

    def validate_valor_original(self, value: Decimal) -> Decimal:
        if value is None:
            raise serializers.ValidationError("Valor original é obrigatório.")
        if value < Decimal("0.00"):
            raise serializers.ValidationError("Valor original não pode ser negativo.")
        return value.quantize(Decimal("0.01"))

    def validate_variacao_anual_percent(self, value: Decimal) -> Decimal:
        if value is None:
            return value
        # permitir variações positivas e negativas, mas limitar a algo razoável (ex: -1000 a 1000)
        if value < Decimal("-1000") or value > Decimal("1000"):
            raise serializers.ValidationError("Variação anual fora do intervalo permitido.")
        return value.quantize(Decimal("0.01"))


class PatrimonioIdSerializer(serializers.Serializer):
    id = serializers.IntegerField(min_value=1)

    def validate_id(self, value: int) -> int:
        request = self.context.get("request")
        if request is None:
            return value

        exists = Patrimonio.objects.filter(owner=request.user, id=value).exists()
        if not exists:
            raise serializers.ValidationError("Patrimônio não encontrado.")
        return value


class PatrimonioFilterSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)
    data_inicio = serializers.DateField(required=False)
    data_fim = serializers.DateField(required=False)
    start = serializers.IntegerField(required=False, min_value=0)
    end = serializers.IntegerField(required=False, min_value=0)

    def validate(self, attrs):
        start = attrs.get("start")
        end = attrs.get("end")
        if (start is None) ^ (end is None):
            raise serializers.ValidationError(
                {"start": "Provide both start and end for pagination."}
            )
        if start is not None and end is not None and end <= start:
            raise serializers.ValidationError({"end": "End must be greater than start."})
        return attrs


class LiquidarPatrimonioSerializer(serializers.Serializer):
    patrimonio_id = serializers.IntegerField(min_value=1)
    conta_id = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        request = self.context.get("request")
        if request is None:
            return attrs

        patrimonio_qs = Patrimonio.objects.filter(owner=request.user, id=attrs["patrimonio_id"])
        if not patrimonio_qs.exists():
            raise serializers.ValidationError({"patrimonio_id": "Patrimônio não encontrado."})

        # valida conta pertence ao usuário
        conta_exists = Account.objects.filter(id=attrs["conta_id"], owner=request.user).exists()
        if not conta_exists:
            raise serializers.ValidationError({"conta_id": "Conta não encontrada."})

        return attrs
