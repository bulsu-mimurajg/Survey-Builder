from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import string
import random
import json

# Create your models here.

class User(AbstractUser):
    """Custom user model extending Django's AbstractUser"""
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    full_name = models.CharField(max_length=255, blank=True)
    
    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='survey_users',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='survey_users',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    def get_full_name(self):
        """Return the full name, prioritizing full_name field, then first_name + last_name"""
        if self.full_name:
            return self.full_name
        elif self.first_name or self.last_name:
            return f"{self.first_name or ''} {self.last_name or ''}".strip()
        return self.username or self.email
    
    def __str__(self):
        return self.email or self.username
    
    class Meta:
        db_table = 'users'


class Course(models.Model):
    """Course model for managing courses created by teachers"""
    code = models.CharField(max_length=50, unique=True, help_text="Course code like 'CAP 401'")
    name = models.CharField(max_length=255, help_text="Full course name")
    description = models.TextField(blank=True, help_text="Course details/description")
    invite_code = models.CharField(max_length=10, unique=True, help_text="Auto-generated invite code for students")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='taught_courses', limit_choices_to={'role': 'teacher'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def save(self, *args, **kwargs):
        """Generate invite code if not set"""
        if not self.invite_code:
            self.invite_code = self.generate_invite_code()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_invite_code():
        """Generate a unique 6-character alphanumeric invite code"""
        characters = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(random.choice(characters) for _ in range(6))
            if not Course.objects.filter(invite_code=code).exists():
                return code
    
    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']


class CourseEnrollment(models.Model):
    """Model for tracking student enrollments in courses"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrolled_courses', limit_choices_to={'role': 'student'})
    joined_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student} enrolled in {self.course}"
    
    class Meta:
        db_table = 'course_enrollments'
        unique_together = [['course', 'student']]
        ordering = ['-joined_at']


class Survey(models.Model):
    """Survey/Exam model for managing surveys created by teachers"""
    TYPE_CHOICES = [
        ('survey', 'Survey'),
        ('exam', 'Exam'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='survey')
    description = models.TextField(blank=True)
    instructions = models.JSONField(default=list, blank=True)  # List of instruction strings
    
    # Duration settings
    duration_enabled = models.BooleanField(default=False)
    duration_minutes = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(10), MaxValueValidator(120)])
    
    # Due date settings
    due_date_enabled = models.BooleanField(default=False)
    due_date = models.DateTimeField(null=True, blank=True)
    
    # Modification settings
    allow_modifications = models.BooleanField(default=False)
    
    # Status and metadata
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_surveys', limit_choices_to={'role': 'teacher'})
    courses = models.ManyToManyField(Course, through='SurveyCourseAssignment', related_name='surveys')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    def get_total_questions(self):
        return self.questions.count()
    
    def is_past_due(self):
        """Check if survey is past its due date"""
        from django.utils import timezone
        if self.due_date_enabled and self.due_date:
            return timezone.now() > self.due_date
        return False
    
    def should_auto_close(self):
        """Check if survey should be automatically closed due to due date"""
        return self.status == 'active' and self.is_past_due()
    
    class Meta:
        db_table = 'surveys'
        ordering = ['-created_at']


class Question(models.Model):
    """Question model for survey questions"""
    QUESTION_TYPE_CHOICES = [
        ('short_text', 'Short Text'),
        ('long_text', 'Long Text'),
        ('multiple_choice', 'Multiple Choice'),
        ('checkboxes', 'Checkboxes'),
        ('dropdown', 'Dropdown'),
        ('rating', 'Rating'),
        ('scale', 'Scale'),
        ('date', 'Date'),
        ('time', 'Time'),
        ('file_upload', 'File Upload'),
        ('section', 'Section'),
        ('heading', 'Heading'),
        ('paragraph', 'Paragraph'),
    ]
    
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    question_text = models.TextField()
    order = models.IntegerField(default=0)
    required = models.BooleanField(default=False)
    settings = models.JSONField(default=dict, blank=True)  # Type-specific settings (e.g., scale min/max, rating max)
    points = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=1.00,  # Changed from 0 to 1
        help_text="Points awarded for correct answer (minimum: 1.0)"
    )  # Points for exam questions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.survey.title} - {self.question_text[:50]}"
    
    class Meta:
        db_table = 'questions'
        ordering = ['order', 'created_at']


class QuestionOption(models.Model):
    """Options for choice-based questions (Multiple Choice, Checkboxes, Dropdown)"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    is_correct = models.BooleanField(default=False)  # For exams
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.question.question_text[:30]} - {self.option_text}"
    
    class Meta:
        db_table = 'question_options'
        ordering = ['order', 'created_at']


class SurveyCourseAssignment(models.Model):
    """Many-to-many relationship between Survey and Course"""
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='course_assignments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='survey_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.survey.title} assigned to {self.course.code}"
    
    class Meta:
        db_table = 'survey_course_assignments'
        unique_together = [['survey', 'course']]
        ordering = ['-assigned_at']


class SurveyResponse(models.Model):
    """Student responses to surveys"""
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='survey_responses', limit_choices_to={'role': 'student'})
    attempt_number = models.IntegerField(default=1)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    is_complete = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        """Override save to ensure is_complete can never be True if submitted_at is None"""
        # CRITICAL: A survey response can only be complete if it has a submitted_at timestamp
        # This prevents drafts (which have submitted_at=None) from being marked as complete
        # Even if all questions are answered, a response without submitted_at is always a draft
        if self.is_complete and self.submitted_at is None:
            # Force is_complete to False if submitted_at is None
            # This is a safeguard to prevent accidental completion of drafts
            self.is_complete = False
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.student.email} - {self.survey.title}"
    
    class Meta:
        db_table = 'survey_responses'
        ordering = ['-started_at']


class QuestionResponse(models.Model):
    """Individual question responses within a survey response"""
    survey_response = models.ForeignKey(SurveyResponse, on_delete=models.CASCADE, related_name='question_responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='responses')
    response_text = models.TextField(blank=True)
    response_options = models.ManyToManyField(QuestionOption, blank=True, related_name='responses')
    file_upload = models.FileField(upload_to='survey_responses/', blank=True, null=True)
    
    # Exam grading fields
    is_correct = models.BooleanField(null=True, blank=True)  # None = not graded, True/False = graded
    awarded_points = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Actual points awarded
    needs_review = models.BooleanField(default=False)  # True for short_text, long_text, file_upload
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.survey_response.student.email} - {self.question.question_text[:30]}"
    
    class Meta:
        db_table = 'question_responses'
        ordering = ['created_at']


class DashboardMetrics(models.Model):
    """Model to store historical dashboard metrics for change tracking"""
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboard_metrics')
    date = models.DateField(auto_now_add=True)
    active_surveys = models.IntegerField(default=0)
    total_responses = models.IntegerField(default=0)
    completion_rate = models.IntegerField(default=0)
    pending_reviews = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['teacher', 'date']
    
    def __str__(self):
        return f"{self.teacher.username} - {self.date}"
