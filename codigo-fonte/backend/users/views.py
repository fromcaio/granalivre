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
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework import permissions

# Create your views here.
class UserInfoView(RetrieveUpdateAPIView):
    """
    Handles retrieving, updating, and deleting the authenticated user's information.
    """
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        """
        Dynamically selects the serializer based on the request method.
        - CustomUserSerializer for GET (retrieve) requests.
        - UserUpdateSerializer for PUT/PATCH (update) requests.
        """
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return CustomUserSerializer

    def get_object(self):
        """
        Returns the currently authenticated user.
        """
        return self.request.user
    
    def delete(self, request, *args, **kwargs):
        """
        Handles account deletion after validating the current password.
        """
        user = self.get_object()
        serializer = UserDeleteSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user.delete()
            response = Response({"message": "Conta excluída com sucesso."}, status=status.HTTP_204_NO_CONTENT)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
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

            response = Response({
                "user": CustomUserSerializer(user).data},
                status=status.HTTP_200_OK)
            response.set_cookie(key="access_token",
                                value=access_token,
                                httponly=True,
                                secure=True,
                                samesite="None")
            response.set_cookie(key="refresh_token",
                                value=str(refresh),
                                httponly=True,
                                secure=True,
                                samesite="None")
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LogoutView(APIView):
    """
    Handles user logout by blacklisting the refresh token and clearing cookies.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except (TokenError, AttributeError):
            # Token is invalid, already blacklisted, or doesn't exist.
            # We proceed with cleanup regardless.
            pass

        response = Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
        
        # FIX: Explicitly overwrite and expire cookies for robust deletion.
        # This sends the necessary `Set-Cookie` headers to the browser.
        response.set_cookie(
            key="access_token",
            value="",
            httponly=True,
            expires="Thu, 01 Jan 1970 00:00:00 GMT", # Set to a past date
            max_age=0,
            secure=True,
            samesite="None"
        )
        response.set_cookie(
            key="refresh_token",
            value="",
            httponly=True,
            expires="Thu, 01 Jan 1970 00:00:00 GMT", # Set to a past date
            max_age=0,
            secure=True,
            samesite="None"
        )
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
                                secure=True,
                                samesite="None")
            return response
        except InvalidToken:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)