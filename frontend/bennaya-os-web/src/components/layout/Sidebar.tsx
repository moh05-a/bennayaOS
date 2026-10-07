import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import type { TranslationKey } from '../../i18n'
import { initials } from '../../utils/initials'
import { BrandLogo } from '../BrandMark'
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

  const companyName = session?.company.name ?? ''
  const userName = session?.user.fullName ?? ''

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
        className={`fixed inset-y-0 start-0 z-40 flex w-64 flex-col gap-5 overflow-y-auto border-e border-slate-200 bg-white px-3.5 py-4.5
          transition-transform duration-200
          ${isOpen ? '' : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full'}`}
      >
        <div className="px-1.5">
          <BrandLogo />
        </div>

        {/* The company this workspace belongs to. */}
        <div className="flex items-center gap-2.5 rounded-[10px] border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[13px] font-bold text-amber-700">
            {initials(companyName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-900">{companyName}</p>
            <p className="truncate text-xs text-slate-500">{t('nav.workspace')}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              // NavLink gives us isActive for free, based on the current URL.
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`size-1.5 shrink-0 rounded-xs ${
                      isActive ? 'bg-accent' : 'bg-slate-300'
                    }`}
                  />
                  {t(item.label)}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3.5">
          <LanguageSwitcher variant="segmented" />

          <div className="flex items-center gap-2.5 border-t border-slate-100 px-1.5 pt-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[13px] font-semibold text-slate-700">
              {initials(userName).slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-slate-900">{userName}</p>
              <p className="truncate text-xs text-slate-500">{session?.user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="-mt-1.5 flex items-center gap-2 rounded-lg px-3 py-2 text-start text-[13px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
              className="size-4 shrink-0 rtl:-scale-x-100"
            >
              <path
                fillRule="evenodd"
                d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Zm10.47 2.22a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H7.75a.75.75 0 0 1 0-1.5h7.44l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
            {t('nav.signOut')}
          </button>
        </div>
      </aside>
    </>
  )
}
