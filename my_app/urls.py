from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('add', views.addStudentForm, name='addStudentForm'),
    path('saveStudent', views.saveStudent, name='saveStudent'),
    path('update/<int:id>', views.updateStudent, name='updateStudent'),
    path('updateStudent', views.update, name='update'),
    path('<int:id>/delete', views.deleteStudent, name='deleteStudent'),


]