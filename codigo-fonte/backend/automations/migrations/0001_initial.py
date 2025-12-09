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
            name="Automation",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255)),
                (
                    "tipo",
                    models.CharField(
                        choices=[("entrada", "Entrada"), ("saida", "Saída")],
                        default="saida",
                        max_length=10,
                    ),
                ),
                ("category", models.CharField(max_length=255)),
                ("value", models.DecimalField(decimal_places=2, max_digits=10)),
                ("frequency", models.CharField(max_length=255)),
                ("day_of_month", models.IntegerField(blank=True, null=True)),
                ("description", models.TextField(blank=True)),
                ("active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "account",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="automations",
                        to="accounts.account",
                    ),
                ),
                (
                    "owner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="automations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ("-created_at", "-id"),
            },
        ),
        migrations.AddIndex(
            model_name="automation",
            index=models.Index(
                fields=("owner", "active"),
                name="auto_owner_active_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="automation",
            index=models.Index(
                fields=("owner", "account", "active"),
                name="auto_owner_acc_active_idx",
            ),
        ),
    ]
