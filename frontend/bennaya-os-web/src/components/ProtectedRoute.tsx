import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Gate in front of every signed-in route.
 *
 * This is convenience, NOT security. It only hides the UI - the real
 * enforcement is the [Authorize] attribute on the API, because anyone can
 * edit JavaScript in their browser.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back there.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
