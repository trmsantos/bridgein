import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Report

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Report)
def notify_new_report(sender, instance, created, **kwargs):
    if created:
        logger.info(
            f"[NOTIFICATION] New report submitted - Company: '{instance.company.name}', "
            f"Title: '{instance.title}', Anonymous: {instance.anonymous}"
        )
        # TODO: Send email notification to company managers
