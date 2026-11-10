import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ShootPlanProvider } from './context/ShootPlanContext'
import { ServicesHubAdminView } from './components/layout/ServicesHubAdminView'
import { JoinRoute } from './components/join/JoinRoute'
import { applyScheduledTheme } from './utils/scheduledTheme'
import { ScheduledTheme } from './components/features/ScheduledTheme'
import { ApertureSpinner } from './components/animations/ApertureSpinner'

const LayoutMakerPage = lazy(() =>
  import('./features/layoutMaker/LayoutMakerPage').then((m) => ({ default: m.LayoutMakerPage })),
)

// Apply the palette before React's first paint, including direct join/admin routes.
applyScheduledTheme()

const isAdminRoute = window.location.pathname.startsWith('/admin')
const isLayoutMakerRoute = window.location.pathname === '/tao-anh' || window.location.pathname.startsWith('/tao-anh/')
const joinRoute = window.location.pathname === '/join/film-lab' ? 'lab' : window.location.pathname === '/join/photographer' ? 'photographer' : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScheduledTheme />
    <ShootPlanProvider>
      {joinRoute ? <JoinRoute kind={joinRoute} />
        : isAdminRoute ? <ServicesHubAdminView onBack={() => { window.location.assign('/'); }} />
        : isLayoutMakerRoute ? (
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
              <ApertureSpinner />
            </div>
          }>
            <LayoutMakerPage />
          </Suspense>
        )
        : <App />}
    </ShootPlanProvider>
  </StrictMode>,
)
