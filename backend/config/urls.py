"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path
from api import views
from api.views import CheckoutAPIView
from api.auth_views import register_user, login_user

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/comprar/', views.realizar_compra, name='realizar_compra'),
    path('api/checkout/', CheckoutAPIView.as_view(), name='api_checkout'),
    path('api/register/', register_user, name='register_user'),
    path('api/login/', login_user, name='login_user'),
]
