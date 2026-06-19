from django.urls import path
from .views import TrackClickView

urlpatterns = [
    path('click/', TrackClickView.as_view(), name='track-click'),
]