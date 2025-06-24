from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, TimeRecord, MonthlyReport

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'user', 'employee_id', 'full_name', 'department', 'position', 'hire_date', 'is_active']

class TimeRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    
    class Meta:
        model = TimeRecord
        fields = ['id', 'employee', 'employee_name', 'employee_id', 'date', 'check_in_time', 
                 'check_out_time', 'status', 'working_hours', 'forgot_checkout', 'created_at', 'updated_at']

class MonthlyReportSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    
    class Meta:
        model = MonthlyReport
        fields = ['id', 'employee', 'employee_name', 'employee_id', 'year', 'month', 
                 'total_working_days', 'total_working_hours', 'days_forgot_checkout', 'days_off', 'created_at']