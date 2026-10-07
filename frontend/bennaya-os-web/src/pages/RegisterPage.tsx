import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { ApiError } from '../services/api'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  // One handler for every field, keyed by the input's name attribute.
  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await register({ ...form, currencyCode: 'JOD' })
      navigate('/dashboard', { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        // 400 carries per-field messages; anything else is a single banner.
        const errors = caught.fieldErrors
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
        } else {
          setError(caught.message)
        }
      } else {
        setError(t('errors.generic'))
      }
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
            <BrandMark size={44} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('auth.registerTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('auth.registerSubtitle')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && <ErrorMessage message={error} />}

          <Input
            label={t('auth.fullName')}
            required
            autoComplete="name"
            value={form.fullName}
            onChange={update('fullName')}
            error={fieldErrors.fullname}
            placeholder={t('auth.fullNamePlaceholder')}
          />

          <Input
            label={t('auth.companyName')}
            required
            autoComplete="organization"
            value={form.companyName}
            onChange={update('companyName')}
            error={fieldErrors.companyname}
            placeholder={t('auth.companyNamePlaceholder')}
          />

          <Input
            label={t('auth.email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={update('email')}
            error={fieldErrors.email}
            placeholder="you@company.jo"
          />

          <Input
            label={t('auth.password')}
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={update('password')}
            error={fieldErrors.password}
            hint={t('auth.passwordHint')}
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {t('auth.createAccount')}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-slate-900 underline underline-offset-4">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
