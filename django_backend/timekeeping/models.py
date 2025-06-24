from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

class Employee(models.Model):
    DEPARTMENTS = [
        ('ENGINEERING', 'Engineering'),
        ('QA', 'Quality Assurance'),
        ('DEVOPS', 'DevOps'),
        ('PRODUCT', 'Product Management'),
        ('DESIGN', 'UI/UX Design'),
        ('MARKETING', 'Marketing'),
        ('HR', 'Human Resources'),
        ('SALES', 'Sales'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    employee_id = models.CharField(max_length=10, unique=True)
    full_name = models.CharField(max_length=100)
    department = models.CharField(max_length=20, choices=DEPARTMENTS)
    position = models.CharField(max_length=100)
    hire_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"

class TimeRecord(models.Model):
    STATUS_CHOICES = [
        ('CHECKED_IN', 'Checked In'),
        ('CHECKED_OUT', 'Checked Out'),
        ('FORGOT_CHECKOUT', 'Forgot to Checkout'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CHECKED_OUT')
    working_hours = models.FloatField(default=0.0)  # in hours
    forgot_checkout = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['employee', 'date']
        ordering = ['-date', '-check_in_time']
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.date} - {self.status}"
    
    def calculate_working_hours(self):
        if self.check_in_time and self.check_out_time:
            delta = self.check_out_time - self.check_in_time
            self.working_hours = round(delta.total_seconds() / 3600, 2)
        else:
            self.working_hours = 0.0
        return self.working_hours

class MonthlyReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField()
    total_working_days = models.IntegerField(default=0)
    total_working_hours = models.FloatField(default=0.0)
    days_forgot_checkout = models.IntegerField(default=0)
    days_off = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['employee', 'year', 'month']
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.month}/{self.year}"