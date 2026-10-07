/**
 * "Bennaya Contracting" -> "BC", "Khaled Haddad" -> "KH", "testcompany" -> "TE".
 * Used for the small avatar squares next to company and person names.
 * Array.from splits by character, so Arabic names work too.
 */
export function initials(name: string): string {
  const [first = '', second = ''] = name.trim().split(/\s+/).filter(Boolean)
  if (!first) return '?'

  const letters = second
    ? [Array.from(first)[0], Array.from(second)[0]]
    : Array.from(first).slice(0, 2)

  return letters.join('').toUpperCase()
}
