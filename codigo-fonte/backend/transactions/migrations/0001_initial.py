from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Transaction",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255)),
                ("value", models.DecimalField(decimal_places=2, max_digits=12)),
                ("description", models.TextField(blank=True)),
                ("category", models.CharField(blank=True, max_length=255)),
                ("payment_method", models.CharField(blank=True, max_length=255)),
                ("datetime", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "account",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="transactions",
                        to="accounts.account",
                    ),
                ),
                (
                    "owner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="transactions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ("-datetime", "-id"),
            },
        ),
        migrations.AddIndex(
            model_name="transaction",
            index=models.Index(
                fields=("owner", "datetime"),
                name="trans_owner_datetime_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="transaction",
            index=models.Index(
                fields=("owner", "account", "datetime"),
                name="trans_owner_acc_dt_idx",
            ),
        ),
    ]
