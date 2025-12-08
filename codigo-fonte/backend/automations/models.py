from django.conf import settings
from django.db import models
from django.utils import timezone


class Automation(models.Model):
    """
    Represents a recurring automation rule that generates financial transactions.
    """

    TIPO_CHOICES = [
        ("entrada", "Entrada"),
        ("saida", "Saída"),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default="saida")
    category = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    frequency = models.CharField(max_length=255)
    day_of_month = models.IntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    account = models.ForeignKey(
        "accounts.Account",
        on_delete=models.CASCADE,
        related_name="automations",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="automations",
    )

    class Meta:
        ordering = ("-created_at", "-id")
        indexes = [
            models.Index(
                fields=("owner", "active"),
                name="auto_owner_active_idx",
            ),
            models.Index(
                fields=("owner", "account", "active"),
                name="auto_owner_acc_active_idx",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.frequency})"
