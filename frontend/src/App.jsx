import { useEffect, useState, useRef } from 'react'
import {
  Container,
  Title,
  Checkbox,
  Loader,
  TextInput,
  Button,
  Stack,
  Paper,
  Group,
  Text,
  ActionIcon,
  Textarea
} from '@mantine/core'
import {DatePickerInput} from '@mantine/dates'
import { IconPencil, IconCheck, IconX, IconTrash } from '@tabler/icons-react'
import api from './services/api'
import { notifications } from '@mantine/notifications'

function App() {
  // Task list from backend
  const [tasks, setTasks] = useState([])

  // Loading indicator
  const [loading, setLoading] = useState(true)

  // Fields for new task
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [completed, setCompleted] = useState(false)
  const [dueDate, setDueDate] = useState(null)

  // Ref to focus title input on validation error
  const titleRef = useRef(null)

  // Fields for editing task
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState(null)

  // Get all tasks from backend
  const fetchTasks = () => {
    setLoading(true)
    api.get('tasks/')
      .then(res => {
        setTasks(res.data)
        setLoading(false)
      })
      .catch(err => {
        notifications.show({ color: 'red', title: 'Error', message: 'Could not load tasks' })
        setLoading(false)
      })

  }

  // Load tasks on start
  useEffect(() => {
    fetchTasks()
  }, [])

  // Create new task
  const createTask = () => {
    // Don't allow empty title
    if (!title.trim()) {
      notifications.show({ color: 'orange', title: 'Missing field', message: 'Title is required' })
      titleRef.current?.focus()
      return
    }


    api.post('tasks/', {
      title,
      description,
      completed,
      due_date: dueDate
    })
      .then(() => {
        // Clear form
        setTitle('')
        setDescription('')
        setCompleted(false)
        setDueDate(null)
        // Refresh list
        fetchTasks()
      })
      .catch(() => notifications.show({ color: 'red', title: 'Error', message: 'Could not create task' }))

  }

  // Toggle task completed status
  const toggleCompleted = (task) => {
    api.patch(`tasks/${task.id}/`, { completed: !task.completed })
      .then(() => {
        // Update local state
        setTasks(tasks =>
          tasks.map(t =>
            t.id === task.id ? { ...t, completed: !t.completed } : t
          )
        )
      })
      .catch(() => notifications.show({ color: 'red', title: 'Error', message: 'Could not update task' }))

  }

  // Delete task
  const deleteTask = (taskId) => {
    api.delete(`tasks/${taskId}/`)
      .then(() => {
        // Remove from list
        setTasks(tasks => tasks.filter(t => t.id !== taskId))
      })
      .catch(() => notifications.show({ color: 'red', title: 'Error', message: 'Could not delete task' }))

  }

  // Start edit mode
  const startEdit = (task) => {
    setEditingId(task.id)
    setEditTitle(task.title ?? '')
    setEditDescription(task.description ?? '')
    setEditDueDate(task.due_date)
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
    setEditDueDate(null)
  }

  // Save changes
  const saveEdit = (taskId) => {
    // Don't allow empty title
    if (!editTitle.trim()) return

    api.patch(`tasks/${taskId}/`, {
      title: editTitle,
      description: editDescription,
      due_date: editDueDate
    })
      .then(() => {
        // Update in list
        setTasks(tasks =>
          tasks.map(t =>
            t.id === taskId
              ? { ...t, title: editTitle, description: editDescription, due_date: editDueDate }
              : t
          )
        )
        cancelEdit()
      })
      .catch(() => notifications.show({ color: 'red', title: 'Error', message: 'Could not save changes' }))

  }

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">Todo App</Title>

      {/* Form to create new task */}
      <Stack mb="lg">
        <TextInput
          label="Title"
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          ref={titleRef}
          withAsterisk
        />

        <Textarea
          label="Description"
          placeholder="Task description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={2}
        />

        <DatePickerInput
          label="Due Date (optional)"
          placeholder="Pick a due date..."
          value={dueDate}
          onChange={setDueDate}
          clearable
        />

        <Checkbox
          label="Mark as completed"
          checked={completed}
          onChange={(e) => setCompleted(e.currentTarget.checked)}
        />

        <Button onClick={createTask}>Add Task</Button>
      </Stack>

      {/* Show loader while loading */}
      {loading && <Loader />}

      {/* Task list */}
      <Stack>
        {tasks.map(task => {
          const isEditing = editingId === task.id

          return (
            <Paper key={task.id} p="md" withBorder>
              <Group align="flex-start" justify="space-between">
                <Group align="flex-start" style={{ flex: 1 }}>
                  {/* Checkbox to mark complete/incomplete */}
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleCompleted(task)}
                    mt={4}
                  />

                  <div style={{ flex: 1 }}>
                    {/* View mode */}
                    {!isEditing ? (
                      <>
                        <Text fw={500} td={task.completed ? 'line-through' : 'none'}>
                          {task.title}
                        </Text>

                        {task.description && (
                          <Text size="sm" c="dimmed">
                            {task.description}
                          </Text>
                        )}

                        {/* Show due date if exists */}
                        {task.due_date && (
                          <Text size="sm" c="orange" fw={500}>
                            Due: {new Date(task.due_date + 'T00:00:00').toLocaleDateString()}
                          </Text>
                        )}

                        <Text size="xs" c="gray">
                          Created: {new Date(task.created_at).toLocaleString()}
                        </Text>
                      </>
                    ) : (
                      /* Edit mode */
                      <Stack gap="xs">
                        <TextInput
                          label="Title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />

                        <Textarea
                          label="Description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          minRows={2}
                        />
                        <DatePickerInput
                          label="Due Date"
                          placeholder="Pick a due date..."
                          value={editDueDate}
                          onChange={setEditDueDate}
                          clearable
                        />
                      </Stack>
                    )}
                  </div>
                </Group>

                {/* Action buttons */}
                <Group gap="xs">
                  {!isEditing ? (
                    <>
                      {/* Edit button */}
                      <ActionIcon
                        variant="light"
                        aria-label="Edit"
                        onClick={() => startEdit(task)}
                      >
                        <IconPencil size={18} />
                      </ActionIcon>

                      {/* Delete button */}
                      <ActionIcon
                        color="red"
                        variant="light"
                        aria-label="Delete"
                        onClick={() => deleteTask(task.id)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </>
                  ) : (
                    <>
                      {/* Save button */}
                      <ActionIcon
                        color="green"
                        variant="light"
                        aria-label="Save"
                        onClick={() => saveEdit(task.id)}
                      >
                        <IconCheck size={18} />
                      </ActionIcon>

                      {/* Cancel button */}
                      <ActionIcon
                        color="gray"
                        variant="light"
                        aria-label="Cancel"
                        onClick={cancelEdit}
                      >
                        <IconX size={18} />
                      </ActionIcon>
                    </>
                  )}
                </Group>
              </Group>
            </Paper>
          )
        })}
      </Stack>
    </Container>
  )
}

export default App
