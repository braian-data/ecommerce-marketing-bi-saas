from django.shortcuts import render
from django.db import transaction
from django.db.models import F
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import VariacaoSKU, Pedido, ItemPedido, ClienteFinal, Loja

@api_view(['POST'])
def realizar_compra(request):
    id_sku = request.data.get('id_sku')
    quantidade = request.data.get('quantidade')
    cpf_cliente = request.data.get('cpf_cliente')
    id_loja = request.data.get('id_loja')

    if not all([id_sku, quantidade, cpf_cliente, id_loja]):
        return Response(
            {'erro': 'Dados incompletos'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        with transaction.atomic():
            sku = VariacaoSKU.objects.select_for_update().get(id_sku=id_sku)

            if sku.quantidade_estoque < quantidade:
                return Response(
                    {'erro': 'Estoque insuficiente'},
                    status=status.HTTP_409_CONFLICT
                )

            cliente = ClienteFinal.objects.get(cpf=cpf_cliente)
            loja = Loja.objects.get(id=id_loja)

            pedido = Pedido.objects.create(
                cliente=cliente,
                loja=loja,
                status='pendente',
                valor_total=sku.preco_venda * quantidade
            )

            ItemPedido.objects.create(
                pedido=pedido,
                sku=sku,
                quantidade=quantidade,
                preco_venda_congelado=sku.preco_venda,
                preco_custo_congelado=sku.custo
            )

            sku.quantidade_estoque = F('quantidade_estoque') - quantidade
            sku.save()

        return Response(
            {'sucesso': True, 'pedido_id': pedido.id},
            status=status.HTTP_201_CREATED
        )

    except VariacaoSKU.DoesNotExist:
        return Response(
            {'erro': 'SKU não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except ClienteFinal.DoesNotExist:
        return Response(
            {'erro': 'Cliente não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
