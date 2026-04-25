import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DataModeProvider } from './context/DataModeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataModeProvider>
      <App />
    </DataModeProvider>
  </StrictMode>,
)
