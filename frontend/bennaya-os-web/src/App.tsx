import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ClientsPage } from './pages/clients/ClientsPage'

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
              <Route
                path="/projects"
                element={<PlaceholderPage title="Projects" phase="Phase 5" />}
              />
              <Route
                path="/suppliers"
                element={<PlaceholderPage title="Suppliers" phase="Phase 10" />}
              />
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
