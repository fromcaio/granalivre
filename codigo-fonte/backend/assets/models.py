from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


class Patrimonio(models.Model):
    STATUS_CHOICES = (
        ("ativo", "Ativo"),
        ("liquidado", "Liquidado"),
    )

    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="patrimonios",
        on_delete=models.CASCADE,
    )
    nome = models.CharField(max_length=255)
    data_aquisicao = models.DateField()
    valor_original = models.DecimalField(max_digits=10, decimal_places=2)
    variacao_anual_percent = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    tipo = models.CharField(max_length=255, blank=True)
    manutencao_mensal = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    valor_atual = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    descricao = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ativo")
    criado_em = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ("-data_aquisicao", "-id")
        indexes = [
            models.Index(fields=("owner", "data_aquisicao"), name="patr_owner_data_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.nome} ({self.tipo or 'Sem tipo'})"
