/**
 * File: main.jsx
 * Description: React component rendering the main UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
