import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { ClientsPage } from './pages/clients/ClientsPage'
import { SuppliersPage } from './pages/suppliers/SuppliersPage'
import { ProjectsPage } from './pages/projects/ProjectsPage'
import { ProjectFormPage } from './pages/projects/ProjectFormPage'
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Everything below requires a session. ProtectedRoute renders an
              <Outlet />, so nesting routes inside it applies the guard once
              instead of repeating it on every page. */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              {/* "/projects/new" must come BEFORE "/projects/:id", or the
                  router would match "new" as an id. */}
              <Route path="/projects/new" element={<ProjectFormPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
            </Route>
          </Route>

          {/* Anything unknown goes to the dashboard, which bounces to /login
              when signed out. */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
