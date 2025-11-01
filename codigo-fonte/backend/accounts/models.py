from decimal import Decimal

from django.conf import settings
from django.db import models


class Account(models.Model):
    """
    Represents a bank or cash account owned by a user.
    """

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=100)
    agency = models.CharField(max_length=100)
    initial_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="accounts",
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        indexes = [
            models.Index(
                fields=("owner", "name"),
                name="account_owner_name_idx",
            ),
            models.Index(
                fields=("owner", "account_number"),
                name="account_owner_number_idx",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.account_number})"
