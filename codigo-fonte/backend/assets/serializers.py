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
            "valor_atual",
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

    def validate_valor_atual(self, value: Decimal) -> Decimal:
        if value is None:
            return value
        if value < Decimal("0.00"):
            raise serializers.ValidationError("Valor atual não pode ser negativo.")
        return value.quantize(Decimal("0.01"))

    def _estimate_current_value(self, validade_data: dict) -> Decimal:
        """Estimate current value from original value, annual variation and acquisition date."""
        orig = validade_data.get("valor_original")
        rate = validade_data.get("variacao_anual_percent")
        acquired = validade_data.get("data_aquisicao")
        if orig is None:
            return None
        try:
            orig = Decimal(orig)
        except Exception:
            return orig

    def create(self, validated_data):
        # If valor_atual wasn't provided explicitly, estimate it from other fields
        if "valor_atual" not in validated_data or validated_data.get("valor_atual") is None:
            estimated = self._estimate_current_value(validated_data)
            if estimated is not None:
                validated_data["valor_atual"] = estimated
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # If valor_atual not provided in update payload, try to re-estimate if relevant fields changed
        if "valor_atual" not in validated_data or validated_data.get("valor_atual") is None:
            # build a dict with current values overridden by validated_data
            data = {
                "valor_original": validated_data.get("valor_original", instance.valor_original),
                "variacao_anual_percent": validated_data.get("variacao_anual_percent", instance.variacao_anual_percent),
                "data_aquisicao": validated_data.get("data_aquisicao", instance.data_aquisicao),
            }
            estimated = self._estimate_current_value(data)
            if estimated is not None:
                validated_data["valor_atual"] = estimated
        return super().update(instance, validated_data)
        if rate is None or acquired is None:
            return orig
        # simple compound growth approximation using years
        try:
            years = (timezone.now().date() - acquired).days / 365.0
            if years < 0:
                years = 0.0
            # Use float math for fractional exponent then convert to Decimal to avoid
            # Decimal ** fractional issues and extreme precision surprises.
            try:
                orig_f = float(orig)
                rate_f = float(rate)
                factor_f = (1.0 + (rate_f / 100.0)) ** years
                value_f = orig_f * factor_f
                # guard against NaN/inf
                if not (value_f is None or value_f != value_f):
                    return Decimal(str(round(value_f, 2)))
            except Exception:
                return orig
            return orig
        except Exception:
            return orig


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
    valor_venda = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

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
