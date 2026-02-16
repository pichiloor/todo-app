"""
Test suite for Task API endpoints.

Tests cover authentication, CRUD operations, and due_date field handling.
All tests use JWT authentication and require valid tokens for protected endpoints.
"""

from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from tasks.models import Task


class TaskAPITest(APITestCase):
    """
    Test cases for the Task API.

    Each test runs in isolation with a fresh database and authenticated user.
    """

    def setUp(self):
        """
        Set up test environment before each test.

        Creates a test user and authenticates all API calls with a JWT token.
        This method runs automatically before each test.
        """
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

    # ========== Authentication Tests ==========

    def test_unauthorized_access(self):
        """
        Test that API endpoints reject requests without authentication.

        Verifies that the API returns 401 when no JWT token is provided.
        """
        # Remove credentials to simulate a request without authentication
        self.client.credentials()

        # Try to access the task list without a token
        response = self.client.get("/api/tasks/")

        # Expect unauthorized response
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ========== Create Task Tests ==========

    def test_create_task(self):
        """
        Test creating a task with basic fields (no due_date).

        Verifies that a task can be created with title, description, and completed status.
        """
        # Create a task with all basic fields
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
        """
        Test creating a task with only the title field.

        Verifies that optional fields (description, completed, due_date) use default values.
        """
        # Create a task providing only the title
        payload = {
            "title": "Test task"
        }

        response = self.client.post("/api/tasks/", payload)

        # Task should be created with default values (completed=False, due_date=null)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        self.assertFalse(Task.objects.first().completed)
        self.assertIsNone(Task.objects.first().due_date)

    def test_create_task_with_due_date(self):
        """
        Test creating a task with a valid due_date.

        Verifies that tasks can be created with a specific due date in YYYY-MM-DD format.
        """
        # Create a task with a due date
        payload = {
            "title": "Task with deadline",
            "description": "This task has a due date",
            "completed": False,
            "due_date": "2026-12-31"
        }

        response = self.client.post("/api/tasks/", payload)

        # Task should be created successfully with the due date
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)

        task = Task.objects.first()
        self.assertEqual(task.title, "Task with deadline")
        self.assertEqual(str(task.due_date), "2026-12-31")

    def test_create_task_with_due_date_null(self):
        """
        Test creating a task with due_date explicitly set to null.

        Verifies that tasks can be created without a due date (null value).
        """
        # Create a task with due_date as null
        payload = {
            "title": "Task without deadline",
            "description": "This task has no due date",
            "completed": False,
            "due_date": None
        }

        # Use format='json' to properly encode None/null values
        response = self.client.post("/api/tasks/", payload, format='json')

        # Task should be created successfully with due_date as null
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)

        task = Task.objects.first()
        self.assertEqual(task.title, "Task without deadline")
        self.assertIsNone(task.due_date)

    def test_create_task_with_no_data(self):
        """
        Test that creating a task without required fields fails.

        Verifies that the API returns 400 when title is missing.
        """
        # Attempt to create a task without sending any data
        payload = {}

        response = self.client.post("/api/tasks/", payload)

        # Request should fail due to missing required field (title)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Task.objects.count(), 0)

    # ========== List Tasks Tests ==========

    def test_list_tasks(self):
        """
        Test retrieving all tasks from the API.

        Verifies that GET /api/tasks/ returns all existing tasks.
        """
        # Create sample tasks in the database
        Task.objects.create(title="Task 1", completed=False)
        Task.objects.create(title="Task 2", completed=True, due_date="2026-03-15")

        # Request the task list
        response = self.client.get("/api/tasks/")

        # Expect all tasks to be returned
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    # ========== Update Task Tests ==========

    def test_toggle_task_completed(self):
        """
        Test toggling a task's completed status.

        Verifies that a task can be marked as completed using PATCH.
        """
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
        """
        Test updating multiple fields of a task.

        Verifies that title and completed status can be updated in one request.
        """
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

    def test_update_task_due_date(self):
        """
        Test updating the due_date of an existing task.

        Verifies that a task's due date can be added, changed, and removed (set to null).
        """
        # Create a task without a due date
        task = Task.objects.create(title="Task", completed=False, due_date=None)

        # Add a due date to the task
        response = self.client.patch(
            f"/api/tasks/{task.id}/",
            {"due_date": "2026-06-15"}
        )
        task.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(task.due_date), "2026-06-15")

        # Change the due date
        response = self.client.patch(
            f"/api/tasks/{task.id}/",
            {"due_date": "2026-12-25"}
        )
        task.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(task.due_date), "2026-12-25")

        # Remove the due date (set to null) - use format='json' to encode None
        response = self.client.patch(
            f"/api/tasks/{task.id}/",
            {"due_date": None},
            format='json'
        )
        task.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(task.due_date)

    def test_update_task_not_found(self):
        """
        Test that updating a non-existent task returns 404.

        Verifies proper error handling for invalid task IDs.
        """
        # Attempt to update a non-existing task
        payload = {
            "title": "Task Title",
            "completed": True
        }

        response = self.client.patch("/api/tasks/9999/", payload)

        # Expect not found response
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ========== Delete Task Tests ==========

    def test_delete_task(self):
        """
        Test deleting an existing task.

        Verifies that DELETE removes the task from the database.
        """
        # Create a task to be deleted
        task = Task.objects.create(title="Delete me")

        # Delete the task
        response = self.client.delete(f"/api/tasks/{task.id}/")

        # Task should be removed successfully
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    def test_delete_task_not_found(self):
        """
        Test that deleting a non-existent task returns 404.

        Verifies proper error handling when attempting to delete invalid task IDs.
        """
        # Attempt to delete a non-existing task
        response = self.client.delete("/api/tasks/9999/")

        # Expect not found response
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
