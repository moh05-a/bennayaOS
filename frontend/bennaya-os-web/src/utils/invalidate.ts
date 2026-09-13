import type { QueryClient } from '@tanstack/react-query'

/**
 * Every money change ripples outward: an expense changes its own list, the
 * project's totals, AND the business-wide dashboard.
 *
 * Keeping that fan-out in one place means adding a future cache (subcontractor
 * balances, materials) is a single edit instead of hunting through every
 * mutation. Forgetting one is how a UI ends up showing two different totals for
 * the same money.
 */
export function invalidateProjectFinancials(queryClient: QueryClient, projectId: string): void {
  void queryClient.invalidateQueries({ queryKey: ['expenses', projectId] })
  void queryClient.invalidateQueries({ queryKey: ['payments', projectId] })
  void queryClient.invalidateQueries({ queryKey: ['subcontractors', projectId] })
  void queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
  void queryClient.invalidateQueries({ queryKey: ['projects'] })
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
}
