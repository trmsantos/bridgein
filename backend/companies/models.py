import uuid
from django.db import models


class Company(models.Model):
    name = models.CharField(max_length=255)
    magic_link = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'companies'

    def __str__(self):
        return self.name
