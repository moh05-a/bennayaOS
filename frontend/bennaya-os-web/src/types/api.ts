/**
 * RFC 9457 ProblemDetails - what our GlobalExceptionHandler and ASP.NET Core
 * model validation both return.
 */
export interface ProblemDetails {
  title?: string
  status?: number
  detail?: string
  /** Field-level validation errors, e.g. { Name: ["Client name is required."] } */
  errors?: Record<string, string[]>
}
