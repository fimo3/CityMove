from django.urls import path
from . import views

urlpatterns = [
    path("", views.profile_view, name="profile"),
    path("logout/", views.logout_view, name="profile_logout"),
]
