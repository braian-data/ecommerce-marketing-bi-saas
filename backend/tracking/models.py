from django.db import models

class ClickLog(models.Model):
    page_url = models.CharField(max_length=255)  # Guarda de qual página veio o clique
    element_id = models.CharField(max_length=100, blank=True, null=True)  # Nome/ID do botão clicado
    ip_address = models.GenericIPAddressField(blank=True, null=True)  # IP de quem clicou (bom para o BI)
    created_at = models.DateTimeField(auto_now_add=True)  # Data e hora automática do clique

    def __str__(self):
        return f"{self.page_url} - {self.element_id} em {self.created_at}"
