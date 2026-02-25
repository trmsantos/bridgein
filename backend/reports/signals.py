import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Report

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Report)
def notify_new_report(sender, instance, created, **kwargs):
    if not created:
        return

    logger.info(
        f"[NOTIFICATION] New report submitted - Company: '{instance.company.name}', "
        f"Title: '{instance.title}', Anonymous: {instance.anonymous}"
    )

    # Collect emails of all managers of this company
    manager_emails = list(
        instance.company.managers
        .filter(email__isnull=False)
        .exclude(email='')
        .values_list('email', flat=True)
    )

    if not manager_emails:
        logger.warning(
            f"[NOTIFICATION] No manager emails found for company '{instance.company.name}'. "
            f"Skipping email notification."
        )
        return

    subject = f"[BridgeIn] New report received: {instance.title}"

    if instance.anonymous:
        reporter_info = "This report was submitted anonymously."
    else:
        contact = instance.contact_info or "No contact information provided."
        reporter_info = f"Contact information: {contact}"

    message = f"""A new report has been submitted for {instance.company.name}.

Title: {instance.title}

Description:
{instance.description}

{reporter_info}

Status: {instance.get_status_display()}
Submitted at: {instance.created_at.strftime('%Y-%m-%d %H:%M UTC')}

---
Log in to your BridgeIn dashboard to review this report.
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=manager_emails,
            fail_silently=False,
        )
        logger.info(
            f"[NOTIFICATION] Email sent to {len(manager_emails)} manager(s) "
            f"for company '{instance.company.name}'."
        )
    except Exception as e:
        logger.error(
            f"[NOTIFICATION] Failed to send email notification for report "
            f"'{instance.title}': {e}"
        )
