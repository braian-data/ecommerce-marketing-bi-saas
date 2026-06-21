from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.db.models import Q
import uuid
from django.db import transaction
from decimal import Decimal, InvalidOperation
from .serializers import VitrineSerializer # Garanta esta importação
from django.db.models import F
from .models import Plano, ContaVendedor, ClienteFinal, Loja, Produto, Carrinho, ItemCarrinho
from .serializers import (
    PlanoSerializer, RegistroClienteSerializer, 
    RegistroVendedorSerializer, LoginSerializer, LojaSerializer, 
    ProdutoSerializer, CheckoutSerializer
)

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get('user_id')
        role = validated_token.get('role')

        usuario_db = None
        if role == 'ADMIN':
            usuario_db = ContaVendedor.objects.filter(id=user_id).first()
        elif role == 'CLIENTE':
            usuario_db = ClienteFinal.objects.filter(cpf=user_id).first()

        if not usuario_db:
            raise AuthenticationFailed('User not found no banco customizado', code='user_not_found')
        
        usuario_db.is_authenticated = True
        return usuario_db
    
class VitrineGlobalAPIView(APIView):
    permission_classes = [AllowAny] # Permite acesso sem token de Vendedor

    def get(self, request):
        # O select_related otimiza a query no banco de dados (evita N+1 problem)
        produtos = Produto.objects.select_related('loja').all()
        return Response(VitrineSerializer(produtos, many=True).data, status=status.HTTP_200_OK)

class CheckoutAPIView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request):
        if request.auth.payload.get('role') != 'CLIENTE':
            return Response({'erro': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        carrinho = serializer.validated_data['carrinho_objeto']
        cliente = carrinho.cliente

        # 1. Validação Financeira
        total = sum([item.quantidade * item.produto.preco for item in carrinho.itens.all()])
        if cliente.saldo < total:
            return Response({'erro': f'Saldo insuficiente. Necessário: R$ {total}'}, status=status.HTTP_402_PAYMENT_REQUIRED)

        # 2. Transferência de Custódia (I/O de Capital)
        cliente.saldo -= total
        cliente.save()
        
        vendedor = carrinho.loja.conta
        vendedor.saldo += total
        vendedor.save()

        # 3. Purga do Carrinho processado
        carrinho.delete()

        return Response({'mensagem': 'Pagamento aprovado. Saldo atualizado.'}, status=status.HTTP_200_OK)
class LojaManagerAPIView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendedor_id = request.auth.payload.get('user_id')
        lojas = Loja.objects.filter(conta_id=vendedor_id)
        return Response(LojaSerializer(lojas, many=True).data)

    def post(self, request):
        vendedor_id = request.auth.payload.get('user_id')
        try:
            vendedor = ContaVendedor.objects.select_related('plano').get(id=vendedor_id)
            lojas_atuais = Loja.objects.filter(conta_id=vendedor_id).count()
            if lojas_atuais >= vendedor.plano.limite_lojas:
                return Response({'erro': 'Limite de lojas atingido.'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = LojaSerializer(data=request.data)
            if serializer.is_valid():
                subdominio = f"{serializer.validated_data['nome_loja'][:10].lower()}-{uuid.uuid4().hex[:4]}"
                serializer.save(conta_id=vendedor_id, subdominio=subdominio)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except ContaVendedor.DoesNotExist:
            return Response({'erro': 'Vendedor não encontrado'}, status=status.HTTP_404_NOT_FOUND)

class CustomLoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        identificador = serializer.validated_data['identificador'].strip()
        tipo_usuario = serializer.validated_data['tipo_usuario'].upper().strip()
        senha = serializer.validated_data['senha']
        
        usuario_db = None
        user_id = None
        senha_valida = False
        
        if tipo_usuario == 'ADMIN':
            usuario_db = ContaVendedor.objects.filter(Q(email_adm__iexact=identificador) | Q(login__iexact=identificador)).first()
            if usuario_db:
                user_id = usuario_db.id
                senha_valida = check_password(senha, usuario_db.senha)
        elif tipo_usuario == 'CLIENTE':
            usuario_db = ClienteFinal.objects.filter(cpf=identificador).first()
            if usuario_db:
                user_id = usuario_db.cpf
                senha_valida = check_password(senha, usuario_db.senha)

        if not usuario_db or not senha_valida:
            return Response({'erro': 'Credenciais inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken()
        refresh['user_id'] = str(user_id)
        refresh['role'] = tipo_usuario
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh), 'role': tipo_usuario}, status=status.HTTP_200_OK)

class PlanoListAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request): return Response(PlanoSerializer(Plano.objects.all(), many=True).data)

class ProdutoListAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request): return Response(ProdutoSerializer(Produto.objects.all(), many=True).data)

class RegistroClienteView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegistroClienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensagem': 'Cliente registrado.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegistroVendedorAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegistroVendedorSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({'mensagem': 'Administrador registrado.'}, status=status.HTTP_201_CREATED)
class LojaDetailAPIView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        vendedor_id = request.auth.payload.get('user_id')
        try:
            # Busca a loja pelo ID (pk) garantindo que pertence ao vendedor logado
            loja = Loja.objects.get(pk=pk, conta_id=vendedor_id)
            return Response(LojaSerializer(loja).data, status=status.HTTP_200_OK)
        except Loja.DoesNotExist:
            return Response({'erro': 'Loja não encontrada ou acesso negado.'}, status=status.HTTP_404_NOT_FOUND)
class ProdutoLojaAPIView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, loja_id):
        vendedor_id = request.auth.payload.get('user_id')
        if not Loja.objects.filter(id=loja_id, conta_id=vendedor_id).exists():
            return Response({'erro': 'Acesso negado'}, status=status.HTTP_403_FORBIDDEN)
            
        produtos = Produto.objects.filter(loja_id=loja_id)
        return Response(ProdutoSerializer(produtos, many=True).data)

    def post(self, request, loja_id):
        vendedor_id = request.auth.payload.get('user_id')
        
        # Recupera a instância da loja para garantir o vínculo seguro
        loja_instancia = Loja.objects.filter(id=loja_id, conta_id=vendedor_id).first()
        if not loja_instancia:
            return Response({'erro': 'Acesso negado'}, status=status.HTTP_403_FORBIDDEN)

        # Passa os dados brutos sem tentar mutar o QueryDict
        serializer = ProdutoSerializer(data=request.data)
        if serializer.is_valid():
            # INJEÇÃO RELACIONAL CORRETA NA PERSISTÊNCIA
            serializer.save(loja=loja_instancia)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class SimularDepositoAPIView(APIView):
    """ Endpoint de simulação de injeção de capital (Fictício) """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        valor_bruto = request.data.get('valor')

        # 1. Bloqueio de Nulos e Vazios
        if valor_bruto is None or valor_bruto == '':
            return Response({'erro': 'Valor de depósito ausente.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 2. Sanitização Forçada: Converte para string e padroniza o separador decimal
            valor_str = str(valor_bruto).replace(',', '.')
            valor = Decimal(valor_str)
        except (InvalidOperation, ValueError, TypeError):
            # Exposição do valor anômalo no log de retorno para debug
            return Response({'erro': f'Formato financeiro inválido recebido: {valor_bruto}'}, status=status.HTTP_400_BAD_REQUEST)

        if valor <= Decimal('0'):
            return Response({'erro': 'O valor do depósito deve ser superior a zero.'}, status=status.HTTP_400_BAD_REQUEST)

        role = request.auth.payload.get('role')
        user_id = request.auth.payload.get('user_id')

        try:
            if role == 'CLIENTE':
                usuario = ClienteFinal.objects.get(cpf=user_id)
            elif role == 'ADMIN':
                usuario = ContaVendedor.objects.get(id=user_id)
            else:
                return Response({'erro': 'Role não autorizada para transações.'}, status=status.HTTP_403_FORBIDDEN)

            # 3. Transação Segura
            usuario.saldo += valor
            usuario.save()
            return Response({'mensagem': 'Depósito concluído.', 'saldo_atual': str(usuario.saldo)})
        except Exception as e:
            return Response({'erro': f'Falha interna na transação: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CarrinhoAPIView(APIView):
    """ Gestão do Carrinho do Cliente """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.auth.payload.get('role') != 'CLIENTE':
            return Response({'erro': 'Apenas clientes possuem carrinho.'}, status=status.HTTP_403_FORBIDDEN)
        
        cpf = request.auth.payload.get('user_id')
        cliente = ClienteFinal.objects.get(cpf=cpf)
        
        # Extrai carrinhos ativos e calcula o total
        carrinhos = Carrinho.objects.filter(cliente=cliente).prefetch_related('itens__produto')
        dados = []
        for car in carrinhos:
            itens_dados = []
            total_carrinho = 0
            for item in car.itens.all():
                subtotal = item.quantidade * float(item.produto.preco)
                total_carrinho += subtotal
                itens_dados.append({
                    'produto_id': item.produto.id,
                    'nome': item.produto.nome,
                    'preco': item.produto.preco,
                    'quantidade': item.quantidade,
                    'subtotal': subtotal
                })
            dados.append({
                'carrinho_id': car.id,
                'loja_nome': car.loja.nome_loja,
                'total': total_carrinho,
                'itens': itens_dados
            })
        
        return Response({'saldo_disponivel': cliente.saldo, 'carrinhos': dados})

    def post(self, request):
        if request.auth.payload.get('role') != 'CLIENTE':
            return Response({'erro': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)

        cpf = request.auth.payload.get('user_id')
        produto_id = request.data.get('produto_id')
        quantidade = int(request.data.get('quantidade', 1))

        try:
            produto = Produto.objects.get(id=produto_id)
            cliente = ClienteFinal.objects.get(cpf=cpf)
            
            # Isola carrinhos por loja (Multi-Tenant)
            carrinho, _ = Carrinho.objects.get_or_create(loja=produto.loja, cliente=cliente)
            
            item, created = ItemCarrinho.objects.get_or_create(carrinho=carrinho, produto=produto)
            if not created:
                item.quantidade += quantidade
            else:
                item.quantidade = quantidade
            item.save()

            return Response({'mensagem': 'Item adicionado ao carrinho com sucesso.'})
        except Produto.DoesNotExist:
            return Response({'erro': 'Produto inexistente.'}, status=status.HTTP_404_NOT_FOUND)