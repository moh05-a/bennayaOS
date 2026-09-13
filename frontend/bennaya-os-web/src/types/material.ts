export type MaterialUnit =
  | 'Bag'
  | 'Kg'
  | 'Ton'
  | 'Meter'
  | 'SquareMeter'
  | 'CubicMeter'
  | 'Piece'
  | 'Liter'

/** Short labels for display; full names for the dropdown. */
export const MATERIAL_UNITS: { value: MaterialUnit; label: string; short: string }[] = [
  { value: 'Bag', label: 'Bag', short: 'bag' },
  { value: 'Kg', label: 'Kilogram', short: 'kg' },
  { value: 'Ton', label: 'Ton', short: 'ton' },
  { value: 'Meter', label: 'Meter', short: 'm' },
  { value: 'SquareMeter', label: 'Square meter', short: 'm\u00b2' },
  { value: 'CubicMeter', label: 'Cubic meter', short: 'm\u00b3' },
  { value: 'Piece', label: 'Piece', short: 'pc' },
  { value: 'Liter', label: 'Liter', short: 'L' },
]

export function unitShort(unit: MaterialUnit): string {
  return MATERIAL_UNITS.find((u) => u.value === unit)?.short ?? unit
}

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
