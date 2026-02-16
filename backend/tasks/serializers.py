from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task model.
    
    Converts Task model instances to/from JSON for API responses.
    Includes all fields: id, title, description, completed, due_date, created_at.
    """ 

    class Meta:
        model = Task
        fields = '__all__' # ['id', 'title', 'description', 'completed', 'due_date', 'created_at']
