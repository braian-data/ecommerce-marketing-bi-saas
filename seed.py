import random
import json
from datetime import datetime, timedelta

import psycopg2
from faker import Faker

DB_HOST     = "localhost"
DB_PORT     = 54324
DB_NAME     = "vooap_db"
DB_USER     = "vooap_user"
DB_PASSWORD = "vooap_pass"

QTD_CONTAS              = 20
QTD_LOJAS               = 30
QTD_CLIENTES            = 500
QTD_PRODUTOS            = 200
QTD_SKUS_POR_PRODUTO    = 3
QTD_IMAGENS_POR_PRODUTO = 2
QTD_PEDIDOS             = 1000
QTD_EVENTOS             = 2000
QTD_CARRINHOS           = 200

fake = Faker("pt_BR")
Faker.seed(42)
random.seed(42)

data_inicio = datetime.now() - timedelta(days=180)

def data_aleatoria():
    return data_inicio + timedelta(seconds=random.randint(0, 180 * 24 * 3600))


def gerar_planos():
    return [
        ("Free",       1,  5,   100,   512),
        ("Starter",    3,  20,  1000,  2048),
        ("Pro",        10, 100, 5000,  10240),
        ("Enterprise", 50, 500, 99999, 102400),
    ]


def gerar_contas(plano_ids):
    contas = []
    for i in range(QTD_CONTAS):
        contas.append((
            plano_ids[i % len(plano_ids)],
            fake.company_email(),
            fake.user_name() + str(i),
            fake.password(length=12),
        ))
    return contas


def gerar_lojas(conta_ids):
    lojas = []
    subdominios = set()
    for i in range(QTD_LOJAS):
        while True:
            sub = fake.slug()[:20]
            if sub not in subdominios:
                subdominios.add(sub)
                break
        lojas.append((
            conta_ids[i % len(conta_ids)],
            fake.company()[:150],
            fake.cnpj(),
            json.dumps({"cor_primaria": fake.hex_color(), "banner_ativo": fake.boolean()}),
            sub,
        ))
    return lojas


def gerar_clientes():
    clientes = []
    cpfs = set()
    emails = set()
    for _ in range(QTD_CLIENTES):
        while True:
            cpf = fake.cpf()
            if cpf not in cpfs:
                cpfs.add(cpf)
                break
        while True:
            email = fake.email()
            if email not in emails:
                emails.add(email)
                break
        clientes.append((cpf, fake.name()[:150], email, fake.password(length=10)))
    return clientes


def gerar_produtos(loja_ids):
    categorias = ["Eletrônicos", "Moda", "Casa", "Esportes", "Beleza", "Brinquedos", "Livros", "Alimentos"]
    produtos = []
    for _ in range(QTD_PRODUTOS):
        produtos.append((
            random.choice(loja_ids),
            fake.catch_phrase()[:150],
            random.choice(categorias),
            fake.paragraph(nb_sentences=3),
        ))
    return produtos


def gerar_skus(produto_ids):
    skus = []
    sku_codes = set()
    for produto_id in produto_ids:
        for _ in range(QTD_SKUS_POR_PRODUTO):
            while True:
                code = fake.bothify(text="SKU-????-###")
                if code not in sku_codes:
                    sku_codes.add(code)
                    break
            preco = round(random.uniform(19.90, 999.90), 2)
            custo = round(preco * random.uniform(0.3, 0.7), 2)
            atributo = json.dumps({
                "cor": random.choice(["Preto", "Branco", "Azul", "Vermelho", "Verde"]),
                "tamanho": random.choice(["PP", "P", "M", "G", "GG", "Único"]),
            })
            skus.append((code, produto_id, preco, custo, random.randint(0, 500), atributo))
    return skus


def gerar_imagens(produto_ids):
    imagens = []
    for produto_id in produto_ids:
        for ordem in range(1, QTD_IMAGENS_POR_PRODUTO + 1):
            imagens.append((
                produto_id,
                ordem,
                f"https://picsum.photos/seed/{produto_id}{ordem}/800/800",
            ))
    return imagens


def gerar_pedidos(cliente_cpfs, loja_ids):
    status_opcoes = ["AGUARDANDO_PAGAMENTO", "PAGO", "ENVIADO", "ENTREGUE", "CANCELADO"]
    utm_sources   = ["google", "facebook", "instagram", "email", "direto"]
    pedidos = []
    for _ in range(QTD_PEDIDOS):
        pedidos.append((
            random.choice(cliente_cpfs),
            random.choice(loja_ids),
            data_aleatoria(),
            round(random.uniform(50, 2000), 2),
            random.choice(status_opcoes),
            random.choice(utm_sources),
            random.choice(["cpc", "organico", "social", None]),
            random.choice(["black_friday", "natal", "verao", None]),
        ))
    return pedidos


def gerar_itens_pedido(pedido_ids, sku_codes):
    itens = []
    for pedido_id in pedido_ids:
        sku = random.choice(sku_codes)
        preco = round(random.uniform(19.90, 999.90), 2)
        custo = round(preco * random.uniform(0.3, 0.7), 2)
        itens.append((pedido_id, sku, random.randint(1, 5), preco, custo))
    return itens


def gerar_pagamentos(pedido_ids):
    metodos = ["cartao_credito", "pix", "boleto", "cartao_debito"]
    status  = ["aprovado", "pendente", "recusado"]
    pags = []
    for pedido_id in pedido_ids:
        pags.append((
            pedido_id,
            random.choice(metodos),
            random.choice(status),
            fake.bothify(text="TXN-########"),
            data_aleatoria(),
        ))
    return pags


def gerar_eventos(pedido_ids, loja_ids):
    tipos = ["page_view", "add_to_cart", "checkout_started", "purchase", "abandoned_cart", "product_view"]
    eventos = []
    for _ in range(QTD_EVENTOS):
        payload = json.dumps({"user_agent": fake.user_agent(), "ip": fake.ipv4(), "pagina": fake.uri_path()})
        eventos.append((random.choice(pedido_ids), random.choice(loja_ids), random.choice(tipos), data_aleatoria(), payload))
    return eventos


def gerar_carrinhos(loja_ids, cliente_cpfs):
    carrinhos = []
    usados = set()
    for _ in range(QTD_CARRINHOS):
        while True:
            loja_id = random.choice(loja_ids)
            cpf     = random.choice(cliente_cpfs)
            if (loja_id, cpf) not in usados:
                usados.add((loja_id, cpf))
                break
        carrinhos.append((loja_id, cpf, data_aleatoria(), data_aleatoria()))
    return carrinhos


def gerar_itens_carrinho(carrinho_ids, sku_codes):
    itens = []
    usados = set()
    for carrinho_id in carrinho_ids:
        for _ in range(random.randint(1, 3)):
            sku = random.choice(sku_codes)
            if (carrinho_id, sku) not in usados:
                usados.add((carrinho_id, sku))
                itens.append((carrinho_id, sku, random.randint(1, 5), data_aleatoria()))
    return itens


def inserir(cursor, tabela, colunas, dados, label):
    placeholders = ", ".join(["%s"] * len(colunas))
    cols = ", ".join(colunas)
    sql = f"INSERT INTO {tabela} ({cols}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
    cursor.executemany(sql, dados)
    print(f"  {label}: {len(dados)} registros")


def buscar_ids(cursor, tabela, coluna="id"):
    cursor.execute(f"SELECT {coluna} FROM {tabela}")
    return [row[0] for row in cursor.fetchall()]


def main():
    try:
        conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
    except Exception as e:
        print(f"Erro ao conectar no banco: {e}")
        return

    cursor = conn.cursor()

    try:
        planos = gerar_planos()
        inserir(cursor, "plano", ["nome", "limite_lojas", "limite_imagens", "limite_api", "espaco_armazenamento"], planos, "planos")
        conn.commit()
        plano_ids = buscar_ids(cursor, "plano")

        contas = gerar_contas(plano_ids)
        inserir(cursor, "conta_vendedor", ["plano_id", "email_adm", "login", "senha"], contas, "contas")
        conn.commit()
        conta_ids = buscar_ids(cursor, "conta_vendedor")

        lojas = gerar_lojas(conta_ids)
        inserir(cursor, "loja", ["conta_id", "nome_loja", "cnpj", "configuracoes_marketing", "subdominio"], lojas, "lojas")
        conn.commit()
        loja_ids = buscar_ids(cursor, "loja")

        clientes = gerar_clientes()
        inserir(cursor, "cliente_final", ["cpf", "nome", "email", "senha"], clientes, "clientes")
        conn.commit()
        cliente_cpfs = buscar_ids(cursor, "cliente_final", "cpf")

        produtos = gerar_produtos(loja_ids)
        inserir(cursor, "produto", ["loja_id", "nome", "categoria", "descricao"], produtos, "produtos")
        conn.commit()
        produto_ids = buscar_ids(cursor, "produto")

        skus = gerar_skus(produto_ids)
        inserir(cursor, "variacao_sku", ["id_sku", "produto_id", "preco_venda", "custo", "quantidade_estoque", "atributo"], skus, "skus")
        conn.commit()
        sku_codes = buscar_ids(cursor, "variacao_sku", "id_sku")

        imagens = gerar_imagens(produto_ids)
        inserir(cursor, "imagem", ["produto_id", "ordem_exibicao", "url_arquivo"], imagens, "imagens")
        conn.commit()

        pedidos = gerar_pedidos(cliente_cpfs, loja_ids)
        inserir(cursor, "pedido", ["cliente_id", "loja_id", "data_hora", "valor_total", "status", "utm_source", "utm_medium", "utm_campaign"], pedidos, "pedidos")
        conn.commit()
        pedido_ids = buscar_ids(cursor, "pedido")

        itens = gerar_itens_pedido(pedido_ids, sku_codes)
        inserir(cursor, "item_pedido", ["pedido_id", "sku_id", "quantidade", "preco_venda_congelado", "preco_custo_congelado"], itens, "itens de pedido")
        conn.commit()

        pagamentos = gerar_pagamentos(pedido_ids)
        inserir(cursor, "pagamento", ["pedido_id", "metodo_pagamento", "status_transacao", "id_transacao_gateway", "data_atualizacao"], pagamentos, "pagamentos")
        conn.commit()

        eventos = gerar_eventos(pedido_ids, loja_ids)
        inserir(cursor, "evento_bi", ["pedido_id", "loja_id", "tipo_evento", "data_hora", "payload_contexto"], eventos, "eventos de BI")
        conn.commit()

        carrinhos = gerar_carrinhos(loja_ids, cliente_cpfs)
        inserir(cursor, "carrinho", ["loja_id", "cliente_id", "data_criacao", "data_atualizacao"], carrinhos, "carrinhos")
        conn.commit()
        carrinho_ids = buscar_ids(cursor, "carrinho")

        itens_carrinho = gerar_itens_carrinho(carrinho_ids, sku_codes)
        inserir(cursor, "item_carrinho", ["carrinho_id", "sku_id", "quantidade", "data_adicionado"], itens_carrinho, "itens de carrinho")
        conn.commit()

        print("\nSeeding concluído.")

    except Exception as e:
        conn.rollback()
        print(f"Erro durante o seeding: {e}")

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
