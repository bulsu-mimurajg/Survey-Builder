from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages


def student_required(view_func):
    """
    Decorator to ensure only authenticated students can access a view.
    Redirects teachers and unauthenticated users appropriately.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'Please log in to access this page.')
            return redirect('login')
        
        if not hasattr(request.user, 'profile'):
            messages.error(request, 'Your account profile is incomplete. Please contact support.')
            return redirect('welcome')
        
        if request.user.profile.role != 'student':
            messages.error(request, 'This page is only accessible to students.')
            # Redirect teachers to their dashboard (when created)
            if request.user.profile.role == 'teacher':
                return redirect('welcome')  # Update with teacher dashboard URL when available
            return redirect('welcome')
        
        return view_func(request, *args, **kwargs)
    
    return _wrapped_view

