import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import ListView from './pages/ListView'
import CalendarView from './pages/CalendarView'
import TimelineView from './pages/TimelineView'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { ProjectProvider } from './store/project-context'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <ProjectProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
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
  </BrowserRouter>
)

export default App
