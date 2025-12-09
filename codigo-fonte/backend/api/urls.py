"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from accounts.views import AccountViewSet
from api.routers import BodyIdRouter
from transactions.views import TransactionViewSet
from automations.views import AutomationViewSet
from assets.views import PatrimonioViewSet
from api.dashboard_views import dashboard_summary
from api.dashboard_views import dashboard_chart

router = BodyIdRouter()
router.register("accounts", AccountViewSet, basename="accounts")
router.register("transactions", TransactionViewSet, basename="transactions")
router.register("automations", AutomationViewSet, basename="automations")
router.register("patrimonios", PatrimonioViewSet, basename="patrimonios")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/dashboard/summary/", dashboard_summary, name="dashboard-summary"),
    path("api/dashboard/chart/", dashboard_chart, name="dashboard-chart"),
    path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="api-schema"),
        name="api-docs",
    ),
    path("api/users/", include("users.urls")),
    path("api/", include(router.urls)),
]
