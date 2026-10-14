import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ShootPlanProvider } from './context/ShootPlanContext'
import { ServicesHubAdminView } from './components/layout/ServicesHubAdminView'
import { JoinRoute } from './components/join/JoinRoute'
import { applyScheduledTheme } from './utils/scheduledTheme'
import { ScheduledTheme } from './components/features/ScheduledTheme'

// Apply the palette before React's first paint, including direct join/admin routes.
applyScheduledTheme()

const isAdminRoute = window.location.pathname.startsWith('/admin')
const joinRoute = window.location.pathname === '/join/film-lab' ? 'lab' : window.location.pathname === '/join/photographer' ? 'photographer' : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScheduledTheme />
    <ShootPlanProvider>
      {joinRoute ? <JoinRoute kind={joinRoute} />
        : isAdminRoute ? <ServicesHubAdminView onBack={() => { window.location.assign('/'); }} />
        : <App />}
    </ShootPlanProvider>
  </StrictMode>,
)
