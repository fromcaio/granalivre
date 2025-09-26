from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager

# Crie seus modelos aqui
class CustomUser(AbstractUser):
    USERNAME_FIELD = 'email'
    email = models.EmailField(unique=True)
    REQUIRED_FIELDS = []

    objects = CustomUserManager()