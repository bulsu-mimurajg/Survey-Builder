from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from datetime import datetime
from .forms import LoginForm, StudentRegistrationForm
from .models import Profile
from .decorators import student_required


def index(request):
    template = 'index.html'
    context = {
        'title': 'Welcome'
    }
    return render(request, template, context)


def login(request):
    if request.user.is_authenticated:
        # Redirect based on user role
        if hasattr(request.user, 'profile'):
            if request.user.profile.role == 'teacher':
                return redirect('welcome')  # Update with actual teacher dashboard URL
            else:
                return redirect('student_dashboard')
        return redirect('welcome')
    
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            
            # Django's User model uses username, but we're using email
            # So we need to find the user by email first
            try:
                user = User.objects.get(email=email)
                user = authenticate(request, username=user.username, password=password)
                
                if user is not None:
                    auth_login(request, user)
                    messages.success(request, f'Welcome back, {user.get_full_name()}!')
                    
                    # Redirect based on role
                    if hasattr(user, 'profile'):
                        if user.profile.role == 'teacher':
                            return redirect('welcome')  # Update with actual teacher dashboard URL
                        else:
                            return redirect('student_dashboard')
                    return redirect('welcome')
                else:
                    messages.error(request, 'Invalid email or password.')
            except User.DoesNotExist:
                messages.error(request, 'Invalid email or password.')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = LoginForm()
    
    template = 'login.html'
    context = {
        'title': 'Login',
        'form': form
    }
    return render(request, template, context)


@student_required
def student_dashboard(request):
    """Student dashboard view with courses and surveys."""
    user = request.user
    
    # Sample data for courses (replace with actual model data later)
    enrolled_courses = [
        {
            'code': 'CAP 401',
            'name': 'Capstone',
            'initial': 'CA',
            'members': 23,
            'color': 'bg-pink-500'
        },
        {
            'code': 'SSP101C',
            'name': 'Gender and So..',
            'initial': 'SS',
            'members': 16,
            'color': 'bg-orange-500'
        },
        {
            'code': 'IT401',
            'name': 'System Administa..',
            'initial': 'SA',
            'members': 67,
            'color': 'bg-green-500'
        },
        {
            'code': 'IT403',
            'name': 'Web Systems & Te..',
            'initial': 'CA',
            'members': 12,
            'color': 'bg-blue-500'
        },
    ]
    
    # Sample data for surveys (replace with actual model data later)
    surveys = [
        {
            'name': 'Graphic Design Fundamentals',
            'course': 'CAP401',
            'date_published': '09/04/24',
            'date_due': 'N/A',
            'score': 'N/A',
            'status': 'Upcoming',
            'status_color': 'bg-purple-100 text-purple-800'
        },
        {
            'name': 'UI/UX Design Principles',
            'course': 'CAP401',
            'date_published': '09/04/24',
            'date_due': '09/05/25',
            'score': '10/10',
            'status': 'Completed',
            'status_color': 'bg-green-100 text-green-800'
        },
        {
            'name': 'Understanding The Self',
            'course': 'SSP101C',
            'date_published': '09/04/24',
            'date_due': '09/03/24',
            'score': '6/10',
            'status': 'Past Due',
            'status_color': 'bg-red-100 text-red-800'
        },
        {
            'name': 'Wetnorking',
            'course': 'IT403',
            'date_published': '09/04/24',
            'date_due': 'N/A',
            'score': '8/25',
            'status': 'Incomplete',
            'status_color': 'bg-orange-100 text-orange-800'
        },
        {
            'name': 'Test Cases',
            'course': 'IT401',
            'date_published': '09/04/24',
            'date_due': 'N/A',
            'score': '25/30',
            'status': 'Completed',
            'status_color': 'bg-green-100 text-green-800'
        },
        {
            'name': 'How to clean your PC',
            'course': 'IT402',
            'date_published': '09/04/24',
            'date_due': 'N/A',
            'score': 'N/A',
            'status': 'Completed',
            'status_color': 'bg-green-100 text-green-800'
        },
    ]
    
    # Get current date formatted
    current_date = datetime.now().strftime('%B %d, %Y, %A')
    
    context = {
        'user': user,
        'enrolled_courses': enrolled_courses,
        'surveys': surveys,
        'current_date': current_date,
    }
    
    return render(request, 'student/dashboard.html', context)


def logout_view(request):
    """Logout view."""
    auth_logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('welcome')


def register(request):
    if request.user.is_authenticated:
        return redirect('student_dashboard' if hasattr(request.user, 'profile') and request.user.profile.role == 'student' else 'welcome')
    
    if request.method == 'POST':
        form = StudentRegistrationForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            first_name = form.cleaned_data['first_name']
            last_name = form.cleaned_data['last_name']
            gender = form.cleaned_data['gender']
            date_of_birth = form.cleaned_data['date_of_birth']
            
            # Create user with email as username (or generate unique username)
            username = email  # Using email as username
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Update profile with additional information
            profile = user.profile
            profile.role = 'student'  # Ensure it's a student
            profile.gender = gender
            profile.date_of_birth = date_of_birth
            profile.save()
            
            messages.success(request, 'Account created successfully! Please log in.')
            return redirect('login')
        else:
            # Display form errors
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = StudentRegistrationForm()
    
    template = 'register.html'
    context = {
        'title': 'Register',
        'form': form
    }
    return render(request, template, context)