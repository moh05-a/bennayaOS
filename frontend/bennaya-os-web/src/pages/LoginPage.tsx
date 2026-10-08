import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { ApiError } from '../services/api'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Already signed in? Skip the form entirely.
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ email, password })
      // Send them back to wherever ProtectedRoute intercepted them.
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/dashboard', { replace: true })
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : t('errors.generic'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <LanguageSwitcher className="absolute end-4 top-4" />

      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <BrandMark size={96} variant="full" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">BennayaOS</h1>
          <p className="mt-1 text-sm text-slate-500">{t('auth.signInSubtitle')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && <ErrorMessage message={error} />}

          <Input
            label={t('auth.email')}
            type="email"
            // inputMode + autoComplete make phone keyboards and password
            // managers behave correctly - small details contractors notice.
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.jo"
          />

          <Input
            label={t('auth.password')}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {t('auth.signIn')}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-medium text-slate-900 underline underline-offset-4">
            {t('auth.createOne')}
          </Link>
        </p>
      </div>
    </div>
  )
}
