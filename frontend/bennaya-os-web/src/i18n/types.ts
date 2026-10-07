import type { en } from './en'

export type Language = 'en' | 'ar'

/** A plural entry: `other` is required, the rest depend on the language. */
export type PluralForms = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>

type Shape<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends { other: string }
      ? PluralForms
      : Shape<T[K]>
}

/** The structure every language file must follow - derived from en.ts. */
export type Dictionary = Shape<typeof en>

type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string | { other: string }
    ? `${Prefix}${K}`
    : Paths<T[K], `${Prefix}${K}.`>
}[keyof T & string]

/** Every valid key, e.g. 'clients.title'. A typo is a compile error. */
export type TranslationKey = Paths<typeof en>

/** Values for {placeholders}. `count` also selects the plural form. */
export type TranslationParams = Record<string, string | number>
