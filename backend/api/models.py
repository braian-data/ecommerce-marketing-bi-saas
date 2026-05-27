from django.db import models

class Plano(models.Model):
    nome = models.CharField(max_length=100)
    limite_lojas = models.IntegerField()
    limite_imagens = models.IntegerField()
    limite_api = models.IntegerField()
    espaco_armazenamento = models.IntegerField()

    class Meta:
        db_table = 'plano'

class ContaVendedor(models.Model):
    plano = models.ForeignKey(Plano, on_delete=models.PROTECT) # Correção: PROTECT
    email_adm = models.EmailField(unique=True)
    login = models.CharField(max_length=100, unique=True)
    senha = models.CharField(max_length=100)

    class Meta:
        db_table = 'conta_vendedor'

class Loja(models.Model):
    conta = models.ForeignKey(ContaVendedor, on_delete=models.CASCADE)
    nome_loja = models.CharField(max_length=150)
    cnpj = models.CharField(max_length=18, unique=True) # Correção: unique=True
    configuracoes_marketing = models.JSONField(default=dict)
    subdominio = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'loja'

class ClienteFinal(models.Model):
    cpf = models.CharField(max_length=14, primary_key=True)
    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True) # Correção: unique=True
    senha = models.CharField(max_length=100)

    class Meta:
        db_table = 'cliente_final'

class Produto(models.Model):
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE)
    nome = models.CharField(max_length=150)
    categoria = models.CharField(max_length=100)
    descricao = models.TextField()

    class Meta:
        db_table = 'produto'

class VariacaoSKU(models.Model):
    id_sku = models.CharField(max_length=50, primary_key=True)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    id_pixel = models.IntegerField(null=True, blank=True)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2)
    custo = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade_estoque = models.IntegerField(default=0)
    atributo = models.JSONField(default=dict)

    class Meta:
        db_table = 'variacao_sku'

class Pedido(models.Model):
    cliente = models.ForeignKey(ClienteFinal, on_delete=models.PROTECT)
    loja = models.ForeignKey(Loja, on_delete=models.PROTECT)
    data_hora = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)
    utm_source = models.CharField(max_length=100, blank=True, null=True)
    utm_medium = models.CharField(max_length=100, blank=True, null=True)
    utm_campaign = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'pedido'

class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    sku = models.ForeignKey(VariacaoSKU, on_delete=models.PROTECT)
    quantidade = models.IntegerField()
    preco_venda_congelado = models.DecimalField(max_digits=10, decimal_places=2)
    preco_custo_congelado = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'item_pedido'

class Imagem(models.Model):
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    ordem_exibicao = models.IntegerField()
    url_arquivo = models.CharField(max_length=255)

    class Meta:
        db_table = 'imagem'

class EventoBI(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.SET_NULL, null=True, blank=True)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE)
    tipo_evento = models.CharField(max_length=100)
    data_hora = models.DateTimeField(auto_now_add=True)
    payload_contexto = models.JSONField(default=dict)

    class Meta:
        db_table = 'evento_bi'