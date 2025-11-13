from django.db import models

# Create your models here.
class Student(models.Model):
    student_no = models.IntegerField(verbose_name='Student No:', name='student_no')
    firstname = models.CharField(max_length=50, verbose_name='First Name', name='firstname')
    lastname = models.CharField(max_length=50, verbose_name='Last Name', name='lastname')