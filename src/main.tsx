import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { RoomsProvider } from './RoomsContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RoomsProvider>
      <App />
    </RoomsProvider>
  </React.StrictMode>,
)
