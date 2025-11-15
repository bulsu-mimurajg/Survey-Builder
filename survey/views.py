from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def index(request):
    template = 'index.html'
    context = {
        'title' : 'Welcome'
    }

    return render(request, template, context)

def login(request):
    template = 'login.html'
    context = {
        'title': 'Login'
    }
    
    return render(request, template, context)

def register(request):
    template = 'register.html'
    context = {
        'title': 'Register'
    }
    
    return render(request, template, context)