from threading import local

_thread_locals = local()


def set_current_loja(loja):
    _thread_locals.loja = loja


def get_current_loja():
    return getattr(_thread_locals, "loja", None)


class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from .models import Loja

        loja = None

        if hasattr(request, "user") and request.user.is_authenticated:
            try:
                loja = request.user.loja
            except Exception:
                pass

        if loja is None:
            loja_id = request.headers.get("X-Loja-ID")

            if loja_id:
                try:
                    loja = Loja.objects.get(id=loja_id)
                except Loja.DoesNotExist:
                    loja = None

        request.loja_atual = loja
        set_current_loja(loja)

        response = self.get_response(request)
        return response