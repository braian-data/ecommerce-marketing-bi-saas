from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Pedido, ItemPedido, Pagamento, VariacaoSKU
from .serializers import CheckoutSerializer

class CheckoutAPIView(APIView):
    def post(self, request):
        # 1. Validação do Payload de entrada
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        validated_data = serializer.validated_data
        carrinho = validated_data['carrinho_objeto']
        
        try:
            # Bloco de Transação Atômica: tudo ou nada
            with transaction.atomic():
                
                # 2. Bloqueio de concorrência (Row-Level Locking) dos SKUs do carrinho
                itens_carrinho = carrinho.itens.select_related('sku').all()
                sku_ids = [item.sku.id_sku for item in itens_carrinho]
                
                # O select_for_update() trava os registros até o fim do bloco 'with'
                skus_db = VariacaoSKU.objects.select_for_update().filter(id_sku__in=sku_ids)
                sku_map = {sku.id_sku: sku for sku in skus_db}
                
                valor_total_pedido = 0
                itens_para_criar = []
                skus_para_atualizar = []

                # 3. Validação de Estoque e Cálculo Financeiro
                for item in itens_carrinho:
                    sku_real = sku_map.get(item.sku.id_sku)
                    
                    if not sku_real:
                        raise ValueError(f"SKU {item.sku.id_sku} não encontrado no catálogo.")
                    
                    # Verificação de disponibilidade de estoque
                    if sku_real.quantidade_estoque < item.quantidade:
                        raise ValueError(f"Estoque insuficiente para o produto: {sku_real.produto.nome} ({sku_real.id_sku}). Disponível: {sku_real.quantidade_estoque}")
                    
                    # Reserva temporária de estoque em memória
                    sku_real.quantidade_estoque -= item.quantidade
                    skus_para_atualizar.append(sku_real)
                    
                    # Acumula o valor total
                    valor_total_pedido += (sku_real.preco_venda * item.quantidade)
                    
                    # Prepara a gravação do item com os preços CONGELADOS do momento (Regra 3)
                    itens_para_criar.append(
                        ItemPedido(
                            sku=sku_real,
                            quantidade=item.quantidade,
                            preco_venda_congelado=sku_real.preco_venda,
                            preco_custo_congelado=sku_real.custo
                        )
                    )

                # 4. Persistência do Pedido (SaaS Tenant-Isolated)
                pedido = Pedido.objects.create(
                    cliente=carrinho.cliente,
                    loja=carrinho.loja,
                    status='AGUARDANDO_PAGAMENTO',
                    valor_total=valor_total_pedido,
                    utm_source=validated_data.get('utm_source'),
                    utm_medium=validated_data.get('utm_medium'),
                    utm_campaign=validated_data.get('utm_campaign')
                )

                # 5. Vincula os itens gerados ao Pedido criado e salva em lote (Bulk Create)
                for item_pedido in itens_para_criar:
                    item_pedido.pedido = pedido
                ItemPedido.objects.bulk_create(itens_para_criar)

                # 6. Atualiza o estoque das variações em lote no banco de dados
                VariacaoSKU.objects.bulk_update(skus_para_atualizar, ['quantidade_estoque'])

                # 7. Criação do Registro de Pagamento Pendente
                Pagamento.objects.create(
                    pedido=pedido,
                    metodo_pagamento=validated_data['metodo_pagamento'],
                    status_transacao='PENDENTE'
                )

                # 8. Limpeza do Carrinho (Esvaziamento pós-checkout)
                carrinho.delete()

                # Resposta de Sucesso
                return Response({
                    "mensagem": "Pedido e checkout realizados com sucesso.",
                    "pedido_id": pedido.id,
                    "status_pedido": pedido.status,
                    "valor_total": float(pedido.valor_total)
                }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            # Qualquer exceção disparada aqui dentro cancela todas as alterações feitas acima automaticamente
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({"erro": "Erro interno ao processar o checkout."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)