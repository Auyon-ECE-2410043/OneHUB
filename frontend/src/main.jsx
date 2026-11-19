/**
 * File: main.jsx
 * Description: React component rendering the main UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('vite_google_client_id') || "740690894171-8ce0qovfdifvcfoa8jjc9pkss3kof3d1.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
