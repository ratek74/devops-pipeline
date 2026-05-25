import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { TimerProvider } from './context/TimerContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <TimerProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TimerProvider>
    </ToastProvider>
  </React.StrictMode>,
)
