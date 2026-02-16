import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import 'dayjs/locale/en'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <MantineProvider>
    <DatesProvider settings={{ locale: 'en', firstDayOfWeek: 0, weekendDays: [0, 6] }}>
      <App />
    </DatesProvider>
  </MantineProvider>
)

