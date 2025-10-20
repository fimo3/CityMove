import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout as django_logout

# For simplicity this example stores a single profile in memory.
# In production you'd use models tied to users.
_PROFILE = {
    "name": "Guest",
    "email": "",
    "bio": "",
}


def profile_view(request):
    if request.method == "GET":
        return JsonResponse({"profile": _PROFILE})

    if request.method in ("POST", "PUT"):
        try:
            data = json.loads(request.body)
            p = data.get("profile") or data
            _PROFILE["name"] = p.get("name", _PROFILE["name"])
            _PROFILE["email"] = p.get("email", _PROFILE["email"])
            _PROFILE["bio"] = p.get("bio", _PROFILE["bio"])
            return JsonResponse({"profile": _PROFILE})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "method not allowed"}, status=405)


@csrf_exempt
def logout_view(request):
    # best effort logout (session-based)
    try:
        django_logout(request)
    except Exception:
        pass
    return JsonResponse({"ok": True})
