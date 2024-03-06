from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="home"),
    path("login/", views.user_login, name="login"),
    path("signup/", views.user_signup, name="signup"),
    path("logout/", views.user_logout, name="logout"),
    path("powerline/", views.fetch_powerlines, name="fetch-powerline"),
    path("tasks/", views.user_tasks, name="tasks"),
    path("analysis/", views.get_analysis, name="analysis"),
]
