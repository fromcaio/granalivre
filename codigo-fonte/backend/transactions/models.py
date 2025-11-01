from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


class Transaction(models.Model):
    """
    Represents a financial transaction (income or expense) associated with an account.
    Positive values represent income, negative values expenses.
    """

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    account = models.ForeignKey(
        "accounts.Account",
        related_name="transactions",
        on_delete=models.CASCADE,
    )
    category = models.CharField(max_length=255, blank=True)
    payment_method = models.CharField(max_length=255, blank=True)
    datetime = models.DateTimeField(default=timezone.now)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="transactions",
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ("-datetime", "-id")
        indexes = [
            models.Index(
                fields=("owner", "datetime"),
                name="trans_owner_datetime_idx",
            ),
            models.Index(
                fields=("owner", "account", "datetime"),
                name="trans_owner_acc_dt_idx",
            ),
        ]

    def __str__(self) -> str:
        direction = "income" if self.value >= Decimal("0.00") else "expense"
        return f"{self.name} ({direction})"
