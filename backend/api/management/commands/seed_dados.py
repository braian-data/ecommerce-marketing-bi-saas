from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import Plano, ContaVendedor, Loja, ClienteFinal, Produto, VariacaoSKU
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Popula o banco de dados com massa de testes massiva.'

    def handle(self, *args, **kwargs):
        fake = Faker('pt_BR')
        
        self.stdout.write('Iniciando Seeding...')

        with transaction.atomic():
            # 1. Criar Plano Base
            plano, _ = Plano.objects.get_or_create(
                nome="Enterprise", 
                defaults={
                    'limite_lojas': 999, 
                    'limite_imagens': 999, 
                    'limite_api': 9999, 
                    'espaco_armazenamento': 50000
                }
            )

            # 2. Criar Vendedor e Loja
            vendedor, _ = ContaVendedor.objects.get_or_create(
                login="admin_seeding",
                defaults={
                    'plano': plano, 
                    'email_adm': "admin@vooap.com", 
                    'senha': "hash_temporario"
                }
            )
            
            loja, _ = Loja.objects.get_or_create(
                cnpj="00000000000100",
                defaults={
                    'conta': vendedor, 
                    'nome_loja': "Loja Demo Vooap", 
                    'subdominio': "demo"
                }
            )

            # 3. Gerar Clientes em Lote (10.000 clientes)
            self.stdout.write('Gerando 10.000 clientes (isso pode levar alguns segundos)...')
            clientes = [
                ClienteFinal(
                    cpf=fake.unique.cpf().replace('.', '').replace('-', ''),
                    nome=fake.name(),
                    email=fake.unique.email(),
                    senha="senha_padrao"
                ) for _ in range(10000)
            ]
            # O ignore_conflicts=True evita que o script quebre se rodado mais de uma vez
            ClienteFinal.objects.bulk_create(clientes, ignore_conflicts=True) 

            # 4. Gerar Produtos e SKUs
            self.stdout.write('Gerando 500 produtos e suas variações...')
            produtos = [
                Produto(
                    loja=loja, 
                    nome=fake.catch_phrase(), 
                    categoria=fake.word().capitalize(), 
                    descricao=fake.text()
                )
                for _ in range(500)
            ]
            Produto.objects.bulk_create(produtos)
            
            # Recupera IDs para as Variações
            produtos_db = list(Produto.objects.filter(loja=loja))
            skus = []
            for prod in produtos_db:
                skus.append(
                    VariacaoSKU(
                        id_sku=f"SKU-{prod.id}-{random.randint(1000, 9999)}",
                        produto=prod,
                        preco_venda=random.uniform(50.0, 500.0),
                        custo=random.uniform(10.0, 40.0),
                        quantidade_estoque=random.randint(10, 1000)
                    )
                )
            VariacaoSKU.objects.bulk_create(skus)

        self.stdout.write(self.style.SUCCESS('Seeding concluído com sucesso! Banco de dados populado.'))