from django.db import models


class Plano(models.Model):
    nome = models.CharField(max_length=100)
    limite_lojas = models.IntegerField()
    limite_imagens = models.IntegerField()
    limite_api = models.IntegerField()
    espaco_armazenamento = models.IntegerField()

    def __str__(self):
        return self.nome


class ContaVendedor(models.Model):
    plano = models.ForeignKey(Plano, on_delete=models.CASCADE)
    email_adm = models.EmailField()
    login = models.CharField(max_length=100)
    senha = models.CharField(max_length=100)

    def __str__(self):
        return self.login


class Loja(models.Model):
    conta = models.ForeignKey(ContaVendedor, on_delete=models.CASCADE)
    nome_loja = models.CharField(max_length=150)
    cnpj = models.CharField(max_length=18)
    configuracoes_marketing = models.JSONField()
    subdominio = models.CharField(max_length=100)

    def __str__(self):
        return self.nome_loja


class ClienteFinal(models.Model):
    cpf = models.CharField(max_length=14, primary_key=True)
    nome = models.CharField(max_length=150)
    email = models.EmailField()
    senha = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


class Produto(models.Model):
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE)
    nome = models.CharField(max_length=150)
    categoria = models.CharField(max_length=100)
    descricao = models.TextField()

    def __str__(self):
        return self.nome


class VariacaoSKU(models.Model):
    id_sku = models.CharField(max_length=50, primary_key=True)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2)
    custo = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade_estoque = models.IntegerField()
    atributo = models.JSONField()

    def __str__(self):
        return self.id_sku


class Pedido(models.Model):
    cliente = models.ForeignKey(ClienteFinal, on_delete=models.CASCADE)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE)

    data_hora = models.DateTimeField()
    status = models.CharField(max_length=50)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)

    utm_source = models.CharField(max_length=100, blank=True, null=True)
    utm_medium = models.CharField(max_length=100, blank=True, null=True)
    utm_campaign = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Pedido {self.id}"


class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    sku = models.ForeignKey(VariacaoSKU, on_delete=models.CASCADE)

    quantidade = models.IntegerField()

    preco_venda_congelado = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    preco_custo_congelado = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"Item {self.id}"


class Imagem(models.Model):
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)

    ordem_exibicao = models.IntegerField()
    url_arquivo = models.CharField(max_length=255)

    def __str__(self):
        return self.url_arquivo


class EventoBI(models.Model):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    loja = models.ForeignKey(
        Loja,
        on_delete=models.CASCADE
    )

    tipo_evento = models.CharField(max_length=100)
    data_hora = models.DateTimeField()

    payload_contexto = models.JSONField()

    def __str__(self):
        return self.tipo_evento