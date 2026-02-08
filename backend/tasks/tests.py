from rest_framework.test import APITestCase
from rest_framework import status
from tasks.models import Task

class TaskAPITest(APITestCase):

    def test_create_task(self):
        payload = {
            "title": "Test task",
            "description": "Testing create",
            "completed": False
        }

        response = self.client.post("/api/tasks/", payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.first().title, "Test task")

    def test_create_task_only_with_title(self):
        payload = {
            "title": "Test task"
        }

        response = self.client.post("/api/tasks/", payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.first().title, "Test task")

    def test_create_task_with_no_data(self):
        payload = {}

        response = self.client.post("/api/tasks/", payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Task.objects.count(), 0)

    def test_list_tasks(self):
        Task.objects.create(title="Task 1", completed=False)
        Task.objects.create(title="Task 2", completed=True)

        response = self.client.get("/api/tasks/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


    def test_toggle_task_completed(self):
        task = Task.objects.create(
            title="Toggle task",
            completed=False
        )

        response = self.client.patch(
            f"/api/tasks/{task.id}/",
            {"completed": True}
        )

        task.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(task.completed)

    def test_update_task(self):
        task = Task.objects.create(
            title="Old title",
            completed=False
        )

        payload = {
            "title": "New title",
            "completed": True
        }

        response = self.client.patch(
            f"/api/tasks/{task.id}/",
            payload
        )

        task.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(task.title, "New title")
        self.assertTrue(task.completed)

    def test_update_task_not_found(self):
        non_existent_id = 9999

        payload = {
            "title": "Task Title",
            "completed": True
        }

        response = self.client.patch(
            f"/api/tasks/{non_existent_id}/",
            payload
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Task.objects.count(), 0)


    def test_delete_task(self):
        task = Task.objects.create(title="Delete me")

        response = self.client.delete(f"/api/tasks/{task.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    def test_delete_task_not_found(self):
        non_existent_id = 9999

        response = self.client.delete(f"/api/tasks/{non_existent_id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Task.objects.count(), 0)

