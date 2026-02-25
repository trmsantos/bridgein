from django.urls import path
from .views import CompanyMeView

urlpatterns = [
    path('me/', CompanyMeView.as_view(), name='company-me'),
]
