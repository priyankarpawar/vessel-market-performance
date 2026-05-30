from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
    Admins (is_staff or is_superuser) can do anything.
    Regular authenticated users can only READ (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_staff or request.user.is_superuser


class IsAdminUser(BasePermission):
    """Only admins can access this endpoint at all."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and
                    (request.user.is_staff or request.user.is_superuser))
