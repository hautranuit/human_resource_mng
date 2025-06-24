from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'auth', views.AuthViewSet, basename='auth')
router.register(r'employees', views.EmployeeViewSet)
router.register(r'timerecords', views.TimeRecordViewSet)
router.register(r'reports', views.ReportViewSet, basename='reports')
router.register(r'admin', views.AdminViewSet, basename='admin')

urlpatterns = [
    path('', include(router.urls)),
]