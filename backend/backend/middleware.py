import traceback
from django.http import JsonResponse


class ApiExceptionMiddleware:
    """Middleware that ensures API endpoints under /api/ return JSON errors
    instead of HTML error pages. Useful during development when the frontend
    expects JSON and a server exception would otherwise return an HTML error page.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            # If this is an API path, return a JSON error instead of HTML
            path = getattr(request, 'path', '') or ''
            if path.startswith('/api/'):
                tb = traceback.format_exc()
                # Log to server console (Django runserver will show this)
                print('API Exception:', str(e))
                print(tb)
                return JsonResponse({'error': str(e), 'trace': tb}, status=500)
            # otherwise re-raise so Django shows the usual debug page
            raise
