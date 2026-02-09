from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from tasks.models import Task


class TaskAPITest(APITestCase):

    def setUp(self):
        # Create a test user in the test database
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )

        # Generate a valid JWT token for the test user
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        # Add Authorization header to all authenticated requests
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}"
        )

    def test_unauthorized_access(self):
        # Remove credentials to simulate a request without authentication
        self.client.credentials()

        # Try to access the task list without a token
        response = self.client.get("/api/tasks/")

        # Expect unauthorized response
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_task(self):
        # Create a task with all required fields
        payload = {
            "title": "Test task",
            "description": "Testing create",
            "completed": False
        }

        response = self.client.post("/api/tasks/", payload)

        # Task should be created successfully
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.first().title, "Test task")

    def test_create_task_only_with_title(self):
        # Create a task providing only the title
        payload = {
            "title": "Test task"
        }

        response = self.client.post("/api/tasks/", payload)

        # Task should be created with default values
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)

    def test_create_task_with_no_data(self):
        # Attempt to create a task without sending any data
        payload = {}

        response = self.client.post("/api/tasks/", payload)

        # Request should fail due to invalid input
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Task.objects.count(), 0)

    def test_list_tasks(self):
        # Create sample tasks in the database
        Task.objects.create(title="Task 1", completed=False)
        Task.objects.create(title="Task 2", completed=True)

        # Request the task list
        response = self.client.get("/api/tasks/")

        # Expect all tasks to be returned
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_toggle_task_completed(self):
        # Create a task with completed = False
        task = Task.objects.create(title="Toggle task", completed=False)

        # Update the task to mark it as completed
        response = self.client.patch(
            f"/api/tasks/{task.id}/",
            {"completed": True}
        )

        task.refresh_from_db()

        # Task should be updated successfully
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(task.completed)

    def test_update_task(self):
        # Create a task to be updated
        task = Task.objects.create(title="Old title", completed=False)

        payload = {
            "title": "New title",
            "completed": True
        }

        # Update the task with new data
        response = self.client.patch(
            f"/api/tasks/{task.id}/",
            payload
        )

        task.refresh_from_db()

        # Verify task data was updated
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(task.title, "New title")
        self.assertTrue(task.completed)

    def test_update_task_not_found(self):
        # Attempt to update a non-existing task
        payload = {
            "title": "Task Title",
            "completed": True
        }

        response = self.client.patch("/api/tasks/9999/", payload)

        # Expect not found response
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_task(self):
        # Create a task to be deleted
        task = Task.objects.create(title="Delete me")

        # Delete the task
        response = self.client.delete(f"/api/tasks/{task.id}/")

        # Task should be removed successfully
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    def test_delete_task_not_found(self):
        # Attempt to delete a non-existing task
        response = self.client.delete("/api/tasks/9999/")

        # Expect not found response
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
