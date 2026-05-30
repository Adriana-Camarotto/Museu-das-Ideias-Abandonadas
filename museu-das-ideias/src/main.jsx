import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '../styles.css'

import App from './App.jsx'
import { MuseumProvider } from './context/MuseumContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MuseumProvider>
      <App />
    </MuseumProvider>
  </StrictMode>,
)
