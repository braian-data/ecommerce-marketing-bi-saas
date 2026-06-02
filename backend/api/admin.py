from django.contrib import admin
from .models import * 

# Registra os modelos um por um
admin.site.register(Plano)
admin.site.register(ContaVendedor)
admin.site.register(Loja)
admin.site.register(ClienteFinal)
admin.site.register(Produto)
admin.site.register(VariacaoSKU)
admin.site.register(Pedido)
admin.site.register(ItemPedido)
admin.site.register(Imagem)
admin.site.register(EventoBI)
admin.site.register(Carrinho)
admin.site.register(ItemCarrinho)