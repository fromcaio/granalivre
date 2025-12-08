from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from automations.models import Automation
from transactions.models import Transaction
from decimal import Decimal


class Command(BaseCommand):
    help = "Process automation rules and create transactions based on their schedule"

    def handle(self, *args, **options):
        """
        Process all active automations and create transactions if today matches their schedule.
        
        Logic:
        - For monthly automations: check if today's day matches day_of_month
        - For weekly automations: check if today's weekday matches (not implemented yet, uses day_of_month)
        - For yearly automations: check if today matches the month/day (simplified)
        """
        today = timezone.now().date()
        created_count = 0
        error_count = 0

        # Get all active automations
        automations = Automation.objects.filter(active=True).select_related("owner", "account")

        self.stdout.write(f"Processing {automations.count()} automations for {today}")

        for automation in automations:
            try:
                # Check if this automation should run today
                if self._should_run_today(automation, today):
                    # Check if transaction already exists for today
                    if not self._transaction_exists_today(automation, today):
                        self._create_transaction(automation, today)
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"✓ Created transaction for '{automation.name}' "
                                f"(User: {automation.owner.username})"
                            )
                        )
                    else:
                        self.stdout.write(
                            f"→ Transaction already exists for '{automation.name}' today"
                        )
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f"✗ Error processing '{automation.name}': {str(e)}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✓ Completed: {created_count} created, {error_count} errors"
            )
        )

    def _should_run_today(self, automation: Automation, today) -> bool:
        """Check if automation should run today based on frequency and day_of_month"""
        day_of_month = automation.day_of_month
        today_day = today.day
        frequency = automation.frequency.lower()

        if frequency == "mensal":
            # Monthly: run on the specified day of month
            # Handle end-of-month edge case
            if day_of_month == 31:
                # If day is 31 and current month has fewer days, run on last day
                import calendar
                last_day = calendar.monthrange(today.year, today.month)[1]
                return today_day == last_day
            return today_day == day_of_month

        elif frequency == "semanal":
            # Weekly: simplified - use day_of_month as day of week (1=Mon, 7=Sun)
            # For now, just check day of month
            return today_day == day_of_month

        elif frequency == "anual":
            # Yearly: run on the specified day (simplified - use day_of_month)
            return today_day == day_of_month

        return False

    def _transaction_exists_today(self, automation: Automation, today) -> bool:
        """Check if a transaction from this automation already exists today"""
        start_of_day = timezone.make_aware(
            timezone.datetime.combine(today, timezone.datetime.min.time())
        )
        end_of_day = timezone.make_aware(
            timezone.datetime.combine(today, timezone.datetime.max.time())
        )

        return Transaction.objects.filter(
            owner=automation.owner,
            account=automation.account,
            name=automation.name,
            datetime__date=today,
        ).exists()

    def _create_transaction(self, automation: Automation, today) -> None:
        """Create a transaction from an automation rule"""
        transaction = Transaction(
            name=automation.name,
            value=automation.value,
            category=automation.category,
            description=f"Auto: {automation.description}" if automation.description else "Automated transaction",
            datetime=timezone.make_aware(
                timezone.datetime.combine(today, timezone.datetime.now().time())
            ),
            owner=automation.owner,
            account=automation.account,
        )
        transaction.save()
