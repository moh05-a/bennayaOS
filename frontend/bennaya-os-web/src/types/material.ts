export type MaterialUnit =
  | 'Bag'
  | 'Kg'
  | 'Ton'
  | 'Meter'
  | 'SquareMeter'
  | 'CubicMeter'
  | 'Piece'
  | 'Liter'

/**
 * Labels are translated: full names via t(`materialUnit.${unit}`) for the
 * dropdown, short forms via t(`materialUnitShort.${unit}`) next to numbers.
 */
export const MATERIAL_UNITS: MaterialUnit[] = [
  'Bag',
  'Kg',
  'Ton',
  'Meter',
  'SquareMeter',
  'CubicMeter',
  'Piece',
  'Liter',
]

export interface Material {
  id: string
  name: string
  unit: MaterialUnit
  requiredQuantity: number
  purchasedQuantity: number
  usedQuantity: number
  /** purchased - used. Negative means more was used than bought. */
  availableQuantity: number
  /** required - purchased. Negative means oversupply. */
  remainingToPurchase: number
  estimatedUnitCost: number
  estimatedTotalCost: number
  purchasedCost: number
  isOverSupplied: boolean
  isOverUsed: boolean
  projectId: string
  createdAt: string
}

export interface MaterialList {
  items: Material[]
  totalEstimatedCost: number
  totalPurchasedCost: number
  itemsNeedingPurchase: number
}

export interface MaterialInput {
  name: string
  unit: MaterialUnit
  requiredQuantity: number
  purchasedQuantity: number
  usedQuantity: number
  estimatedUnitCost: number
}
