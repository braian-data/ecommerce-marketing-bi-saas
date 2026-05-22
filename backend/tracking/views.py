from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import ClickLog

@csrf_exempt
def log_click(request):
    if request.method == 'POST':
        try:
            # Transforma os dados JSON que vieram da requisição em um dicionário Python
            data = json.loads(request.body)
            page_url = data.get('page_url')
            element_id = data.get('element_id')
            
            # Captura o endereço IP do usuário de forma segura
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            # Salva o registro diretamente na tabela do banco de dados
            log = ClickLog.objects.create(
                page_url=page_url,
                element_id=element_id,
                ip_address=ip
            )

            # Retorna uma resposta de sucesso dizendo que o log foi salvo
            return JsonResponse({
                'status': 'success', 
                'message': 'Log registrado com sucesso!', 
                'log_id': log.id
            }, status=201)
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Método não permitido'}, status=405)