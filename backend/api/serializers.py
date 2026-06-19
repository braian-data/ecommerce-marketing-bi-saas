from rest_framework import serializers
from .models import Carrinho, Loja, ContaVendedor
from .models import Produto

class CheckoutSerializer(serializers.Serializer):
    carrinho_id = serializers.IntegerField(required=True)
    metodo_pagamento = serializers.ChoiceField(choices=['PIX', 'BOLETO', 'CARTAO'], required=True)
    
    # Parâmetros opcionais de rastreamento de marketing (Regra 4 do Mini-Mundo)
    utm_source = serializers.CharField(max_length=100, required=False, allow_null=True, default=None)
    utm_medium = serializers.CharField(max_length=100, required=False, allow_null=True, default=None)
    utm_campaign = serializers.CharField(max_length=100, required=False, allow_null=True, default=None)

    def validate(self, data):
        try:
            # O select_related previne múltiplas consultas ao banco de dados (N+1)
            carrinho = Carrinho.objects.select_related('loja', 'cliente').get(id=data['carrinho_id'])
        except Carrinho.DoesNotExist:
            raise serializers.ValidationError({"carrinho_id": "Carrinho não encontrado ou inválido."})

        if not carrinho.itens.exists():
            raise serializers.ValidationError({"carrinho_id": "Não é possível finalizar um carrinho vazio."})

        # Injeta o objeto carrinho validado no dicionário de dados para uso na View
        data['carrinho_objeto'] = carrinho
        return data
class LojaSerializer(serializers.ModelSerializer):
    conta = serializers.PrimaryKeyRelatedField(
        queryset= ContaVendedor.objects.all()
    )

    class Meta:
        model = Loja
        fields = [
            'id',
            'conta',
            'nome_loja',
            'cnpj',
            'configuracoes_marketing',
            'subdominio',
        ]

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'
