from django.db import models

class ClickLog(models.Model):
    url = models.CharField(max_length=255)
    button_id = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.button_id} - {self.url}"