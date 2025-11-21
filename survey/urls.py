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
    path('student/survey/<int:survey_id>/take/', views.student_take_survey, name='student-take-survey'),
    path('student/survey/<int:survey_id>/view/', views.student_view_response, name='student-view-response'),
    path('student/survey/<int:survey_id>/submit/', views.student_submit_survey, name='student-survey-submit'),
    path('student/notifications/', views.student_notifications, name='student-notifications'),
    path('student/settings/', views.student_settings, name='student-settings'),
    path('student/help/', views.student_help, name='student-help'),
    path('student/join-course/', views.student_join_course, name='student-join-course'),
    
    # Teacher URLs
    path('teacher/home/', views.teacher_home, name='teacher-home'),
    path('teacher/courses/', views.teacher_courses, name='teacher-courses'),
    path('teacher/courses/create/', views.teacher_create_course, name='teacher-create-course'),
    path('teacher/courses/<int:course_id>/', views.teacher_course_detail, name='teacher-course-detail'),
    path('teacher/courses/<int:course_id>/edit/', views.teacher_edit_course, name='teacher-edit-course'),
    path('teacher/courses/<int:course_id>/regenerate-invite/', views.teacher_regenerate_invite_code, name='teacher-regenerate-invite'),
    path('teacher/courses/<int:course_id>/add-student/', views.teacher_add_student, name='teacher-add-student'),
    path('teacher/courses/<int:course_id>/student/<int:student_id>/submissions/', views.teacher_student_submissions, name='teacher-student-submissions'),
    path('teacher/courses/<int:course_id>/student/<int:student_id>/remove/', views.teacher_remove_student, name='teacher-remove-student'),
    path('teacher/survey-builder/', views.teacher_survey_board, name='teacher-survey-builder'),
    path('teacher/survey/create/', views.teacher_create_survey, name='teacher-create-survey'),
    path('teacher/survey/<int:survey_id>/builder/', views.teacher_survey_builder, name='teacher-survey-builder-detail'),
    path('teacher/survey/<int:survey_id>/preview/', views.teacher_preview_survey, name='teacher-preview-survey'),
    path('teacher/survey/<int:survey_id>/submissions/', views.teacher_survey_submissions, name='teacher-survey-submissions'),
    path('teacher/survey/<int:survey_id>/edit/', views.teacher_edit_survey, name='teacher-edit-survey'),
    path('teacher/survey/<int:survey_id>/parameters/', views.teacher_update_survey_parameters, name='teacher-update-survey-parameters'),
    path('api/survey/<int:survey_id>/question/add/', views.api_add_question, name='api-add-question'),
    path('api/survey/question/<int:question_id>/html/', views.api_get_question_html, name='api-get-question-html'),
    path('api/survey/question/<int:question_id>/update/', views.api_update_question, name='api-update-question'),
    path('api/survey/question/<int:question_id>/delete/', views.api_delete_question, name='api-delete-question'),
    path('api/survey/question/<int:question_id>/analytics/', views.api_question_analytics, name='api-question-analytics'),
    path('api/survey/<int:survey_id>/questions/reorder/', views.api_reorder_questions, name='api-reorder-questions'),
    path('api/survey/<int:survey_id>/save/', views.api_save_survey, name='api-save-survey'),
    path('api/survey/<int:survey_id>/courses/update/', views.api_update_course_assignments, name='api-update-course-assignments'),
    path('api/survey/<int:survey_id>/status/toggle/', views.api_toggle_survey_status, name='api-toggle-survey-status'),
    path('api/survey/<int:survey_id>/status/confirm-activate/', views.api_confirm_activate_survey, name='api-confirm-activate-survey'),
    path('api/survey/<int:survey_id>/response/<int:response_id>/save/', views.api_save_survey_draft, name='api-save-survey-draft'),
    path('api/survey/response/<int:response_id>/detail/', views.api_response_detail, name='api-response-detail'),
    path('api/survey/<int:survey_id>/export/csv/', views.api_export_survey_csv, name='api-export-survey-csv'),
    path('teacher/notifications/', views.teacher_home, name='teacher-notifications'),  # Placeholder
    path('teacher/settings/', views.teacher_home, name='teacher-settings'),  # Placeholder
    path('teacher/help/', views.teacher_home, name='teacher-help'),  # Placeholder
]
