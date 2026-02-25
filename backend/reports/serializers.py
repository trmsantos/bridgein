from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ('id', 'title', 'description', 'contact_info', 'anonymous', 'status', 'created_at', 'updated_at', 'company')
        read_only_fields = ('id', 'created_at', 'updated_at', 'company', 'status')


class PublicReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ('title', 'description', 'contact_info', 'anonymous')


class ReportStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ('id', 'status')
