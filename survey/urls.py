from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    # Authentication URLs
    path('', views.landing_page, name='landing'),
    path('signin/', views.signin_view, name='signin'),
    path('signup/', views.signup_view, name='signup'),
    path('forgot-password/', views.forgot_password_view, name='forgot-password'),
    path('logout/', LogoutView.as_view(next_page='landing'), name='logout'),
    
    # Student URLs
    path('student/home/', views.student_home, name='student-home'),
    path('student/courses/', views.student_courses, name='student-courses'),
    path('student/courses/<int:course_id>/', views.student_course_detail, name='student-course-detail'),
    path('student/survey-board/', views.student_survey_board, name='student-survey-board'),
    path('student/survey-board/<int:survey_id>/', views.student_survey_detail, name='student-survey-detail'),
    path('student/notifications/', views.student_notifications, name='student-notifications'),
    path('student/settings/', views.student_settings, name='student-settings'),
    path('student/help/', views.student_help, name='student-help'),
    path('student/join-course/', views.student_join_course, name='student-join-course'),
]
