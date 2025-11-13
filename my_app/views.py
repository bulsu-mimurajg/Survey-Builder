from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from . import models

# Create your views here.
def index(request):
    template = 'index.html'
    students = models.Student.objects.all()
    context = {
        'title' : 'My Students',
        'students' : students
    }
    return render(request, template, context)

def addStudentForm(request):
    template = 'add.html'
    context = {
        'title' : 'Add Student Form'
    }
    return render(request, template, context)

def saveStudent(request):
    student = models.Student()
    student.student_no = request.POST['student_no']
    student.firstname = request.POST['firstname']
    student.lastname = request.POST['lastname']
    student.save()

    return HttpResponseRedirect(reverse('index'))

def updateStudent(request, id):
    template = 'update.html'
    student = models.Student.objects.get(id=id)
    context = {
        'title' : 'Update Student',
        'student' : student
    }
    return render(request, template, context)

def update(request):
    student = models.Student(id=request.POST['id'])
    student.student_no = request.POST['student_no']
    student.firstname = request.POST['firstname']
    student.lastname = request.POST['lastname']
    student.save()

    return HttpResponseRedirect(reverse('index'))

def deleteStudent(request, id):
    student = models.Student.objects.get(id=id)
    student.delete()

    return HttpResponseRedirect(reverse('index'))

