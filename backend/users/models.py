from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managers'
    )

    class Meta:
        db_table = 'users'
