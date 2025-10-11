from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    """
    Custom User model that uses email for login and allows non-unique usernames.
    """
    # REFACTOR: Override the default username field to remove the uniqueness constraint.
    # We still keep the field for display purposes, but it's no longer a unique identifier.
    username = models.CharField(
        _('username'),
        max_length=150,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        # unique=False is the default, but we state it here for clarity.
        unique=False,
    )

    # REFACTOR: Make the email field required and unique, as it's our new login identifier.
    email = models.EmailField(_('email address'), unique=True)

    # This tells Django to use the `email` field as the unique identifier for logging in.
    USERNAME_FIELD = 'email'
    # These fields will be prompted for when creating a user via the createsuperuser command.
    # 'email' is not needed here because it's the USERNAME_FIELD.
    REQUIRED_FIELDS = ['username']

    # Point to our custom manager.
    objects = CustomUserManager()

    def __str__(self):
        return self.email