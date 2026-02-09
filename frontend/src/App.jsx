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
import { IconPencil, IconCheck, IconX, IconTrash } from '@tabler/icons-react'
import api from './services/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // Create form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [completed, setCompleted] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

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

  useEffect(() => {
    fetchTasks()
  }, [])

  const createTask = () => {
    if (!title.trim()) return
    api.post('tasks/', { title, description, completed })
      .then(() => {
        setTitle('')
        setDescription('')
        setCompleted(false)
        fetchTasks()
      })
      .catch(err => console.error(err))
  }

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

  const deleteTask = (taskId) => {
    api.delete(`tasks/${taskId}/`)
      .then(() => {
        setTasks(tasks => tasks.filter(t => t.id !== taskId))
      })
      .catch(err => console.error(err))
  }

  // Enter edit mode
  const startEdit = (task) => {
    setEditingId(task.id)
    setEditTitle(task.title ?? '')
    setEditDescription(task.description ?? '')
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
  }

  // Save edit (PATCH)
  const saveEdit = (taskId) => {
    if (!editTitle.trim()) return

    api.patch(`tasks/${taskId}/`, {
      title: editTitle,
      description: editDescription
    })
      .then(() => {
        setTasks(tasks =>
          tasks.map(t =>
            t.id === taskId
              ? { ...t, title: editTitle, description: editDescription }
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

      {/* CREATE FORM */}
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

        <Checkbox
          label="Mark as completed"
          checked={completed}
          onChange={(e) => setCompleted(e.currentTarget.checked)}
        />

        <Button onClick={createTask}>Add Task</Button>
      </Stack>

      {loading && <Loader />}

      {/* LIST */}
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
                      </Stack>
                    )}
                  </div>
                </Group>

                {/* ACTIONS */}
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
