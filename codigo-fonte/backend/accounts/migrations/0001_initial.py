from decimal import Decimal

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Account",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255)),
                ("account_number", models.CharField(max_length=100)),
                ("agency", models.CharField(max_length=100)),
                (
                    "initial_balance",
                    models.DecimalField(
                        decimal_places=2,
                        default=Decimal("0.00"),
                        max_digits=12,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "owner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="accounts",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ("name",),
            },
        ),
        migrations.AddIndex(
            model_name="account",
            index=models.Index(
                fields=("owner", "name"),
                name="account_owner_name_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="account",
            index=models.Index(
                fields=("owner", "account_number"),
                name="account_owner_number_idx",
            ),
        ),
    ]
