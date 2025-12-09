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
