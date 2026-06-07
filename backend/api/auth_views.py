from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ContaVendedor, ClienteFinal


@api_view(['POST'])
def register_user(request):
    nome = request.data.get('nome')
    email = request.data.get('email')
    senha = request.data.get('senha')
    tipo = request.data.get('tipo', 'COMUM')

    if not email or not senha:
        return Response(
            {"erro": "Email e senha são obrigatórios"},
            status=status.HTTP_400_BAD_REQUEST
        )

    senha_hash = make_password(senha)

    if tipo.upper() == 'ADMIN':
        usuario = ContaVendedor.objects.create(
            email_adm=email,
            login=email,
            senha=senha_hash,
            plano_id=1
        )

        return Response(
            {
                "mensagem": "Administrador criado com sucesso",
                "id": usuario.id
            },
            status=status.HTTP_201_CREATED
        )

    usuario = ClienteFinal.objects.create(
        cpf=request.data.get('cpf'),
        nome=nome,
        email=email,
        senha=senha_hash
    )

    return Response(
        {
            "mensagem": "Usuário criado com sucesso",
            "cpf": usuario.cpf
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    senha = request.data.get('senha')

    if not email or not senha:
        return Response(
            {"erro": "Email e senha são obrigatórios"},
            status=status.HTTP_400_BAD_REQUEST
        )

    usuario = None
    tipo_usuario = None

    try:
        usuario = ContaVendedor.objects.get(email_adm=email)
        tipo_usuario = "ADMIN"
    except ContaVendedor.DoesNotExist:
        pass

    if usuario is None:
        try:
            usuario = ClienteFinal.objects.get(email=email)
            tipo_usuario = "COMUM"
        except ClienteFinal.DoesNotExist:
            return Response(
                {"erro": "Credenciais inválidas"},
                status=status.HTTP_401_UNAUTHORIZED
            )

    if not check_password(senha, usuario.senha):
        return Response(
            {"erro": "Credenciais inválidas"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken()

    refresh['email'] = email
    refresh['tipo_usuario'] = tipo_usuario

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "tipo_usuario": tipo_usuario
        }
    )