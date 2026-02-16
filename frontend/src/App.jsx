import { useEffect, useState } from 'react'
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

function App() {
  // List of tasks fetched from the backend
  const [tasks, setTasks] = useState([])

  // Loading state while fetching data
  const [loading, setLoading] = useState(true)

  // State for creating a new task
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [completed, setCompleted] = useState(false)
  const [dueDate, setDueDate] = useState(null)  // ← Cambiar undefined a null

  // State for editing an existing task
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState(null)

  // Fetch all tasks from the API
  const fetchTasks = () => {
    setLoading(true)
    api.get('tasks/')
      .then(res => {
        setTasks(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  // Load tasks when the component mounts
  useEffect(() => {
    fetchTasks()
  }, [])

  // Create a new task
  const createTask = () => {
    if (!title.trim()) return

    api.post('tasks/', { 
      title, 
      description, 
      completed, 
      due_date: dueDate  // Ya es un string, no necesita conversión
    })
      .then(() => {
        setTitle('')
        setDescription('')
        setCompleted(false)
        setDueDate(null)
        fetchTasks()
      })
      .catch(err => console.error(err))
  }

  // Toggle completed state of a task
  const toggleCompleted = (task) => {
    api.patch(`tasks/${task.id}/`, { completed: !task.completed })
      .then(() => {
        setTasks(tasks =>
          tasks.map(t =>
            t.id === task.id ? { ...t, completed: !t.completed } : t
          )
        )
      })
      .catch(err => console.error(err))
  }

  // Delete a task
  const deleteTask = (taskId) => {
    api.delete(`tasks/${taskId}/`)
      .then(() => {
        setTasks(tasks => tasks.filter(t => t.id !== taskId))
      })
      .catch(err => console.error(err))
  }

  // Enable edit mode for a task
  const startEdit = (task) => {
    setEditingId(task.id)
    setEditTitle(task.title ?? '')
    setEditDescription(task.description ?? '')
    setEditDueDate(task.due_date)  // Ya es string, no necesita conversión
  }
  // Cancel edit mode
  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
    setEditDueDate(null)
  }

  // Save edited task
  const saveEdit = (taskId) => {
    if (!editTitle.trim()) return

    api.patch(`tasks/${taskId}/`, {
      title: editTitle,
      description: editDescription,
      due_date: editDueDate
    })
      .then(() => {
        setTasks(tasks =>
          tasks.map(t =>
            t.id === taskId
              ? { ...t, title: editTitle, description: editDescription, due_date: editDueDate }
              : t
          )
        )
        cancelEdit()
      })
      .catch(err => console.error(err))
  }

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">Todo App</Title>

      {/* Form to create a new task */}
      <Stack mb="lg">
        <TextInput
          label="Title"
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          onChange={setDueDate}  // ← En lugar de (date) => setDueDate(date)
          clearable
        />

        <Checkbox
          label="Mark as completed"
          checked={completed}
          onChange={(e) => setCompleted(e.currentTarget.checked)}
        />

        <Button onClick={createTask}>Add Task</Button>
      </Stack>

      {/* Show loader while fetching tasks */}
      {loading && <Loader />}

      {/* Task list */}
      <Stack>
        {tasks.map(task => {
          const isEditing = editingId === task.id

          return (
            <Paper key={task.id} p="md" withBorder>
              <Group align="flex-start" justify="space-between">
                <Group align="flex-start" style={{ flex: 1 }}>
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleCompleted(task)}
                    mt={4}
                  />

                  <div style={{ flex: 1 }}>
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
                      <ActionIcon
                        variant="light"
                        aria-label="Edit"
                        onClick={() => startEdit(task)}
                      >
                        <IconPencil size={18} />
                      </ActionIcon>

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
                      <ActionIcon
                        color="green"
                        variant="light"
                        aria-label="Save"
                        onClick={() => saveEdit(task.id)}
                      >
                        <IconCheck size={18} />
                      </ActionIcon>

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
