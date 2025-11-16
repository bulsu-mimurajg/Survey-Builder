from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError
from datetime import datetime
from .models import User, Course, CourseEnrollment

# Authentication Views
def landing_page(request):
    """Landing page view"""
    # Redirect to appropriate home if already logged in
    if request.user.is_authenticated:
        if request.user.role == 'student':
            return redirect('student-home')
        elif request.user.role == 'teacher':
            return redirect('teacher-home')
    return render(request, 'auth/landing.html')

def signin_view(request):
    """Sign in page view"""
    if request.user.is_authenticated:
        if request.user.role == 'teacher':
            return redirect('teacher-home')
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
                    return redirect('teacher-home')
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
    if request.user.role != 'student':
        messages.error(request, 'Access denied.')
        return redirect('teacher-home')
    
    # Get enrolled courses
    enrollments = CourseEnrollment.objects.filter(student=request.user).select_related('course')[:4]
    
    # Format courses for template (with member count and color)
    colors = ['pink', 'orange', 'green', 'cyan', 'blue', 'purple', 'yellow', 'red']
    enrolled_courses = []
    for idx, enrollment in enumerate(enrollments):
        course = enrollment.course
        member_count = CourseEnrollment.objects.filter(course=course).count()
        code_abbrev = course.code[:2] if len(course.code) >= 2 else course.code[0] if course.code else 'CO'
        enrolled_courses.append({
            'id': course.id,
            'code': code_abbrev,
            'name': course.name[:30] + '..' if len(course.name) > 30 else course.name,
            'members': member_count,
            'color': colors[idx % len(colors)]
        })
    
    context = {
        'current_date': datetime.now(),
        'enrolled_courses': enrolled_courses,
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
    if request.user.role != 'student':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    # Get enrolled courses
    enrollments = CourseEnrollment.objects.filter(student=request.user).select_related('course')
    courses = [{'id': e.course.id, 'code': e.course.code, 'full_name': e.course.name} for e in enrollments]
    
    context = {
        'courses': courses,
        'unread_count': 6,
    }
    return render(request, 'student/courses.html', context)

@login_required
def student_course_detail(request, course_id):
    """Student course detail page view"""
    if request.user.role != 'student':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    # Get course and verify enrollment
    course = get_object_or_404(Course, id=course_id)
    enrollment = CourseEnrollment.objects.filter(course=course, student=request.user).first()
    
    if not enrollment:
        messages.error(request, 'You are not enrolled in this course.')
        return redirect('student-courses')
    
    # Mock surveys for this course (to be implemented later)
    all_surveys = [
        {'id': 1, 'title': 'Quiz # 67', 'type': 'Exam', 'status': 'Not Started', 
         'progress': 0, 'due_date': 'Nov 8, 5:00pm', 'course_code': course.code},
        {'id': 2, 'title': 'Weekly Assessment', 'type': 'Exam', 'status': 'In Progress', 
         'progress': 50, 'due_date': 'Nov 10', 'course_code': course.code},
        {'id': 3, 'title': 'Feedback Form', 'type': 'Survey', 'status': 'Not Started', 
         'progress': 0, 'due_date': '--', 'course_code': course.code},
        {'id': 4, 'title': 'Course Evaluation', 'type': 'Survey', 'status': 'In Progress', 
         'progress': 50, 'due_date': '--', 'course_code': course.code},
    ]
    
    course_data = {
        'id': course.id,
        'code': course.code,
        'full_name': course.name,
        'instructor': course.teacher.get_full_name() or course.teacher.email
    }
    
    context = {
        'course': course_data,
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
    if request.user.role != 'student':
        messages.error(request, 'Only students can join courses.')
        return redirect('student-home')
    
    if request.method == 'POST':
        invite_code = request.POST.get('invite_code', '').strip().upper()
        
        if not invite_code:
            messages.error(request, 'Please enter an invite code.')
            return redirect('student-courses')
        
        try:
            course = Course.objects.get(invite_code=invite_code)
            
            # Check if already enrolled
            if CourseEnrollment.objects.filter(course=course, student=request.user).exists():
                messages.info(request, f'You are already enrolled in {course.code}.')
                return redirect('student-courses')
            
            # Create enrollment
            CourseEnrollment.objects.create(course=course, student=request.user)
            messages.success(request, f'Successfully joined {course.code} - {course.name}!')
            return redirect('student-courses')
        except Course.DoesNotExist:
            messages.error(request, 'Invalid invite code. Please check and try again.')
            return redirect('student-courses')
    
    return redirect('student-courses')


# Teacher Views
@login_required
def teacher_home(request):
    """Teacher home page view"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    # Get courses created by this teacher
    courses = Course.objects.filter(teacher=request.user)
    
    # Format courses for template (with member count and color)
    colors = ['pink', 'orange', 'green', 'cyan', 'blue', 'purple', 'yellow', 'red']
    my_courses = []
    for idx, course in enumerate(courses[:8]):  # Limit to 8 for home page
        member_count = CourseEnrollment.objects.filter(course=course).count()
        code_abbrev = course.code[:2] if len(course.code) >= 2 else course.code[0] if course.code else 'CO'
        my_courses.append({
            'id': course.id,
            'code': code_abbrev,
            'name': course.name[:30] + '..' if len(course.name) > 30 else course.name,
            'members': member_count,
            'color': colors[idx % len(colors)]
        })
    
    context = {
        'current_date': datetime.now(),
        'my_courses': my_courses,
        'recent_surveys': [
            {'id': 1, 'title': 'UI/UX Design Principles', 'type': 'Exam', 'status': 'Active', 
             'responses': 15, 'due_date': 'Nov 5'},
            {'id': 2, 'title': 'Weekly Assessment', 'type': 'Exam', 'status': 'Draft', 
             'responses': 0, 'due_date': 'Nov 10'},
            {'id': 3, 'title': 'Course Evaluation', 'type': 'Survey', 'status': 'Active', 
             'responses': 8, 'due_date': '--'},
        ],
        'unread_count': 6,
    }
    return render(request, 'teacher/home.html', context)


@login_required
def teacher_courses(request):
    """List all courses created by the teacher"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    courses = Course.objects.filter(teacher=request.user)
    
    # Format courses with member counts
    courses_data = []
    for course in courses:
        member_count = CourseEnrollment.objects.filter(course=course).count()
        courses_data.append({
            'id': course.id,
            'code': course.code,
            'name': course.name,
            'members': member_count,
            'invite_code': course.invite_code,
            'created_at': course.created_at,
        })
    
    context = {
        'courses': courses_data,
        'unread_count': 6,
    }
    return render(request, 'teacher/courses.html', context)


@login_required
def teacher_create_course(request):
    """Create a new course"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    if request.method == 'POST':
        code = request.POST.get('course_code', '').strip()
        name = request.POST.get('course_name', '').strip()
        description = request.POST.get('course_details', '').strip()
        
        # Validation
        if not code or not name:
            messages.error(request, 'Course code and name are required.')
            return redirect('teacher-courses')
        
        # Check if course code already exists
        if Course.objects.filter(code=code).exists():
            messages.error(request, f'A course with code "{code}" already exists.')
            return redirect('teacher-courses')
        
        try:
            # Create course (invite code will be auto-generated in save method)
            course = Course.objects.create(
                code=code,
                name=name,
                description=description,
                teacher=request.user
            )
            messages.success(request, f'Course "{course.code}" created successfully!')
            return redirect('teacher-course-detail', course_id=course.id)
        except IntegrityError:
            messages.error(request, 'An error occurred while creating the course. Please try again.')
        except Exception as e:
            messages.error(request, f'An unexpected error occurred: {str(e)}')
    
    # GET request - show create form (will be handled by modal in template)
    return redirect('teacher-courses')


@login_required
def teacher_edit_course(request, course_id):
    """Edit course details"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    course = get_object_or_404(Course, id=course_id, teacher=request.user)
    
    if request.method == 'POST':
        code = request.POST.get('course_code', '').strip()
        name = request.POST.get('course_name', '').strip()
        description = request.POST.get('course_details', '').strip()
        
        # Validation
        if not code or not name:
            messages.error(request, 'Course code and name are required.')
            return redirect('teacher-course-detail', course_id=course.id)
        
        # Check if course code already exists (for another course)
        if Course.objects.filter(code=code).exclude(id=course.id).exists():
            messages.error(request, f'A course with code "{code}" already exists.')
            return redirect('teacher-course-detail', course_id=course.id)
        
        try:
            course.code = code
            course.name = name
            course.description = description
            course.save()
            messages.success(request, 'Course updated successfully!')
            return redirect('teacher-course-detail', course_id=course.id)
        except IntegrityError:
            messages.error(request, 'An error occurred while updating the course. Please try again.')
        except Exception as e:
            messages.error(request, f'An unexpected error occurred: {str(e)}')
    
    # GET request - show edit form (will be handled by modal in template)
    return redirect('teacher-course-detail', course_id=course.id)


@login_required
def teacher_regenerate_invite_code(request, course_id):
    """Regenerate invite code for a course"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    course = get_object_or_404(Course, id=course_id, teacher=request.user)
    
    if request.method == 'POST':
        # Generate new invite code
        old_code = course.invite_code
        course.invite_code = ''  # Clear to trigger regeneration
        course.save()
        messages.success(request, f'Invite code regenerated. New code: {course.invite_code}')
        return redirect('teacher-course-detail', course_id=course.id)
    
    return redirect('teacher-course-detail', course_id=course.id)


@login_required
def teacher_course_detail(request, course_id):
    """View course details, student list, and surveys"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    course = get_object_or_404(Course, id=course_id, teacher=request.user)
    
    # Get enrolled students
    enrollments = CourseEnrollment.objects.filter(course=course).select_related('student')
    students = [{
        'id': e.student.id,
        'name': e.student.get_full_name() or e.student.username,
        'email': e.student.email,
        'joined_at': e.joined_at
    } for e in enrollments]
    
    # Mock surveys for this course (to be implemented later)
    all_surveys = [
        {'id': 1, 'title': 'Quiz # 67', 'type': 'Exam', 'status': 'Active', 
         'progress': 0, 'due_date': 'Nov 8, 5:00pm'},
        {'id': 2, 'title': 'Weekly Assessment', 'type': 'Exam', 'status': 'Active', 
         'progress': 50, 'due_date': 'Nov 10'},
        {'id': 3, 'title': 'Feedback Form', 'type': 'Survey', 'status': 'Draft', 
         'progress': 0, 'due_date': '--'},
        {'id': 4, 'title': 'Course Evaluation', 'type': 'Survey', 'status': 'Active', 
         'progress': 50, 'due_date': '--'},
    ]
    
    active_surveys = [s for s in all_surveys if s['status'] == 'Active']
    closed_surveys = [s for s in all_surveys if s['status'] == 'Closed']
    
    context = {
        'course': course,
        'students': students,
        'student_count': len(students),
        'active_surveys': active_surveys,
        'closed_surveys': closed_surveys,
        'unread_count': 6,
    }
    return render(request, 'teacher/course_detail.html', context)
