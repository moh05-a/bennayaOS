import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { projectsApi } from '../../services/projectsApi'
import { ApiError } from '../../services/api'
import { useCurrency } from '../../hooks/useCurrency'

export function ProjectsPage() {
  const navigate = useNavigate()
  const { format } = useCurrency()

  const { data: projects, isPending, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: ({ signal }) => projectsApi.list(signal),
  })

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Projects"
        description="Every job you are running."
        action={<Button onClick={() => navigate('/projects/new')}>New project</Button>}
      />

      {isPending && <Spinner label="Loading projects" />}

      {isError && (
        <ErrorMessage
          message={error instanceof ApiError ? error.message : 'Could not load projects.'}
        />
      )}

      {projects && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking its contract value, expenses and payments."
          action={<Button onClick={() => navigate('/projects/new')}>New project</Button>}
        />
      )}

      {projects && projects.length > 0 && (
        <>
          {/* MOBILE: tappable cards */}
          <ul className="space-y-3 sm:hidden">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/projects/${project.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-medium text-slate-900">{project.name}</p>
                    <StatusBadge status={project.status} />
                  </div>

                  <p className="mt-0.5 truncate text-sm text-slate-500">{project.clientName}</p>

                  <p className="mt-3 text-lg font-semibold tabular-nums text-slate-900">
                    {format(project.contractValue)}
                  </p>

                  <div className="mt-2 flex gap-4 text-xs">
                    <span className="text-slate-500">
                      Received{' '}
                      <span className="font-medium tabular-nums text-emerald-700">
                        {format(project.totalReceived)}
                      </span>
                    </span>
                    <span className="text-slate-500">
                      Spent{' '}
                      <span
                        className={`font-medium tabular-nums ${
                          project.totalExpenses > project.contractValue
                            ? 'text-red-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {format(project.totalExpenses)}
                      </span>
                    </span>
                  </div>

                  {project.location && (
                    <p className="mt-1 truncate text-xs text-slate-500">{project.location}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* DESKTOP: table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Contract value</th>
                  <th className="px-4 py-3 text-right font-medium">Received</th>
                  <th className="px-4 py-3 text-right font-medium">Spent</th>
                  <th className="px-4 py-3 text-right font-medium">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-medium text-slate-900 hover:underline"
                        // The whole row is clickable; this stops the link from
                        // firing navigation twice.
                        onClick={(event) => event.stopPropagation()}
                      >
                        {project.name}
                      </Link>
                      {project.location && (
                        <p className="text-xs text-slate-500">{project.location}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{project.clientName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                      {format(project.contractValue)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-700">
                      {format(project.totalReceived)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums ${
                        project.totalExpenses > project.contractValue
                          ? 'font-medium text-red-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {format(project.totalExpenses)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                      {format(project.outstandingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
