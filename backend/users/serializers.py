from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    company_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'company_name')

    def create(self, validated_data):
        from companies.models import Company
        company_name = validated_data.pop('company_name')
        company = Company.objects.create(name=company_name)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            company=company,
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    company_id = serializers.IntegerField(source='company.id', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'company_id', 'company_name')
