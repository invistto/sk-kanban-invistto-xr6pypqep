import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Layout } from './components/Layout'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import ListView from './pages/ListView'
import CalendarView from './pages/CalendarView'
import TimelineView from './pages/TimelineView'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { ProjectProvider } from './store/project-context'
import { AuthProvider, useAuth } from './hooks/use-auth'
import AuthPage from './pages/Auth'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <ProjectProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/list" element={<ListView />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/timeline" element={<TimelineView />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ProjectProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
