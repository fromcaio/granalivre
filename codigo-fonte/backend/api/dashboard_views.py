from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import Account
from assets.models import Patrimonio
from automations.models import Automation
from transactions.models import Transaction


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    user = request.user
    today = timezone.now().date()

    # 1) Patrimonio: sum of current value (valor_atual if present, else valor_original)
    patrimonios = Patrimonio.objects.filter(owner=user, status="ativo")
    patr_sum = 0
    for p in patrimonios:
        if p.valor_atual is not None:
            patr_sum += float(p.valor_atual)
        else:
            patr_sum += float(p.valor_original or 0)

    # 2) Current balance: sum of account initial_balance + all transactions
    accounts = Account.objects.filter(owner=user)
    current_balance = 0.0
    for acc in accounts:
        acc_balance = float(acc.initial_balance or 0)
        trans_sum = (
            Transaction.objects.filter(account=acc, owner=user)
            .aggregate(total=Sum('value'))
            .get('total')
        )
        if trans_sum is not None:
            acc_balance += float(trans_sum)
        current_balance += acc_balance

    # 3) Bills to pay this month: active automations with negative value
    # For each automation (expense), check if a transaction already exists in the current month
    first_of_month = today.replace(day=1)
    bills_to_pay = 0.0
    automations = Automation.objects.filter(owner=user, active=True)
    for a in automations:
        try:
            if float(a.value) < 0:
                # Check if any transaction matching name/account produced this month
                exists = (
                    Transaction.objects.filter(
                        owner=user,
                        account=a.account,
                        name=a.name,
                        datetime__date__gte=first_of_month,
                        datetime__date__lte=today,
                    )
                    .exists()
                )
                if not exists:
                    bills_to_pay += abs(float(a.value))
        except Exception:
            continue

    # 4) Last 30 days balance (net change)
    since = timezone.now() - timedelta(days=30)
    last30sum = (
        Transaction.objects.filter(owner=user, datetime__gte=since)
        .aggregate(total=Sum('value'))
        .get('total')
    )
    last30 = float(last30sum) if last30sum is not None else 0.0

    data = {
        "last30DaysBalance": last30,
        "billsToPay": float(bills_to_pay),
        "currentBalance": float(current_balance),
        "patrimonio": float(patr_sum),
    }

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_chart(request):
    """Return chart points for the last `days` days.

    Response: list of { label: 'dd/mm', total: number, spent: number }
    - `total` is the user's total balance as of that day
    - `spent` is the absolute sum of negative transactions on that day
    """
    try:
        days = int(request.query_params.get("days", 30))
    except Exception:
        days = 30

    if days < 1:
        days = 30

    user = request.user
    tz_now = timezone.now()
    end_date = tz_now.date()
    start_date = end_date - timedelta(days=days - 1)

    # Get all accounts with their creation dates
    accounts = Account.objects.filter(owner=user)

    points = []

    # Precompute cumulative transaction sums per day by querying ranges
    for i in range(days):
        d = start_date + timedelta(days=i)
        # end of the day (inclusive)
        day_end = timezone.make_aware(
            timezone.datetime.combine(d, timezone.datetime.max.time())
        )

        # Sum account initial balances only if created on or before this day
        initial_sum = 0.0
        for acc in accounts:
            acc_created_date = acc.created_at.date()
            if acc_created_date <= d:
                initial_sum += float(acc.initial_balance or 0.0)

        # cumulative transactions up to day_end
        cum_sum = (
            Transaction.objects.filter(owner=user, datetime__lte=day_end)
            .aggregate(total=Sum("value"))
            .get("total")
        )
        cum_total = float(cum_sum) if cum_sum is not None else 0.0

        # spent on the day: sum of negative values for that day
        day_start = timezone.make_aware(
            timezone.datetime.combine(d, timezone.datetime.min.time())
        )
        spent_sum = (
            Transaction.objects.filter(
                owner=user, datetime__gte=day_start, datetime__lte=day_end, value__lt=0
            )
            .aggregate(total=Sum("value"))
            .get("total")
        )
        spent = abs(float(spent_sum)) if spent_sum is not None else 0.0

        total_balance = initial_sum + cum_total

        points.append(
            {
                "label": d.strftime("%d/%m"),
                "total": total_balance,
                "spent": spent,
            }
        )

    return Response(points)
