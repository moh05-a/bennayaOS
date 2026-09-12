import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function Textarea({ label, error, className = '', ...rest }: TextareaProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 shadow-sm
          placeholder:text-slate-400 focus:outline-none focus:ring-2
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-300 focus:border-slate-500 focus:ring-slate-100'}
          ${className}`}
        {...rest}
      />

      {error && <p id={errorId} className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
