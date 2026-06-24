from api.views import CheckoutAPIView
from django.urls import path
from django.conf import settings
from api.views import VitrineGlobalAPIView
from django.conf.urls.static import static
from api.views import UsuarioMeDetailView
from api.views import (ProdutoLojaAPIView, PedidoListView, ProdutoDetailView, ContaCRUDAPIView)
from api.views import (
    CheckoutAPIView, RegistroVendedorAPIView, CustomLoginAPIView, 
    PlanoListAPIView, LojaManagerAPIView, LojaDetailAPIView, RegistroClienteView, ProdutoListAPIView
)
from api.views import SimularDepositoAPIView, CarrinhoAPIView

urlpatterns = [
    path('api/auth/login/', CustomLoginAPIView.as_view()),
    path('api/registro-vendedor/', RegistroVendedorAPIView.as_view()),
    path('api/registro-cliente/', RegistroClienteView.as_view()),
    path('api/planos/', PlanoListAPIView.as_view()),
    path('api/lojas/', LojaManagerAPIView.as_view(), name='loja-list-create'),
    path('api/checkout/', CheckoutAPIView.as_view()),
    path('api/produtos/', ProdutoListAPIView.as_view()),
    path('api/lojas/<int:pk>/', LojaDetailAPIView.as_view(), name='loja-detail'),
    path('api/vitrine/', VitrineGlobalAPIView.as_view(), name='vitrine-global'),
    path('api/lojas/<int:loja_id>/produtos/', ProdutoLojaAPIView.as_view(), name='loja-produtos'),
    path('api/produtos/<int:pk>/', ProdutoDetailView.as_view(), name='produto-detail'),
    path('api/carteira/deposito/', SimularDepositoAPIView.as_view(), name='simular-deposito'),
    path('api/carrinho/', CarrinhoAPIView.as_view(), name='gestao-carrinho'),
    path('api/checkout/', CheckoutAPIView.as_view(), name='checkout'),
    path('api/lojas/<int:loja_id>/pedidos/', PedidoListView.as_view(), name='loja-pedidos'),
    path('api/usuario/me/', ContaCRUDAPIView.as_view(), name='usuario-me'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)