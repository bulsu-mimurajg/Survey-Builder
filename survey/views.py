from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError
from django.db.models import Count, Q, Max
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.template.loader import render_to_string
from datetime import datetime
import json
from .models import User, Course, CourseEnrollment, Survey, SurveyCourseAssignment, Question, QuestionOption, SurveyResponse

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
    
    # Get surveys assigned to this course (only active and closed, not draft)
    surveys = Survey.objects.filter(courses=course).exclude(status='draft').select_related('created_by').prefetch_related('questions', 'responses')
    
    # Format surveys for template
    all_surveys = []
    for survey in surveys:
        # Get student's response for this survey
        response = survey.responses.filter(student=request.user).order_by('-started_at').first()
        
        # Determine status and progress
        if response and response.is_complete:
            # Student completed the survey
            status = 'Completed'
            progress = 100
        elif response:
            # Student has started but not completed
            # Calculate progress based on questions answered
            total_questions = survey.questions.count()
            answered_questions = response.question_responses.count()
            progress = int((answered_questions / total_questions * 100) if total_questions > 0 else 0)
            # If survey is closed in database and not completed, show as Closed
            if survey.status == 'closed':
                status = 'Closed'
            else:
                status = 'In Progress' if progress < 100 else 'Completed'
        else:
            # Student hasn't started
            # If survey is closed in database, show as Closed, otherwise Not Started
            if survey.status == 'closed':
                status = 'Closed'
            else:
                status = 'Not Started'
            progress = 0
        
        # Format due date
        if survey.due_date_enabled and survey.due_date:
            due_date = survey.due_date.strftime('%b %d, %I:%M %p').lower()
        else:
            due_date = '--'
        
        # Map survey type
        survey_type = survey.get_type_display()
        
        all_surveys.append({
            'id': survey.id,
            'title': survey.title,
            'type': survey_type,
            'status': status,
            'progress': progress,
            'due_date': due_date,
        })
    
    course_data = {
        'id': course.id,
        'code': course.code,
        'full_name': course.name,
        'instructor': course.teacher.get_full_name() or course.teacher.email
    }
    
    context = {
        'course': course_data,
        'active_surveys': [s for s in all_surveys if s['status'] in ['Not Started', 'In Progress']],
        'closed_surveys': [s for s in all_surveys if s['status'] == 'Closed'],
        'completed_surveys': [s for s in all_surveys if s['status'] == 'Completed'],
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
    # Add require_completion_in_one_sitting flag (mock data - will be from database when implemented)
    survey['require_completion_in_one_sitting'] = True  # Mock: set to True for testing
    
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
            # Get invite code from form if provided, otherwise it will be auto-generated
            invite_code = request.POST.get('invite_code', '').strip()
            
            # Create course
            course = Course(
                code=code,
                name=name,
                description=description,
                teacher=request.user
            )
            
            # Set invite code if provided and valid, otherwise let save() generate it
            if invite_code and len(invite_code) == 6:
                # Check if invite code is already taken
                if not Course.objects.filter(invite_code=invite_code).exists():
                    course.invite_code = invite_code
                # If taken, let save() generate a new one
            
            course.save()
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
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'error': 'Access denied.'}, status=403)
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    course = get_object_or_404(Course, id=course_id, teacher=request.user)
    
    if request.method == 'POST':
        # Generate new invite code
        old_code = course.invite_code
        course.invite_code = ''  # Clear to trigger regeneration
        course.save()
        
        # Check if this is an AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'invite_code': course.invite_code,
                'message': f'Invite code regenerated. New code: {course.invite_code}'
            })
        
        messages.success(request, f'Invite code regenerated. New code: {course.invite_code}')
        return redirect('teacher-course-detail', course_id=course.id)
    
    return redirect('teacher-course-detail', course_id=course.id)


@login_required
def teacher_add_student(request, course_id):
    """Add a student to a course by email"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    course = get_object_or_404(Course, id=course_id, teacher=request.user)
    
    if request.method == 'POST':
        student_email = request.POST.get('student_email', '').strip().lower()
        
        if not student_email:
            messages.error(request, 'Please enter a student email address.')
            return redirect('teacher-course-detail', course_id=course.id)
        
        try:
            # Find student by email
            student = User.objects.get(email=student_email, role='student')
            
            # Check if already enrolled
            if CourseEnrollment.objects.filter(course=course, student=student).exists():
                messages.info(request, f'{student.get_full_name() or student.email} is already enrolled in this course.')
                return redirect('teacher-course-detail', course_id=course.id)
            
            # Create enrollment
            CourseEnrollment.objects.create(course=course, student=student)
            student_name = student.get_full_name() or student.email
            messages.success(request, f'Successfully added {student_name} to {course.code}!')
            return redirect('teacher-course-detail', course_id=course.id)
        except User.DoesNotExist:
            messages.error(request, f'No student found with email: {student_email}')
            return redirect('teacher-course-detail', course_id=course.id)
        except Exception as e:
            messages.error(request, f'An error occurred: {str(e)}')
            return redirect('teacher-course-detail', course_id=course.id)
    
    return redirect('teacher-course-detail', course_id=course.id)


@login_required
def teacher_course_detail(request, course_id):
    """View course details, student list, and surveys"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    course = get_object_or_404(Course, id=course_id, teacher=request.user)
    
    # Get filter parameter
    survey_filter = request.GET.get('filter', 'all')  # active, closed, or all
    
    # Get enrolled students
    enrollments = CourseEnrollment.objects.filter(course=course).select_related('student')
    students = [{
        'id': e.student.id,
        'name': e.student.get_full_name() or e.student.username,
        'email': e.student.email,
        'joined_at': e.joined_at
    } for e in enrollments]
    
    # Get surveys assigned to this course
    surveys = Survey.objects.filter(courses=course).select_related('created_by').prefetch_related('responses', 'questions')
    
    # Format surveys for template
    all_surveys = []
    for survey in surveys:
        # Calculate class progress (percentage of enrolled students who responded)
        total_students = CourseEnrollment.objects.filter(course=course).count()
        responded_students = survey.responses.filter(
            student__enrolled_courses__course=course
        ).values('student').distinct().count()
        progress = int((responded_students / total_students * 100) if total_students > 0 else 0)
        
        # Format due date
        if survey.due_date_enabled and survey.due_date:
            due_date = survey.due_date.strftime('%b %d, %I:%M %p').lower()
        else:
            due_date = '--'
        
        # Map survey type and status
        survey_type = survey.get_type_display()
        status = survey.get_status_display()
        
        all_surveys.append({
            'id': survey.id,
            'title': survey.title,
            'type': survey_type,
            'status': status,
            'progress': progress,
            'due_date': due_date,
        })
    
    active_surveys = [s for s in all_surveys if s['status'] == 'Active']
    closed_surveys = [s for s in all_surveys if s['status'] == 'Closed']
    
    # Determine which surveys to display based on filter
    if survey_filter == 'closed':
        displayed_surveys = closed_surveys
    elif survey_filter == 'all':
        displayed_surveys = all_surveys
    else:  # default to active
        displayed_surveys = active_surveys
    
    # Get all courses for the create survey modal
    teacher_courses = Course.objects.filter(teacher=request.user)
    
    context = {
        'course': course,
        'students': students,
        'student_count': len(students),
        'active_surveys': active_surveys,
        'closed_surveys': closed_surveys,
        'all_surveys': all_surveys,
        'displayed_surveys': displayed_surveys,
        'survey_filter': survey_filter,
        'teacher_courses': teacher_courses,
        'unread_count': 6,
    }
    return render(request, 'teacher/course_detail.html', context)


@login_required
def teacher_survey_board(request):
    """Survey board view - list all surveys created by teacher"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    # Get all surveys created by this teacher
    surveys = Survey.objects.filter(created_by=request.user).select_related('created_by').prefetch_related('courses', 'questions')
    
    # Get filter parameters
    status_filter = request.GET.get('status', 'all')
    course_filter = request.GET.get('course', '')
    
    # Filter by status
    if status_filter == 'active':
        surveys = surveys.filter(status='active')
    elif status_filter == 'closed':
        surveys = surveys.filter(status='closed')
    # 'all' shows everything
    
    # Filter by course
    if course_filter:
        try:
            course_id = int(course_filter)
            surveys = surveys.filter(courses__id=course_id)
        except ValueError:
            pass
    
    # Get courses for filter dropdown
    courses = Course.objects.filter(teacher=request.user)
    
    # Format surveys for template
    surveys_data = []
    for survey in surveys:
        # Get assigned courses
        assigned_courses = survey.courses.all()
        course_names = ', '.join([c.code for c in assigned_courses[:3]])
        if assigned_courses.count() > 3:
            course_names += f" (+{assigned_courses.count() - 3} more)"
        
        # Calculate class progress (percentage of enrolled students who responded)
        total_students = 0
        responded_students = 0
        for course in assigned_courses:
            enrolled = CourseEnrollment.objects.filter(course=course).count()
            total_students += enrolled
            responded = survey.responses.filter(student__enrolled_courses__course=course).values('student').distinct().count()
            responded_students += responded
        
        progress = int((responded_students / total_students * 100) if total_students > 0 else 0)
        
        # Format due date
        if survey.due_date_enabled and survey.due_date:
            due_date = survey.due_date.strftime('%b %d, %I:%M %p')
        else:
            due_date = '---'
        
        # Format duration
        if survey.duration_enabled and survey.duration_minutes:
            duration = f"{survey.duration_minutes} minutes"
        else:
            duration = '---'
        
        surveys_data.append({
            'id': survey.id,
            'title': survey.title,
            'type': survey.get_type_display(),
            'type_code': survey.type,
            'status': survey.get_status_display(),
            'status_code': survey.status,
            'due_date': due_date,
            'duration': duration,
            'total_questions': survey.get_total_questions(),
            'progress': progress,
            'courses': course_names,
            'assigned_courses': assigned_courses,
        })
    
    # Count surveys by status
    all_count = Survey.objects.filter(created_by=request.user).count()
    active_count = Survey.objects.filter(created_by=request.user, status='active').count()
    closed_count = Survey.objects.filter(created_by=request.user, status='closed').count()
    
    context = {
        'surveys': surveys_data,
        'courses': courses,
        'selected_status': status_filter,
        'selected_course': course_filter,
        'all_count': all_count,
        'active_count': active_count,
        'closed_count': closed_count,
        'unread_count': 6,
    }
    return render(request, 'teacher/survey_board.html', context)


@login_required
def teacher_create_survey(request):
    """Create a new survey"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        survey_type = request.POST.get('type', 'survey')
        course_ids = request.POST.getlist('courses')
        redirect_to_course = request.POST.get('redirect_to_course', '')
        
        # Validation
        if not title:
            messages.error(request, 'Survey title is required.')
            if redirect_to_course:
                return redirect('teacher-course-detail', course_id=redirect_to_course)
            return redirect('teacher-survey-builder')
        
        if not course_ids:
            messages.error(request, 'Please select at least one course.')
            if redirect_to_course:
                return redirect('teacher-course-detail', course_id=redirect_to_course)
            return redirect('teacher-survey-builder')
        
        try:
            # Create survey
            survey = Survey.objects.create(
                title=title,
                type=survey_type,
                created_by=request.user,
                status='draft'
            )
            
            # Assign to courses
            for course_id in course_ids:
                try:
                    course = Course.objects.get(id=course_id, teacher=request.user)
                    SurveyCourseAssignment.objects.create(survey=survey, course=course)
                except Course.DoesNotExist:
                    pass
            
            messages.success(request, f'Survey "{survey.title}" created successfully!')
            return redirect('teacher-survey-builder-detail', survey_id=survey.id)
        except Exception as e:
            messages.error(request, f'An error occurred: {str(e)}')
            if redirect_to_course:
                return redirect('teacher-course-detail', course_id=redirect_to_course)
            return redirect('teacher-survey-builder')
    
    return redirect('teacher-survey-builder')


@login_required
def teacher_survey_builder(request, survey_id):
    """Survey builder interface"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    survey = get_object_or_404(Survey, id=survey_id, created_by=request.user)
    questions = survey.questions.all().order_by('order')
    all_courses = Course.objects.filter(teacher=request.user).order_by('code')
    assigned_course_ids = set(survey.courses.values_list('id', flat=True))
    has_responses = survey.responses.exists()
    response_count = survey.responses.count() if has_responses else 0
    
    context = {
        'survey': survey,
        'questions': questions,
        'all_courses': all_courses,
        'assigned_course_ids': assigned_course_ids,
        'has_responses': has_responses,
        'response_count': response_count,
        'unread_count': 6,
    }
    return render(request, 'teacher/survey_builder.html', context)


# API Endpoints
@login_required
@require_http_methods(["POST"])
def api_add_question(request, survey_id):
    """API endpoint to add a new question to a survey"""
    if request.user.role != 'teacher':
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
    
    survey = get_object_or_404(Survey, id=survey_id, created_by=request.user)
    
    # REINFORCED: Block adding questions if survey is active (regardless of responses)
    # OR if survey was ever activated (not draft) AND has responses
    if survey.status == 'active':
        return JsonResponse({
            'success': False,
            'error': 'Cannot add questions when survey is active'
        }, status=400)
    
    if survey.status != 'draft' and survey.responses.exists():
        return JsonResponse({
            'success': False,
            'error': 'Cannot add questions when survey has responses'
        }, status=400)
    
    question_type = request.POST.get('question_type')
    
    if not question_type:
        return JsonResponse({'success': False, 'error': 'Question type is required'})
    
    # Check if insert_order is provided
    insert_order = request.POST.get('insert_order')
    if insert_order:
        try:
            insert_order = int(insert_order)
            # Shift existing questions with order >= insert_order
            existing_questions = survey.questions.filter(order__gte=insert_order).order_by('order')
            for q in existing_questions:
                q.order += 1
                q.save()
            next_order = insert_order
        except ValueError:
            # Invalid insert_order, fall back to appending
            max_order = survey.questions.aggregate(Max('order'))['order__max'] or -1
            next_order = max_order + 1
    else:
        # Get the next order number (append to end)
        max_order = survey.questions.aggregate(Max('order'))['order__max'] or -1
        next_order = max_order + 1
    
    # Set default settings based on question type
    default_settings = {}
    if question_type == 'rating':
        default_settings = {'max': 5}
    elif question_type == 'scale':
        default_settings = {'min': 1, 'max': 10}
    
    # Create question with default text
    question = Question.objects.create(
        survey=survey,
        question_type=question_type,
        question_text='New Question',
        order=next_order,
        required=False,
        settings=default_settings
    )
    
    return JsonResponse({
        'success': True,
        'question_id': question.id,
        'message': 'Question added successfully'
    })


@login_required
@require_http_methods(["GET", "POST"])
def api_update_question(request, question_id):
    """API endpoint to update a question"""
    if request.user.role != 'teacher':
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
    
    question = get_object_or_404(Question, id=question_id, survey__created_by=request.user)
    
    if request.method == 'GET':
        # Return form HTML for editing
        form_html = render_to_string('includes/question_edit_form.html', {
            'question': question,
            'survey': question.survey
        }, request=request)
        return JsonResponse({'success': True, 'form_html': form_html})
    
    elif request.method == 'POST':
        # Check if survey was ever activated (not draft) and has responses - if so, only allow safe edits
        survey = question.survey
        was_ever_activated = survey.status != 'draft'  # active or closed
        has_responses = survey.responses.exists()
        
        # Update question
        question_text = request.POST.get('question_text', '').strip()
        required = request.POST.get('required') == 'on'
        
        if not question_text:
            return JsonResponse({'success': False, 'error': 'Question text is required'})
        
        # If survey was ever activated AND has responses, validate safe edits only
        # If survey is active but no responses, allow full editing
        # If survey is closed but has responses, apply restrictions
        if was_ever_activated and has_responses:
            # Check if question type is being changed (not allowed)
            new_question_type = request.POST.get('question_type')
            if new_question_type and new_question_type != question.question_type:
                return JsonResponse({
                    'success': False,
                    'error': 'Cannot change question type when survey has responses'
                }, status=400)
        
        question.question_text = question_text
        question.required = required
        
        # Handle question-specific settings
        if question.question_type in ['multiple_choice', 'checkboxes', 'dropdown']:
            # Update options
            option_texts = request.POST.getlist('options[]')
            existing_options = list(question.options.all())
            
            # If survey was ever activated AND has responses, validate option changes
            if was_ever_activated and has_responses:
                # Check if option count is changing (not allowed)
                if len(option_texts) != len(existing_options):
                    return JsonResponse({
                        'success': False,
                        'error': 'Cannot add or remove options when survey has responses'
                    }, status=400)
                
                # Check if option order is changing (not allowed for scale questions)
                # For choice questions, we allow text changes but not order changes
                # Actually, we'll allow text changes but validate order hasn't changed
                for idx, option_text in enumerate(option_texts):
                    if option_text.strip() and idx < len(existing_options):
                        # Allow text updates but check order
                        existing_options[idx].option_text = option_text.strip()
                        if existing_options[idx].order != idx:
                            existing_options[idx].order = idx
                        existing_options[idx].save()
            else:
                # No responses - allow all changes
                # Update or create options
                for idx, option_text in enumerate(option_texts):
                    if option_text.strip():
                        if idx < len(existing_options):
                            existing_options[idx].option_text = option_text.strip()
                            existing_options[idx].order = idx
                            existing_options[idx].save()
                        else:
                            QuestionOption.objects.create(
                                question=question,
                                option_text=option_text.strip(),
                                order=idx
                            )
                
                # Delete extra options
                if len(option_texts) < len(existing_options):
                    for opt in existing_options[len(option_texts):]:
                        opt.delete()
        elif question.question_type == 'rating':
            # Update rating settings - always set max to 5
            if not question.settings:
                question.settings = {}
            question.settings['max'] = 5
        elif question.question_type == 'scale':
            # Update scale settings
            if was_ever_activated and has_responses:
                # Cannot change scale settings when survey was activated and has responses
                return JsonResponse({
                    'success': False,
                    'error': 'Cannot change scale settings when survey has responses'
                }, status=400)
            
            if not question.settings:
                question.settings = {}
            min_value = request.POST.get('scale_min')
            max_value = request.POST.get('scale_max')
            if min_value:
                try:
                    question.settings['min'] = int(min_value)
                except ValueError:
                    pass
            if max_value:
                try:
                    question.settings['max'] = int(max_value)
                except ValueError:
                    pass
        
        question.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Question updated successfully'
        })


@login_required
@require_http_methods(["POST"])
def api_delete_question(request, question_id):
    """API endpoint to delete a question"""
    if request.user.role != 'teacher':
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
    
    question = get_object_or_404(Question, id=question_id, survey__created_by=request.user)
    survey = question.survey
    
    # REINFORCED: Block deletion if survey is active (regardless of responses)
    # OR if survey was ever activated (not draft) AND has responses
    if survey.status == 'active':
        return JsonResponse({
            'success': False,
            'error': 'Cannot delete questions when survey is active'
        }, status=400)
    
    if survey.status != 'draft' and survey.responses.exists():
        return JsonResponse({
            'success': False,
            'error': 'Cannot delete questions when survey has responses'
        }, status=400)
    
    deleted_order = question.order
    
    # Delete the question
    question.delete()
    
    # Renumber remaining questions
    remaining_questions = survey.questions.filter(order__gt=deleted_order).order_by('order')
    for q in remaining_questions:
        q.order -= 1
        q.save()
    
    return JsonResponse({
        'success': True,
        'message': 'Question deleted successfully'
    })


@login_required
@require_http_methods(["POST"])
def api_reorder_questions(request, survey_id):
    """API endpoint to reorder questions"""
    if request.user.role != 'teacher':
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
    
    survey = get_object_or_404(Survey, id=survey_id, created_by=request.user)
    
    # REINFORCED: Block reordering if survey is active (regardless of responses)
    # OR if survey was ever activated (not draft) AND has responses
    if survey.status == 'active':
        return JsonResponse({
            'success': False,
            'error': 'Cannot reorder questions when survey is active'
        }, status=400)
    
    if survey.status != 'draft' and survey.responses.exists():
        return JsonResponse({
            'success': False,
            'error': 'Cannot reorder questions when survey has responses'
        }, status=400)
    
    try:
        data = json.loads(request.body)
        question_orders = data.get('orders', [])  # List of {question_id: order}
        
        for item in question_orders:
            question_id = item.get('question_id')
            order = item.get('order')
            Question.objects.filter(id=question_id, survey=survey).update(order=order)
        
        return JsonResponse({
            'success': True,
            'message': 'Questions reordered successfully'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
@require_http_methods(["POST"])
def api_save_survey(request, survey_id):
    """API endpoint to save survey (mark as saved)"""
    try:
        if request.user.role != 'teacher':
            return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
        
        survey = get_object_or_404(Survey, id=survey_id, created_by=request.user)
        # Just update the updated_at timestamp
        survey.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Survey saved successfully'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["POST"])
def api_update_course_assignments(request, survey_id):
    """API endpoint to update course assignments for a survey"""
    if request.user.role != 'teacher':
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
    
    survey = get_object_or_404(Survey, id=survey_id, created_by=request.user)
    
    try:
        data = json.loads(request.body)
        course_ids = data.get('course_ids', [])
        
        # Ensure at least one course is selected
        if not course_ids or len(course_ids) == 0:
            return JsonResponse({
                'success': False,
                'error': 'At least one course must be assigned to the survey'
            }, status=400)
        
        # Verify all courses belong to the teacher
        teacher_courses = Course.objects.filter(teacher=request.user, id__in=course_ids)
        if teacher_courses.count() != len(course_ids):
            return JsonResponse({
                'success': False,
                'error': 'Invalid course selection'
            }, status=400)
        
        # Get current assignments
        current_assignments = set(survey.courses.values_list('id', flat=True))
        new_assignments = set(course_ids)
        
        # Remove assignments that are no longer selected
        to_remove = current_assignments - new_assignments
        if to_remove:
            SurveyCourseAssignment.objects.filter(survey=survey, course_id__in=to_remove).delete()
        
        # Add new assignments
        to_add = new_assignments - current_assignments
        for course_id in to_add:
            course = Course.objects.get(id=course_id, teacher=request.user)
            SurveyCourseAssignment.objects.get_or_create(survey=survey, course=course)
        
        # Get updated course assignments for display
        assigned_courses = survey.courses.all().order_by('code')
        course_names = [course.code for course in assigned_courses]
        
        return JsonResponse({
            'success': True,
            'message': 'Course assignments updated successfully',
            'course_names': course_names
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
def teacher_edit_survey(request, survey_id):
    """Edit survey basic info"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    survey = get_object_or_404(Survey, id=survey_id, created_by=request.user)
    
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        if title:
            survey.title = title
            survey.save()
            messages.success(request, 'Survey updated successfully!')
            return redirect('teacher-survey-builder-detail', survey_id=survey.id)
    
    return redirect('teacher-survey-builder-detail', survey_id=survey.id)


@login_required
@require_http_methods(["POST"])
def teacher_update_survey_parameters(request, survey_id):
    """Update survey parameters"""
    if request.user.role != 'teacher':
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
    
    survey = get_object_or_404(Survey, id=survey_id, created_by=request.user)
    
    # Check if survey is active - parameters are locked when active
    if survey.status == 'active':
        return JsonResponse({
            'success': False,
            'error': 'Cannot edit parameters when survey is active. Please close the survey first.'
        }, status=400)
    
    try:
        # Duration
        survey.duration_enabled = request.POST.get('duration_enabled') == 'on'
        if survey.duration_enabled:
            duration_minutes = request.POST.get('duration_minutes')
            if duration_minutes:
                survey.duration_minutes = int(duration_minutes)
        
        # Due date
        survey.due_date_enabled = request.POST.get('due_date_enabled') == 'on'
        if survey.due_date_enabled:
            due_date_str = request.POST.get('due_date')
            if due_date_str:
                from django.utils.dateparse import parse_datetime
                survey.due_date = parse_datetime(due_date_str)
        
        # Description
        survey.description = request.POST.get('description', '')
        
        # Instructions
        instructions = request.POST.getlist('instructions[]')
        survey.instructions = [inst.strip() for inst in instructions if inst.strip()]
        
        # Attempts
        survey.attempts_enabled = request.POST.get('attempts_enabled') == 'on'
        if survey.attempts_enabled:
            attempt_type = request.POST.get('attempt_type')
            if attempt_type == 'single':
                survey.single_attempt = True
                survey.max_attempts = None
            else:
                survey.single_attempt = False
                max_attempts = request.POST.get('max_attempts')
                if max_attempts:
                    survey.max_attempts = int(max_attempts)
        
        survey.require_completion_in_one_sitting = request.POST.get('require_completion_in_one_sitting') == 'on'
        
        survey.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Parameters updated successfully'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
@require_http_methods(["POST"])
def api_toggle_survey_status(request, survey_id):
    """API endpoint to activate or close a survey"""
    if request.user.role != 'teacher':
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
    
    survey = get_object_or_404(Survey, id=survey_id, created_by=request.user)
    
    try:
        action = request.POST.get('action', 'activate')  # 'activate' or 'close'
        
        if action == 'activate':
            # Validate that ALL three required parameters are set
            missing_params = []
            
            # Check duration
            if not survey.duration_enabled or not survey.duration_minutes:
                missing_params.append('Duration')
            
            # Check attempts
            if not survey.attempts_enabled:
                missing_params.append('Attempts')
            elif not survey.single_attempt and (not survey.max_attempts or survey.max_attempts < 1):
                missing_params.append('Attempts (max attempts must be set)')
            
            # Check due date
            if not survey.due_date_enabled or not survey.due_date:
                missing_params.append('Due Date')
            
            if missing_params:
                return JsonResponse({
                    'success': False,
                    'error': f'Please set the following parameters before activating: {", ".join(missing_params)}'
                }, status=400)
            
            # Check if survey has existing responses
            response_count = survey.responses.count()
            has_responses = response_count > 0
            
            # If no responses, activate directly
            if not has_responses:
                survey.status = 'active'
                survey.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Survey activated successfully',
                    'status': 'active',
                    'has_responses': False
                })
            else:
                # Return response count for modal warning
                return JsonResponse({
                    'success': True,
                    'requires_confirmation': True,
                    'response_count': response_count,
                    'message': f'This survey has {response_count} response(s). Activating will restrict editing options.'
                })
        
        elif action == 'close':
            survey.status = 'closed'
            survey.save()
            return JsonResponse({
                'success': True,
                'message': 'Survey closed successfully',
                'status': 'closed'
            })
        else:
            return JsonResponse({'success': False, 'error': 'Invalid action'}, status=400)
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
def api_confirm_activate_survey(request, survey_id):
    """API endpoint to confirm activation after warning modal"""
    if request.user.role != 'teacher':
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)
    
    survey = get_object_or_404(Survey, id=survey_id, created_by=request.user)
    
    try:
        survey.status = 'active'
        survey.save()
        return JsonResponse({
            'success': True,
            'message': 'Survey activated successfully',
            'status': 'active'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
def teacher_student_submissions(request, course_id, student_id):
    """View all submissions for a specific student in a course"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    course = get_object_or_404(Course, id=course_id, teacher=request.user)
    student = get_object_or_404(User, id=student_id, role='student')
    
    # Verify student is enrolled in the course
    enrollment = CourseEnrollment.objects.filter(course=course, student=student).first()
    if not enrollment:
        messages.error(request, 'Student is not enrolled in this course.')
        return redirect('teacher-course-detail', course_id=course.id)
    
    # Get all surveys assigned to this course
    surveys = Survey.objects.filter(courses=course).select_related('created_by').prefetch_related('responses', 'questions')
    
    # Get all submissions for this student
    submissions = []
    for survey in surveys:
        # Get student's responses for this survey
        responses = SurveyResponse.objects.filter(survey=survey, student=student).order_by('-started_at')
        
        for response in responses:
            # Calculate score if it's an exam
            score = None
            total_points = None
            percentage = None
            if survey.type == 'exam':
                total_questions = survey.questions.count()
                if total_questions > 0:
                    correct_answers = 0
                    for question in survey.questions.all():
                        if question.question_type in ['multiple_choice', 'checkboxes', 'dropdown']:
                            question_response = response.question_responses.filter(question=question).first()
                            if question_response:
                                selected_options = question_response.response_options.all()
                                correct_options = question.options.filter(is_correct=True)
                                if correct_options.count() > 0:
                                    if set(selected_options) == set(correct_options):
                                        correct_answers += 1
                    score = correct_answers
                    total_points = total_questions
                    percentage = int((score / total_points * 100) if total_points > 0 else 0)
            
            # Format due date
            if survey.due_date_enabled and survey.due_date:
                due_date = survey.due_date.strftime('%b %d, %I:%M %p').lower()
            else:
                due_date = '--'
            
            # Calculate completion time
            completion_time = None
            if response.submitted_at and response.started_at:
                time_diff = response.submitted_at - response.started_at
                minutes = int(time_diff.total_seconds() / 60)
                completion_time = f"{minutes} Minutes"
            
            submissions.append({
                'id': response.id,
                'survey_id': survey.id,
                'survey_title': survey.title,
                'survey_type': survey.get_type_display(),
                'due_date': due_date,
                'submitted_at': response.submitted_at.strftime('%b %d, %I:%M %p').lower() if response.submitted_at else None,
                'started_at': response.started_at.strftime('%b %d, %I:%M %p').lower(),
                'is_complete': response.is_complete,
                'score': score,
                'total_points': total_points,
                'percentage': percentage,
                'completion_time': completion_time,
                'attempt_number': response.attempt_number,
            })
    
    # Sort submissions by started_at (most recent first)
    submissions.sort(key=lambda x: x['started_at'], reverse=True)
    
    # Calculate statistics
    submitted_count = len([s for s in submissions if s['is_complete']])
    pending_count = len([s for s in submissions if not s['is_complete']])
    
    # Calculate average score
    completed_submissions = [s for s in submissions if s['is_complete'] and s['percentage'] is not None]
    avg_score = None
    if completed_submissions:
        avg_score = int(sum(s['percentage'] for s in completed_submissions) / len(completed_submissions))
    
    # Calculate completion rate
    total_surveys = surveys.count()
    completion_rate = None
    if total_surveys > 0:
        completion_rate = int((submitted_count / total_surveys) * 100)
    
    context = {
        'course': course,
        'student': {
            'id': student.id,
            'name': student.get_full_name() or student.username,
            'email': student.email,
        },
        'submissions': submissions,
        'submitted_count': submitted_count,
        'pending_count': pending_count,
        'avg_score': avg_score,
        'completion_rate': completion_rate,
        'unread_count': 6,
    }
    return render(request, 'teacher/student_submissions.html', context)


@login_required
@require_http_methods(["POST"])
def teacher_remove_student(request, course_id, student_id):
    """Remove a student from a course"""
    if request.user.role != 'teacher':
        messages.error(request, 'Access denied.')
        return redirect('student-home')
    
    course = get_object_or_404(Course, id=course_id, teacher=request.user)
    student = get_object_or_404(User, id=student_id, role='student')
    
    # Verify student is enrolled in the course
    enrollment = CourseEnrollment.objects.filter(course=course, student=student).first()
    if not enrollment:
        messages.error(request, 'Student is not enrolled in this course.')
        return redirect('teacher-course-detail', course_id=course.id)
    
    # Remove the enrollment
    enrollment.delete()
    messages.success(request, f'{student.get_full_name() or student.username} has been removed from the course.')
    
    return redirect('teacher-course-detail', course_id=course.id)
