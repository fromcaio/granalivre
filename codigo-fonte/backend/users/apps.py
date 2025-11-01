from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    def ready(self):
        # Import schema extensions so that drf-spectacular picks them up.
        from . import schema  # noqa: F401
