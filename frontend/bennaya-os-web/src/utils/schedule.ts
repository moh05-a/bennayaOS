import { todayIsoDate } from './format'

export type ProjectSchedule =
  | { state: 'upcoming'; daysUntilStart: number; elapsedPercent: 0 }
  | { state: 'running'; day: number; totalDays: number; daysLeft: number; elapsedPercent: number }
  | { state: 'overrun'; daysPastEnd: number; elapsedPercent: 100 }

/** Whole days between two "YYYY-MM-DD" dates, ignoring timezones. */
function daysBetween(from: string, to: string): number {
  const toUtc = (iso: string) => {
    const [y = 0, m = 1, d = 1] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000)
}

/**
 * Where today falls between a project's start and expected end, from the two
 * dates the project already has. Null when either date is missing or the end
 * is before the start.
 */
export function projectSchedule(
  startDate: string | null,
  expectedEndDate: string | null,
  today: string = todayIsoDate(),
): ProjectSchedule | null {
  if (!startDate || !expectedEndDate) return null

  const totalDays = daysBetween(startDate, expectedEndDate)
  if (totalDays <= 0) return null

  const elapsed = daysBetween(startDate, today)

  if (elapsed < 0) {
    return { state: 'upcoming', daysUntilStart: -elapsed, elapsedPercent: 0 }
  }

  if (elapsed > totalDays) {
    return { state: 'overrun', daysPastEnd: elapsed - totalDays, elapsedPercent: 100 }
  }

  return {
    state: 'running',
    day: Math.max(1, elapsed),
    totalDays,
    daysLeft: totalDays - elapsed,
    elapsedPercent: (elapsed / totalDays) * 100,
  }
}
