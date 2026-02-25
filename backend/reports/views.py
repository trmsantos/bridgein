from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound
from companies.models import Company
from .models import Report
from .serializers import ReportSerializer, PublicReportSerializer, ReportStatusSerializer


class ReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.company:
            return Report.objects.none()
        return Report.objects.filter(company=self.request.user.company)


class ReportDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.company:
            return Report.objects.none()
        return Report.objects.filter(company=self.request.user.company)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ReportStatusSerializer
        return ReportSerializer


class PublicReportCreateView(generics.CreateAPIView):
    serializer_class = PublicReportSerializer
    permission_classes = [permissions.AllowAny]

    def get_company(self):
        magic_link = self.kwargs.get('magic_link')
        try:
            return Company.objects.get(magic_link=magic_link)
        except Company.DoesNotExist:
            raise NotFound("Company not found.")

    def perform_create(self, serializer):
        company = self.get_company()
        serializer.save(company=company)
