from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ClickLogSerializer

class TrackClickView(APIView):
    def post(self, request):
       # Pega o IP real do usuário (mesmo se ele estiver atrás de um roteador)
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        # Junta os dados que vieram do clique com o IP que acabamos de descobrir
        data = request.data.copy()
        data['ip_address'] = ip

        # Manda para o tradutor verificar e salvar no banco
        serializer = ClickLogSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Clique registrado com sucesso!"}, status=status.HTTP_201_CREATED)
        
        #Devolve o erro se faltar algum dado
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)