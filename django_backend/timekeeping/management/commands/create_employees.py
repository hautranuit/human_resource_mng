from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from timekeeping.models import Employee
import random

class Command(BaseCommand):
    help = 'Create 15 Vietnamese IT employees'
    
    def handle(self, *args, **options):
        vietnamese_employees = [
            {'name': 'Nguyễn Văn An', 'dept': 'ENGINEERING', 'pos': 'Senior Full Stack Developer'},
            {'name': 'Trần Thị Bình', 'dept': 'QA', 'pos': 'QA Team Lead'},
            {'name': 'Lê Hoàng Cường', 'dept': 'DEVOPS', 'pos': 'DevOps Engineer'},
            {'name': 'Phạm Thị Dung', 'dept': 'PRODUCT', 'pos': 'Product Manager'},
            {'name': 'Hoàng Văn Em', 'dept': 'ENGINEERING', 'pos': 'Frontend Developer'},
            {'name': 'Ngô Thị Phương', 'dept': 'DESIGN', 'pos': 'UI/UX Designer'},
            {'name': 'Vũ Văn Giang', 'dept': 'ENGINEERING', 'pos': 'Backend Developer'},
            {'name': 'Đỗ Thị Hương', 'dept': 'QA', 'pos': 'QA Engineer'},
            {'name': 'Bùi Văn Inh', 'dept': 'DEVOPS', 'pos': 'System Administrator'},
            {'name': 'Lý Thị Kim', 'dept': 'MARKETING', 'pos': 'Digital Marketing Specialist'},
            {'name': 'Trương Văn Long', 'dept': 'ENGINEERING', 'pos': 'Mobile Developer'},
            {'name': 'Phan Thị Mai', 'dept': 'HR', 'pos': 'HR Manager'},
            {'name': 'Đinh Văn Nam', 'dept': 'SALES', 'pos': 'Sales Manager'},
            {'name': 'Lâm Thị Oanh', 'dept': 'ENGINEERING', 'pos': 'Data Engineer'},
            {'name': 'Tạ Văn Phước', 'dept': 'PRODUCT', 'pos': 'Technical Product Manager'},
        ]
        
        for i, emp_data in enumerate(vietnamese_employees, 1):
            employee_id = f"EMP{i:03d}"
            username = f"emp{i:03d}"
            
            # Create user
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': emp_data['name'].split()[0],
                    'last_name': ' '.join(emp_data['name'].split()[1:]),
                    'email': f"{username}@company.com",
                }
            )
            
            if created:
                user.set_password('password123')  # Default password
                user.save()
                self.stdout.write(f"Created user: {username}")
            
            # Create employee
            employee, created = Employee.objects.get_or_create(
                employee_id=employee_id,
                defaults={
                    'user': user,
                    'full_name': emp_data['name'],
                    'department': emp_data['dept'],
                    'position': emp_data['pos'],
                }
            )
            
            if created:
                self.stdout.write(f"Created employee: {employee_id} - {emp_data['name']}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(vietnamese_employees)} Vietnamese IT employees'
            )
        )