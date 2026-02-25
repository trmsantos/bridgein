from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .serializers import CompanySerializer


class CompanyMeView(generics.RetrieveAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if not self.request.user.company:
            raise PermissionDenied("You are not associated with any company.")
        return self.request.user.company
