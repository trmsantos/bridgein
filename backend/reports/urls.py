from django.urls import path
from .views import ReportListView, ReportDetailView, PublicReportCreateView

urlpatterns = [
    path('', ReportListView.as_view(), name='report-list'),
    path('<int:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('public/<uuid:magic_link>/', PublicReportCreateView.as_view(), name='public-report-create'),
]
