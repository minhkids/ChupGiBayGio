import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ShootPlanProvider } from './context/ShootPlanContext'
import { ServicesHubAdminView } from './components/layout/ServicesHubAdminView'

const isAdminRoute = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShootPlanProvider>
      {isAdminRoute
        ? <ServicesHubAdminView onBack={() => { window.location.assign('/'); }} />
        : <App />}
    </ShootPlanProvider>
  </StrictMode>,
)
