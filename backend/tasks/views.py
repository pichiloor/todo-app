from rest_framework.viewsets import ModelViewSet
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(ModelViewSet):
    """
    ViewSet for Task CRUD operations.
    
    Provides the following endpoints:
    - GET /api/tasks/ - List all tasks (ordered by most recent first)
    - POST /api/tasks/ - Create a new task
    - GET /api/tasks/{id}/ - Retrieve a specific task
    - PATCH /api/tasks/{id}/ - Partially update a task
    - PUT /api/tasks/{id}/ - Fully update a task
    - DELETE /api/tasks/{id}/ - Delete a task
    
    All endpoints require JWT authentication.
    """

    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    

