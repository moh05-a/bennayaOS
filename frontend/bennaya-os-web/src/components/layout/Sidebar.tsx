import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import type { TranslationKey } from '../../i18n'
import { LanguageSwitcher } from '../LanguageSwitcher'

interface SidebarProps {
  isOpen: boolean
  onNavigate: () => void
}

/**
 * Nav items live in one array so adding a section is a single line.
 * Kept deliberately short - an overcrowded sidebar is what makes construction
 * software feel like enterprise ERP.
 */
const NAV_ITEMS: { to: string; label: TranslationKey }[] = [
  { to: '/dashboard', label: 'nav.dashboard' },
  { to: '/projects', label: 'nav.projects' },
  { to: '/clients', label: 'nav.clients' },
  { to: '/suppliers', label: 'nav.suppliers' },
]

export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const { session, logout } = useAuth()
  const { t } = useLanguage()

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

      {/* start-0 / border-e are logical sides: left in English, right in
          Arabic. Below lg the closed drawer slides off whichever edge it sits
          on; from lg up it is always visible, so no transform applies. */}
      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-64 flex-col border-e border-slate-200 bg-white
          transition-transform duration-200
          ${isOpen ? '' : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full'}`}
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
              {t(item.label)}
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

          <LanguageSwitcher className="mt-1 w-full" />

          <button
            type="button"
            onClick={logout}
            className="block w-full rounded-lg px-3 py-2.5 text-start text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {t('nav.signOut')}
          </button>
        </div>
      </aside>
    </>
  )
}
