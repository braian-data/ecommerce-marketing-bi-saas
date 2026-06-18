from django.db import models
from .tenant_middleware import get_current_loja


class TenantManager(models.Manager):

    def get_queryset(self):

        queryset = super().get_queryset()

        loja = get_current_loja()

        if loja:
            return queryset.filter(loja=loja)

        return queryset