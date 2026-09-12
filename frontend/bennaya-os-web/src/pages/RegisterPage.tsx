import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../services/api'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
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
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Set up your contracting company</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && <ErrorMessage message={error} />}

          <Input
            label="Your full name"
            required
            autoComplete="name"
            value={form.fullName}
            onChange={update('fullName')}
            error={fieldErrors.fullname}
            placeholder="Mohammad Ali"
          />

          <Input
            label="Company name"
            required
            autoComplete="organization"
            value={form.companyName}
            onChange={update('companyName')}
            error={fieldErrors.companyname}
            placeholder="Bennaya Contracting"
          />

          <Input
            label="Email"
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
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={update('password')}
            error={fieldErrors.password}
            hint="At least 8 characters"
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-900 underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
