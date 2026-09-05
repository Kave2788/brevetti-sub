export type CardKind = 'certification' | 'insurance'

export interface BaseCard {
  id: string
  kind: CardKind
  holderName: string
  photoFrontId?: string
  photoBackId?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface CertificationCard extends BaseCard {
  kind: 'certification'
  /** id agenzia didattica, vedi data/agencies.ts */
  agency: string
  /** es. "Open Water Diver", "Rescue Diver", "Nitrox" */
  level: string
  certNumber: string
  issueDate?: string
  expiryDate?: string
  instructor?: string
}

export interface InsuranceCard extends BaseCard {
  kind: 'insurance'
  /** id provider, vedi data/agencies.ts (dan, ecc.) */
  agency: string
  /** es. "Sport Silver", "Master Pro" */
  planName: string
  memberNumber: string
  validFrom?: string
  validTo?: string
  emergencyPhone?: string
}

export type Card = CertificationCard | InsuranceCard

export const isCertification = (c: Card): c is CertificationCard =>
  c.kind === 'certification'

export const isInsurance = (c: Card): c is InsuranceCard =>
  c.kind === 'insurance'

/** Data di scadenza della tessera, se ne ha una. */
export function expiryOf(card: Card): string | undefined {
  return isInsurance(card) ? card.validTo : card.expiryDate
}

/** Numero identificativo mostrato sul fronte della card. */
export function numberOf(card: Card): string {
  return isInsurance(card) ? card.memberNumber : card.certNumber
}

/** Titolo principale della card. */
export function titleOf(card: Card): string {
  return isInsurance(card) ? card.planName : card.level
}
