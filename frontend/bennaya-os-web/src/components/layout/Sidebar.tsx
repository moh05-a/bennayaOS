import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface SidebarProps {
  isOpen: boolean
  onNavigate: () => void
}

/**
 * Nav items live in one array so adding a section is a single line.
 * Kept deliberately short - an overcrowded sidebar is what makes construction
 * software feel like enterprise ERP.
 */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/clients', label: 'Clients' },
  { to: '/suppliers', label: 'Suppliers' },
]

export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const { session, logout } = useAuth()

  return (
    <>
      {/* Dimmed backdrop, only on mobile when the drawer is open. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onNavigate}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white
          transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <div className="flex h-14 items-center border-b border-slate-200 px-5">
          <span className="text-base font-semibold text-slate-900">BennayaOS</span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              // NavLink gives us isActive for free, based on the current URL.
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {session?.company.name}
            </p>
            <p className="truncate text-xs text-slate-500">{session?.user.email}</p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
