from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from datetime import date, timedelta, datetime
import calendar
from openpyxl import Workbook
from django.http import HttpResponse
from .models import Employee, TimeRecord, MonthlyReport
from .serializers import EmployeeSerializer, TimeRecordSerializer, MonthlyReportSerializer

@method_decorator(ensure_csrf_cookie, name='dispatch')
class AuthViewSet(viewsets.ViewSet):
    permission_classes = []
    
    @action(detail=False, methods=['get'])
    def csrf(self, request):
        """Get CSRF token"""
        return Response({'csrfToken': get_token(request)})
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            try:
                employee = Employee.objects.get(user=user)
                return Response({
                    'success': True,
                    'employee': EmployeeSerializer(employee).data
                })
            except Employee.DoesNotExist:
                return Response({'success': False, 'message': 'Employee profile not found'}, 
                              status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'success': False, 'message': 'Invalid credentials'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'success': True, 'message': 'Logged out successfully'})
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Check authentication status without requiring authentication"""
        if request.user.is_authenticated:
            try:
                employee = Employee.objects.get(user=request.user)
                return Response({
                    'authenticated': True,
                    'employee': EmployeeSerializer(employee).data
                })
            except Employee.DoesNotExist:
                return Response({
                    'authenticated': False,
                    'message': 'Employee profile not found'
                })
        else:
            return Response({'authenticated': False})
        return Response({'success': True, 'message': 'Logged out successfully'})

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        if request.user.is_authenticated:
            try:
                employee = Employee.objects.get(user=request.user)
                return Response(EmployeeSerializer(employee).data)
            except Employee.DoesNotExist:
                return Response({'message': 'Employee profile not found'}, 
                              status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

class TimeRecordViewSet(viewsets.ModelViewSet):
    queryset = TimeRecord.objects.all()
    serializer_class = TimeRecordSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            try:
                employee = Employee.objects.get(user=self.request.user)
                return TimeRecord.objects.filter(employee=employee)
            except Employee.DoesNotExist:
                return TimeRecord.objects.none()
        return TimeRecord.objects.none()
    
    @action(detail=False, methods=['post'])
    def checkin_checkout(self, request):
        """Smart check-in/checkout logic with forgotten checkout handling"""
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response({'message': 'Employee profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        current_time = timezone.now()
        
        # Check if there's a record for today
        today_record, created = TimeRecord.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={'status': 'CHECKED_OUT'}
        )
        
        # Check if employee forgot to checkout yesterday
        yesterday = today - timedelta(days=1)
        try:
            yesterday_record = TimeRecord.objects.get(employee=employee, date=yesterday)
            if yesterday_record.status == 'CHECKED_IN':
                # Mark yesterday as forgot checkout
                yesterday_record.status = 'FORGOT_CHECKOUT'
                yesterday_record.forgot_checkout = True
                yesterday_record.save()
        except TimeRecord.DoesNotExist:
            pass
        
        # Current action logic
        if today_record.status == 'CHECKED_OUT':
            # Check in
            today_record.check_in_time = current_time
            today_record.status = 'CHECKED_IN'
            today_record.save()
            return Response({
                'success': True,
                'action': 'checked_in',
                'message': f'Checked in at {current_time.strftime("%H:%M:%S")}',
                'record': TimeRecordSerializer(today_record).data
            })
        elif today_record.status == 'CHECKED_IN':
            # Check out
            today_record.check_out_time = current_time
            today_record.status = 'CHECKED_OUT'
            today_record.calculate_working_hours()
            today_record.save()
            return Response({
                'success': True,
                'action': 'checked_out',
                'message': f'Checked out at {current_time.strftime("%H:%M:%S")} - Worked {today_record.working_hours} hours',
                'record': TimeRecordSerializer(today_record).data
            })
        else:
            return Response({
                'success': False,
                'message': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def current_status(self, request):
        """Get current check-in status"""
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response({'message': 'Employee profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        try:
            today_record = TimeRecord.objects.get(employee=employee, date=today)
            return Response({
                'status': today_record.status,
                'record': TimeRecordSerializer(today_record).data
            })
        except TimeRecord.DoesNotExist:
            return Response({
                'status': 'CHECKED_OUT',
                'record': None
            })
    
    @action(detail=False, methods=['get'])
    def monthly_records(self, request):
        """Get monthly time records"""
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response({'message': 'Employee profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        records = TimeRecord.objects.filter(
            employee=employee,
            date__year=year,
            date__month=month
        ).order_by('-date')
        
        return Response(TimeRecordSerializer(records, many=True).data)

class ReportViewSet(viewsets.ViewSet):
    
    @action(detail=False, methods=['get'])
    def monthly_excel(self, request):
        """Generate monthly Excel report for all employees"""
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        # Create workbook
        wb = Workbook()
        ws = wb.active
        ws.title = f"Report {month}-{year}"
        
        # Headers
        headers = [
            'Employee ID', 'Full Name', 'Department', 'Position',
            'Total Working Days', 'Total Working Hours', 'Days Forgot Checkout',
            'Days Off', 'Notes'
        ]
        ws.append(headers)
        
        # Get all employees
        employees = Employee.objects.filter(is_active=True)
        
        for employee in employees:
            records = TimeRecord.objects.filter(
                employee=employee,
                date__year=year,
                date__month=month
            )
            
            total_working_days = records.filter(check_in_time__isnull=False).count()
            total_working_hours = sum([r.working_hours for r in records])
            days_forgot_checkout = records.filter(forgot_checkout=True).count()
            
            # Calculate days off (total days in month - working days)
            days_in_month = calendar.monthrange(year, month)[1]
            days_off = days_in_month - total_working_days
            
            row = [
                employee.employee_id,
                employee.full_name,
                employee.get_department_display(),
                employee.position,
                total_working_days,
                round(total_working_hours, 2),
                days_forgot_checkout,
                days_off,
                f"Report for {month}/{year}"
            ]
            ws.append(row)
        
        # Create response
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="monthly_report_{month}_{year}.xlsx"'
        wb.save(response)
        return response