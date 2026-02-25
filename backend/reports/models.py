from django.db import models


class Report(models.Model):
    STATUS_NEW = 'new'
    STATUS_IN_REVIEW = 'in_review'
    STATUS_RESOLVED = 'resolved'
    STATUS_CHOICES = [
        (STATUS_NEW, 'New'),
        (STATUS_IN_REVIEW, 'In Review'),
        (STATUS_RESOLVED, 'Resolved'),
    ]

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='reports'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    contact_info = models.CharField(max_length=255, blank=True, null=True)
    anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.company.name})"
