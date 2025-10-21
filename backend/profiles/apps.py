from django.apps import AppConfig


class ProfilesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'profiles'

    def ready(self):
        # import signal handlers
        try:
            import profiles.signals  # noqa: F401
        except Exception:
            pass
