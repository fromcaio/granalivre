from django.urls import path
from .views import PatrimonioViewSet

patrimonio_list = PatrimonioViewSet.as_view({
    "get": "list",
    "post": "create",
})

patrimonio_detail = PatrimonioViewSet.as_view({
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})

urlpatterns = [
    path("", patrimonio_list, name="patrimonio-list"),
    path("detail/", patrimonio_detail, name="patrimonio-detail"),
]
