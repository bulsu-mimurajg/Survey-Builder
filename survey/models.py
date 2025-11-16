from django.db import models
from django.contrib.auth.models import AbstractUser
import string
import random

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
