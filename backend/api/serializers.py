from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Produto, Plano, Pedido
from .models import (
    Carrinho, Loja, ContaVendedor, ClienteFinal, 
    EventoBI, Plano, Produto, VariacaoSKU
)
class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido # Certifique-se de importar o modelo Pedido no topo
        fields = '__all__'

class CheckoutSerializer(serializers.Serializer):
    carrinho_id = serializers.IntegerField(required=True)
    metodo_pagamento = serializers.ChoiceField(choices=['PIX', 'BOLETO', 'CARTAO'], required=True)
    
    utm_source = serializers.CharField(max_length=100, required=False, allow_null=True, default=None)
    utm_medium = serializers.CharField(max_length=100, required=False, allow_null=True, default=None)
    utm_campaign = serializers.CharField(max_length=100, required=False, allow_null=True, default=None)

    def validate(self, data):
        try:
            carrinho = Carrinho.objects.select_related('loja', 'cliente').get(id=data['carrinho_id'])
        except Carrinho.DoesNotExist:
            raise serializers.ValidationError({"carrinho_id": "Carrinho não encontrado ou inválido."})

        if not carrinho.itens.exists():
            raise serializers.ValidationError({"carrinho_id": "Não é possível finalizar um carrinho vazio."})

        data['carrinho_objeto'] = carrinho
        return data

class RegistroVendedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContaVendedor
        fields = ['plano', 'email_adm', 'login', 'senha']
        extra_kwargs = {'senha': {'write_only': True}} 

    def create(self, validated_data):
        validated_data['senha'] = make_password(validated_data['senha'])
        return super().create(validated_data)

class LoginSerializer(serializers.Serializer):
    identificador = serializers.CharField(required=True)
    senha = serializers.CharField(required=True, write_only=True)
    tipo_usuario = serializers.ChoiceField(choices=['ADMIN', 'COMUM', 'CLIENTE'], required=True)

class EventoBISerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoBI
        fields = ['loja', 'pedido', 'tipo_evento', 'payload_contexto']

class PlanoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plano
        fields = '__all__'

# CORREÇÃO APLICADA AQUI: Herança direta do ModelSerializer sem o auth.User
class RegistroClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteFinal
        fields = ['cpf', 'nome', 'email', 'senha']
        extra_kwargs = {
            'senha': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['senha'] = make_password(validated_data['senha'])
        return super().create(validated_data)

class LojaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loja
        fields = ['id', 'nome_loja', 'cnpj']

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'descricao', 'preco', 'categoria', 'imagem', 'loja']
        extra_kwargs = {
            'loja': {'read_only': True}
        }
class VitrineSerializer(serializers.ModelSerializer):
    # Extrai o nome da loja associada à Foreign Key
    nome_loja = serializers.CharField(source='loja.nome_loja', read_only=True)

    class Meta:
        model = Produto
        fields = ['id', 'nome', 'descricao', 'preco', 'categoria', 'imagem', 'loja', 'nome_loja']