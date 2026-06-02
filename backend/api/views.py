from django.shortcuts import render
from django.db import transaction
from django.db.models import F
from rest_framework.views import APIView
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


class CheckoutAPIView(APIView):
    def post(self, request):
        from .serializers import CheckoutSerializer
        from .models import Pagamento

        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        carrinho = validated_data['carrinho_objeto']

        try:
            with transaction.atomic():
                itens_carrinho = carrinho.itens.select_related('sku').all()
                sku_ids = [item.sku.id_sku for item in itens_carrinho]
                skus_db = VariacaoSKU.objects.select_for_update().filter(id_sku__in=sku_ids)
                sku_map = {sku.id_sku: sku for sku in skus_db}

                valor_total_pedido = 0
                itens_para_criar = []
                skus_para_atualizar = []

                for item in itens_carrinho:
                    sku_real = sku_map.get(item.sku.id_sku)

                    if not sku_real:
                        raise ValueError(f"SKU {item.sku.id_sku} não encontrado.")

                    if sku_real.quantidade_estoque < item.quantidade:
                        raise ValueError(f"Estoque insuficiente para {sku_real.produto.nome}.")

                    sku_real.quantidade_estoque -= item.quantidade
                    skus_para_atualizar.append(sku_real)
                    valor_total_pedido += (sku_real.preco_venda * item.quantidade)

                    itens_para_criar.append(
                        ItemPedido(
                            sku=sku_real,
                            quantidade=item.quantidade,
                            preco_venda_congelado=sku_real.preco_venda,
                            preco_custo_congelado=sku_real.custo
                        )
                    )

                pedido = Pedido.objects.create(
                    cliente=carrinho.cliente,
                    loja=carrinho.loja,
                    status='AGUARDANDO_PAGAMENTO',
                    valor_total=valor_total_pedido,
                    utm_source=validated_data.get('utm_source'),
                    utm_medium=validated_data.get('utm_medium'),
                    utm_campaign=validated_data.get('utm_campaign')
                )

                for item_pedido in itens_para_criar:
                    item_pedido.pedido = pedido
                ItemPedido.objects.bulk_create(itens_para_criar)
                VariacaoSKU.objects.bulk_update(skus_para_atualizar, ['quantidade_estoque'])

                Pagamento.objects.create(
                    pedido=pedido,
                    metodo_pagamento=validated_data['metodo_pagamento'],
                    status_transacao='PENDENTE'
                )

                carrinho.delete()

                return Response({
                    "mensagem": "Pedido realizado com sucesso.",
                    "pedido_id": pedido.id,
                    "status_pedido": pedido.status,
                    "valor_total": float(pedido.valor_total)
                }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"erro": "Erro interno ao processar o checkout."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
