from django.db import models
"""
Task model representing a todo item.

Fields:
    title: The main name of the task (required)
    description: Optional detailed description
    completed: Boolean status - True if task is done
    due_date: Optional deadline for task completion
    created_at: Timestamp of when task was created
"""

class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """String representation of the task (returns title)."""
        return self.title

