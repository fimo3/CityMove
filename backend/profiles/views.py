import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout as django_logout

from .models import Profile

# In-memory fallback for anonymous users
_PROFILE = {
    "name": "Guest",
    "email": "",
    "bio": "",
}


def profile_to_dict(user_or_profile):
    """Normalize either a User or Profile to the expected profile dict."""
    if user_or_profile is None:
        return _PROFILE
    # If this is a Profile instance
    if hasattr(user_or_profile, 'bio') and hasattr(user_or_profile, 'user'):
        return {
            'name': user_or_profile.user.get_full_name() or user_or_profile.user.username,
            'email': user_or_profile.user.email,
            'bio': user_or_profile.bio,
            'avatarUrl': user_or_profile.avatar_url,
        }
    # If this is a Django User
    if hasattr(user_or_profile, 'username'):
        return {
            'name': user_or_profile.get_full_name() or user_or_profile.username,
            'email': user_or_profile.email,
            'bio': '',
            'avatarUrl': '',
        }
    return _PROFILE


@csrf_exempt
def profile_view(request):
    user = getattr(request, 'user', None)

    # GET -> return profile for authenticated user or fallback
    if request.method == 'GET':
        if user and user.is_authenticated:
            try:
                prof = getattr(user, 'profile', None)
                return JsonResponse({'profile': profile_to_dict(prof)})
            except Exception:
                return JsonResponse({'profile': profile_to_dict(user)})
        return JsonResponse({'profile': _PROFILE})

    # POST/PUT -> update profile for authenticated user or update fallback
    if request.method in ('POST', 'PUT'):
        try:
            data = json.loads(request.body)
            p = data.get('profile') or data
            if user and user.is_authenticated:
                prof, _ = Profile.objects.get_or_create(user=user)
                prof.bio = p.get('bio', prof.bio)
                prof.avatar_url = p.get('avatarUrl', prof.avatar_url) or prof.avatar_url
                prof.save()
                # update user fields if provided
                if p.get('name') and p.get('name') != (user.get_full_name() or user.username):
                    # naive name split
                    parts = p.get('name').split(' ', 1)
                    user.first_name = parts[0]
                    user.last_name = parts[1] if len(parts) > 1 else ''
                    user.save()
                if p.get('email'):
                    user.email = p.get('email')
                    user.save()
                return JsonResponse({'profile': profile_to_dict(prof)})
            else:
                # update in-memory fallback
                _PROFILE['name'] = p.get('name', _PROFILE['name'])
                _PROFILE['email'] = p.get('email', _PROFILE['email'])
                _PROFILE['bio'] = p.get('bio', _PROFILE['bio'])
                return JsonResponse({'profile': _PROFILE})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'method not allowed'}, status=405)



@csrf_exempt
def logout_view(request):
    # best effort logout (session-based)
    try:
        django_logout(request)
    except Exception:
        pass
    return JsonResponse({'ok': True})


@csrf_exempt
def signup_view(request):
    """Create a new user and associated profile.
    Expects JSON: { username, email, password, name? }
    Returns created profile.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email', '')
        password = data.get('password')
        name = data.get('name', '')
        if not username or not password:
            return JsonResponse({'error': 'username and password required'}, status=400)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'username exists'}, status=400)
        user = User.objects.create_user(username=username, email=email, password=password)
        if name:
            parts = name.split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
            user.save()
        # The project also registers a post_save signal to create a Profile when a User
        # is created. To avoid a UNIQUE constraint error if the signal already created
        # the Profile, use get_or_create which is idempotent.
        prof, _ = Profile.objects.get_or_create(user=user)
        return JsonResponse({'profile': profile_to_dict(prof)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def login_view(request):
    """Log in a user using Django sessions.
    Expects JSON: { username, password }
    On success returns { ok: true, profile: {...} } and sets session cookie.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return JsonResponse({'error': 'username and password required'}, status=400)
        from django.contrib.auth import authenticate, login
        user = authenticate(request, username=username, password=password)
        if user is None:
            return JsonResponse({'error': 'invalid credentials'}, status=400)
        login(request, user)
        prof = getattr(user, 'profile', None)
        return JsonResponse({'ok': True, 'profile': profile_to_dict(prof or user)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
