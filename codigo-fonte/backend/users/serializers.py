from rest_framework.serializers import ModelSerializer, Serializer
from .models import CustomUser
from rest_framework import serializers
from django.contrib.auth import authenticate

class CustomUserSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving user information (read-only).
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username']

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information. It handles validation for
    current password, new password, and password confirmation.
    """
    current_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    password_confirmation = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        # Fields available for update
        fields = ['username', 'email', 'current_password', 'new_password', 'password_confirmation']
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
        }

    def validate(self, data):
        """
        Validates the current password and ensures the new password and its confirmation match.
        """
        user = self.context['request'].user

        # 1. Check if the provided current_password is correct.
        if not user.check_password(data.get('current_password')):
            raise serializers.ValidationError({"current_password": "Senha atual incorreta."})

        new_password = data.get('new_password')
        password_confirmation = data.get('password_confirmation')

        # 2. If a new password is provided, ensure it's confirmed.
        if new_password:
            if not password_confirmation:
                raise serializers.ValidationError({"password_confirmation": "Confirmação de senha é obrigatória."})
            if new_password != password_confirmation:
                raise serializers.ValidationError({"new_password": "As senhas não coincidem."})
        
        return data

    def update(self, instance, validated_data):
        """
        Updates the user instance with validated data.
        """
        # Update username and email if provided
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)

        # Update password if a new one is provided
        new_password = validated_data.get('new_password')
        if new_password:
            instance.set_password(new_password)
        
        instance.save()
        return instance

class UserDeleteSerializer(serializers.Serializer):
    """
    Serializer for validating the user's password before account deletion.
    """
    current_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Senha atual incorreta.")
        return value


class RegisterUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True, 'style': {'input_type': 'password'}}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

class LoginUserSerializer(Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        user = authenticate(**data)

        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")