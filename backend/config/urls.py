"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path , include
from api import views
from api.views import CheckoutAPIView, LojaViewSet, ProdutoViewSet
from api.auth_views import register_user, login_user



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/comprar/', views.realizar_compra, name='realizar_compra'),
    path('api/checkout/', CheckoutAPIView.as_view(), name='api_checkout'),
    path('api/register/', register_user, name='register_user'),
    path('api/login/', login_user, name='login_user'),

    path('api/lojas/', LojaViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='loja-list-create'),

    path('api/lojas/<int:pk>/', LojaViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='loja-detail'),

        path('api/produtos/', ProdutoViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='produto-list-create'),

    path('api/produtos/<int:pk>/', ProdutoViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='produto-detail'),

    path('api/tracking/', include('tracking.urls')),

]
