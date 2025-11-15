from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError
from datetime import datetime
from .models import User

# Authentication Views
def landing_page(request):
    """Landing page view"""
    # Redirect to appropriate home if already logged in
    if request.user.is_authenticated:
        if request.user.role == 'student':
            return redirect('student-home')
        elif request.user.role == 'teacher':
            return redirect('student-home')  # Change to teacher-home when created
        elif request.user.role == 'admin':
            return redirect('student-home')  # Change to admin-home when created
    return render(request, 'auth/landing.html')

def signin_view(request):
    """Sign in page view"""
    if request.user.is_authenticated:
        return redirect('student-home')
    
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        # Try to find user by email
        try:
            user = User.objects.get(email=email)
            # Authenticate using username (since Django uses username for auth)
            user = authenticate(request, username=user.username, password=password)
            
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {user.full_name or user.username}!')
                
                # Redirect based on role
                if user.role == 'student':
                    return redirect('student-home')
                elif user.role == 'teacher':
                    return redirect('student-home')  # Change to teacher-home when created
                else:
                    return redirect('student-home')  # Change to admin-home when created
            else:
                messages.error(request, 'Invalid email or password.')
        except User.DoesNotExist:
            messages.error(request, 'No account found with this email.')
    
    return render(request, 'auth/signin.html')

def signup_view(request):
    """Sign up page view"""
    if request.user.is_authenticated:
        return redirect('student-home')
    
    if request.method == 'POST':
        full_name = request.POST.get('fullname', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        role = request.POST.get('role', 'student')
        
        # Validation
        if not full_name or not email or not password:
            messages.error(request, 'Please fill in all required fields.')
            return render(request, 'auth/signup.html')
        
        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'auth/signup.html')
        
        if len(password) < 8:
            messages.error(request, 'Password must be at least 8 characters long.')
            return render(request, 'auth/signup.html')
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            messages.error(request, 'An account with this email already exists.')
            return render(request, 'auth/signup.html')
        
        try:
            # Create username from email (before @)
            username = email.split('@')[0]
            
            # Make username unique if it already exists
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                full_name=full_name,
                role=role
            )
            
            messages.success(request, 'Account created successfully! Please sign in.')
            return redirect('signin')
            
        except IntegrityError:
            messages.error(request, 'An error occurred while creating your account. Please try again.')
        except Exception as e:
            messages.error(request, f'An unexpected error occurred: {str(e)}')
    
    return render(request, 'auth/signup.html')

def forgot_password_view(request):
    """Forgot password page view"""
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        
        if not email:
            messages.error(request, 'Please enter your email address.')
            return render(request, 'auth/forgot_password.html')
        
        try:
            user = User.objects.get(email=email)
            # TODO: Implement actual password reset email functionality
            messages.info(request, 'Password reset instructions would be sent to your email.')
            return redirect('signin')
        except User.DoesNotExist:
            # For security, don't reveal if email exists or not
            messages.info(request, 'If an account exists with this email, password reset instructions will be sent.')
            return redirect('signin')
    
    return render(request, 'auth/forgot_password.html')

def logout_view(request):
    """Logout view"""
    logout(request)
    messages.success(request, 'You have been successfully logged out.')
    return redirect('landing')


# Student Views
@login_required
def student_home(request):
    """Student home page view"""
    context = {
        'current_date': datetime.now(),
        'enrolled_courses': [
            {'id': 1, 'code': 'CA', 'name': 'CAP 401 - Capstone', 'members': 23, 'color': 'pink'},
            {'id': 2, 'code': 'SS', 'name': 'SSP101C - Gender and So..', 'members': 16, 'color': 'orange'},
            {'id': 3, 'code': 'SA', 'name': 'IT401 - System Administra..', 'members': 67, 'color': 'green'},
            {'id': 4, 'code': 'CA', 'name': 'IT403 - Web Systems & Te..', 'members': 12, 'color': 'cyan'},
        ],
        'recent_surveys': [
            {'id': 1, 'title': 'UI/UX Design Principles', 'type': 'Exam', 'status': 'Completed', 
             'progress': 100, 'due_date': 'Nov 5', 'score': '10/10'},
            {'id': 2, 'title': 'Weekly Assessment', 'type': 'Exam', 'status': 'In Progress', 
             'progress': 50, 'due_date': 'Nov 10', 'score': None},
            {'id': 3, 'title': 'Course Evaluation', 'type': 'Survey', 'status': 'In Progress', 
             'progress': 50, 'due_date': '--', 'score': None},
        ],
        'unread_count': 6,
    }
    return render(request, 'student/home.html', context)

@login_required
def student_courses(request):
    """Student courses page view"""
    context = {
        'courses': [
            {'id': 1, 'code': 'CAP 401', 'full_name': 'Capstone 401 - BSIT 4EG2'},
            {'id': 2, 'code': 'SSP101C', 'full_name': 'SSP101C - BSIT 4E'},
            {'id': 3, 'code': 'IT403', 'full_name': 'Web Systems and Technology 3 - BSIT 4EG2'},
            {'id': 4, 'code': 'IT401', 'full_name': 'System Administration - BSIT 4EG2'},
        ],
        'unread_count': 6,
    }
    return render(request, 'student/courses.html', context)

@login_required
def student_course_detail(request, course_id):
    """Student course detail page view"""
    # Mock course data
    courses = {
        '1': {
            'id': '1',
            'code': 'CAP 401',
            'full_name': 'Capstone 401 - BSIT 4EG2',
            'instructor': 'Juan Dela Cruz'
        },
        '2': {
            'id': '2',
            'code': 'SSP101C',
            'full_name': 'SSP101C - BSIT 4E',
            'instructor': 'Maria Santos'
        },
        '3': {
            'id': '3',
            'code': 'IT403',
            'full_name': 'Web Systems and Technology 3 - BSIT 4EG2',
            'instructor': 'Pedro Reyes'
        },
    }
    
    course = courses.get(str(course_id), courses['1'])
    
    # Mock surveys for this course
    all_surveys = [
        {'id': 1, 'title': 'Quiz # 67', 'type': 'Exam', 'status': 'Not Started', 
         'progress': 0, 'due_date': 'Nov 8, 5:00pm', 'course_code': course['code']},
        {'id': 2, 'title': 'Weekly Assessment', 'type': 'Exam', 'status': 'In Progress', 
         'progress': 50, 'due_date': 'Nov 10', 'course_code': course['code']},
        {'id': 3, 'title': 'Feedback Form', 'type': 'Survey', 'status': 'Not Started', 
         'progress': 0, 'due_date': '--', 'course_code': course['code']},
        {'id': 4, 'title': 'Course Evaluation', 'type': 'Survey', 'status': 'In Progress', 
         'progress': 50, 'due_date': '--', 'course_code': course['code']},
    ]
    
    context = {
        'course': course,
        'active_surveys': [s for s in all_surveys if s['status'] in ['Not Started', 'In Progress']],
        'closed_surveys': [],  # Empty for now
        'completed_surveys': [],  # Empty for now
        'unread_count': 6,
    }
    return render(request, 'student/course_detail.html', context)

@login_required
def student_survey_board(request):
    """Student survey board page view"""
    selected_course = request.GET.get('course', '')
    
    all_surveys = [
        {'id': 1, 'title': 'Quiz # 67', 'type': 'Exam', 'status': 'Not Started', 
         'progress': 0, 'due_date': 'Nov 8, 5:00pm', 'course_id': '1'},
        {'id': 2, 'title': 'Weekly Assessment', 'type': 'Exam', 'status': 'In Progress', 
         'progress': 50, 'due_date': 'Nov 10', 'course_id': '1'},
        {'id': 3, 'title': 'Midterm Exam', 'type': 'Exam', 'status': 'Completed', 
         'progress': 100, 'due_date': 'Nov 1', 'score': '85/100', 'course_id': '2'},
    ]
    
    # Filter surveys
    if selected_course:
        filtered_surveys = [s for s in all_surveys if s['course_id'] == selected_course]
    else:
        filtered_surveys = all_surveys
    
    context = {
        'courses': [
            {'id': '1', 'name': 'CAP 401'},
            {'id': '2', 'name': 'SSP101C'},
            {'id': '3', 'name': 'IT403'},
        ],
        'selected_course': selected_course,
        'active_surveys': [s for s in filtered_surveys if s['status'] in ['Not Started', 'In Progress']],
        'closed_surveys': [s for s in filtered_surveys if s['status'] == 'Closed'],
        'completed_surveys': [s for s in filtered_surveys if s['status'] == 'Completed'],
        'unread_count': 6,
    }
    return render(request, 'student/survey_board.html', context)

@login_required
def student_survey_detail(request, survey_id):
    """Student survey detail page view"""
    # Mock survey data
    surveys = {
        '1': {
            'id': '1',
            'title': 'Quiz # 67',
            'course': 'CAP 301',
            'type': 'Exam',
            'status': 'Not Started',
            'progress': 0,
            'due_date': 'Nov 8, 5:00 PM',
            'duration': '30 minutes',
            'passing_score': '70%',
            'total_questions': 25,
            'attempts_remaining': 1,
            'description': 'This weekly assessment covers the key concepts discussed in lectures 5-7. Please ensure you complete all questions before the deadline.',
            'instructions': [
                'Read each question carefully before answering',
                'You must complete the survey in one sitting',
                'Ensure stable internet connection throughout',
                'Click \'Submit\' when you\'re done to save your responses'
            ]
        },
        '2': {
            'id': '2',
            'title': 'Weekly Assessment',
            'course': 'CAP 301',
            'type': 'Exam',
            'status': 'In Progress',
            'progress': 50,
            'due_date': 'Nov 8, 5:00 PM',
            'duration': '30 minutes',
            'passing_score': '70%',
            'total_questions': 25,
            'attempts_remaining': 1,
            'description': 'This weekly assessment covers the key concepts discussed in lectures 5-7. Please ensure you complete all questions before the deadline.',
            'instructions': [
                'Read each question carefully before answering',
                'You must complete the survey in one sitting',
                'Ensure stable internet connection throughout',
                'Click \'Submit\' when you\'re done to save your responses'
            ]
        },
        '3': {
            'id': '3',
            'title': 'Feedback Form',
            'course': 'SSP101C',
            'type': 'Survey',
            'status': 'Not Started',
            'progress': 0,
            'due_date': '--',
            'duration': '15 minutes',
            'passing_score': 'N/A',
            'total_questions': 10,
            'attempts_remaining': 1,
            'description': 'Share your feedback about the course content, teaching methodology, and overall experience.',
            'instructions': [
                'Be honest and constructive in your feedback',
                'All responses are anonymous',
                'Take your time to provide detailed responses',
                'Your feedback helps improve the course'
            ]
        },
    }
    
    survey = surveys.get(str(survey_id), surveys['1'])
    
    context = {
        'survey': survey,
        'unread_count': 6,
    }
    return render(request, 'student/survey_detail.html', context)

@login_required
def student_notifications(request):
    """Student notifications page view"""
    context = {
        'notifications': [
            {'id': 1, 'title': 'New survey assigned', 'message': 'Quiz #67 has been assigned', 'time': '2 hours ago', 'read': False},
            {'id': 2, 'title': 'Survey due soon', 'message': 'Weekly Assessment is due tomorrow', 'time': '5 hours ago', 'read': False},
        ],
        'unread_count': 6,
    }
    return render(request, 'student/notifications.html', context)

@login_required
def student_settings(request):
    """Student settings page view"""
    context = {
        'unread_count': 6,
    }
    return render(request, 'student/settings.html', context)

@login_required
def student_help(request):
    """Student help page view"""
    context = {
        'unread_count': 6,
    }
    return render(request, 'student/help.html', context)

@login_required
def student_join_course(request):
    """Join course view"""
    if request.method == 'POST':
        invite_code = request.POST.get('invite_code')
        # Handle course joining logic here
        messages.success(request, f'Successfully joined course with code: {invite_code}')
        return redirect('student-courses')
    return redirect('student-home')
