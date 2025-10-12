from django.conf import settings
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    CustomUserSerializer,
    RegisterUserSerializer,
    LoginUserSerializer,
    UserUpdateSerializer,
    UserDeleteSerializer
)
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework import permissions

# Read the cookie settings from your project's settings.py.
SIMPLEJWT_SETTINGS = getattr(settings, 'SIMPLE_JWT', {})
AUTH_COOKIE_SECURE = SIMPLEJWT_SETTINGS.get('AUTH_COOKIE_SECURE', not settings.DEBUG)
AUTH_COOKIE_SAMESITE = SIMPLEJWT_SETTINGS.get('AUTH_COOKIE_SAMESITE', 'Lax')


class UserInfoView(RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return CustomUserSerializer
    def get_object(self):
        return self.request.user
    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = UserDeleteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user.delete()
            response = Response({"message": "Conta excluída com sucesso."}, status=status.HTTP_204_NO_CONTENT)
            response.delete_cookie('access_token', path='/') # --- ADDED PATH ---
            response.delete_cookie('refresh_token', path='/') # --- ADDED PATH ---
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationView(CreateAPIView):
    serializer_class = RegisterUserSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            response = Response({"user": CustomUserSerializer(user).data}, status=status.HTTP_200_OK)

            response.set_cookie(key="access_token",
                                value=access_token,
                                httponly=True,
                                secure=AUTH_COOKIE_SECURE,
                                samesite=AUTH_COOKIE_SAMESITE,
                                path='/') # --- ADDED PATH ---

            response.set_cookie(key="refresh_token",
                                value=str(refresh),
                                httponly=True,
                                secure=AUTH_COOKIE_SECURE,
                                samesite=AUTH_COOKIE_SAMESITE,
                                path='/') # --- ADDED PATH ---
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except (TokenError, AttributeError):
            pass
        response = Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
        response.set_cookie(
            key="access_token", value="", httponly=True,
            expires="Thu, 01 Jan 1970 00:00:00 GMT", max_age=0,
            secure=AUTH_COOKIE_SECURE, samesite=AUTH_COOKIE_SAMESITE,
            path='/') # --- ADDED PATH ---
        response.set_cookie(
            key="refresh_token", value="", httponly=True,
            expires="Thu, 01 Jan 1970 00:00:00 GMT", max_age=0,
            secure=AUTH_COOKIE_SECURE, samesite=AUTH_COOKIE_SAMESITE,
            path='/') # --- ADDED PATH ---
        return response


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"error": "No refresh token provided"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            response = Response({"message": "Token refreshed successfully"}, status=status.HTTP_200_OK)
            response.set_cookie(key="access_token",
                                value=access_token,
                                httponly=True,
                                secure=AUTH_COOKIE_SECURE,
                                samesite=AUTH_COOKIE_SAMESITE,
                                path='/') # --- ADDED PATH ---
            return response
        except InvalidToken:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)