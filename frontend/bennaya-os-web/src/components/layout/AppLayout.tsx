import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useLanguage } from '../../hooks/useLanguage'

/**
 * The shell around every signed-in page. <Outlet /> is where React Router
 * renders the matched child route, so the sidebar is mounted once rather than
 * being re-rendered on every navigation.
 */
export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />

      {/* Top bar with the menu button - hidden once the sidebar is permanent. */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label={t('common.openMenu')}
          className="-ms-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path d="M2 5.75A.75.75 0 0 1 2.75 5h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 5.75Zm0 4.5A.75.75 0 0 1 2.75 9.5h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10.25Zm0 4.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" />
          </svg>
        </button>
        <span className="text-base font-semibold text-slate-900">BennayaOS</span>
      </header>

      {/* lg:ps-72 leaves room for the always-visible sidebar on desktop.
          ps/pe (padding-start/end) instead of pl/pr, so the gap follows the
          sidebar to the right-hand side in Arabic. */}
      <main className="px-4 py-6 sm:px-6 lg:ps-72 lg:pe-8">
        <Outlet />
      </main>
    </div>
  )
}
