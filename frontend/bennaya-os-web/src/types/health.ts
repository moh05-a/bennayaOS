/** Shape of GET /api/health/db from the backend. */
export interface DatabaseHealth {
  status: string
  database: string
  provider: string
}
