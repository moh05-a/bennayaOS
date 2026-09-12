/// <reference types="vite/client" />

/**
 * Typed environment variables.
 * Adding a key here makes import.meta.env.VITE_XXX autocomplete and type-check
 * instead of silently being `any`.
 *
 * Only NON-SECRET values belong in VITE_ variables: everything prefixed with
 * VITE_ is embedded into the JavaScript bundle the browser downloads.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
