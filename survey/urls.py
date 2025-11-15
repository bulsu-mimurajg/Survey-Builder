from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='welcome'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('dashboard/', views.student_dashboard, name='student_dashboard'),
    path('logout/', views.logout_view, name='logout'),
]