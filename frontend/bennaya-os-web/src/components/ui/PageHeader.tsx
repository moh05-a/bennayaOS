import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  /** Small line above the title, e.g. today's date. */
  eyebrow?: string
  action?: ReactNode
}

export function PageHeader({ title, description, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-sm text-slate-500">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
          {title}
        </h1>
        {description && <p className="mt-1 text-[15px] text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
