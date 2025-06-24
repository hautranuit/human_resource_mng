from django.contrib import admin
from .models import Employee, TimeRecord, MonthlyReport

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'full_name', 'department', 'position', 'is_active']
    list_filter = ['department', 'is_active']
    search_fields = ['employee_id', 'full_name', 'user__username']

@admin.register(TimeRecord)
class TimeRecordAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'check_in_time', 'check_out_time', 'status', 'working_hours']
    list_filter = ['status', 'date', 'forgot_checkout']
    search_fields = ['employee__full_name', 'employee__employee_id']
    date_hierarchy = 'date'

@admin.register(MonthlyReport)
class MonthlyReportAdmin(admin.ModelAdmin):
    list_display = ['employee', 'year', 'month', 'total_working_days', 'total_working_hours']
    list_filter = ['year', 'month']
    search_fields = ['employee__full_name', 'employee__employee_id']