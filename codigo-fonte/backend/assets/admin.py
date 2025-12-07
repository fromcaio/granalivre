from django.contrib import admin
from assets.models import Patrimonio


@admin.register(Patrimonio)
class PatrimonioAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "tipo", "owner", "data_aquisicao", "valor_original", "status")
    list_filter = ("tipo", "status", "data_aquisicao")
    search_fields = ("nome", "tipo")
    readonly_fields = ("criado_em",)
