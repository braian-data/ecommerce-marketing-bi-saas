from django.contrib import admin
from django.urls import path
from tracking.views import log_click

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/track/', log_click, name='log_click'),  # A rota da API de Tracking
]