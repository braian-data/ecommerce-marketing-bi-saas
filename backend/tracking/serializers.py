from rest_framework import serializers
from .models import ClickLog

class ClickLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClickLog
        fields = '__all__'