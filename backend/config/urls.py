"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path
from api import views
from api.views import CheckoutAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/comprar/', views.realizar_compra, name='realizar_compra'),
    path('api/checkout/', CheckoutAPIView.as_view(), name='api_checkout'),
]
