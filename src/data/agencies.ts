import type { CardKind } from '../types'

export interface Agency {
  id: string
  name: string
  short: string
  kind: CardKind
  /** gradiente di sfondo della card */
  gradient: string
  /** colore del testo sulla card */
  ink: string
}

const AGENCY_LIST: Agency[] = [
  {
    id: 'padi',
    name: 'PADI',
    short: 'PADI',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #0b3d91 0%, #071f4d 100%)',
    ink: '#ffffff',
  },
  {
    id: 'ssi',
    name: 'SSI — Scuba Schools International',
    short: 'SSI',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #1f2a37 0%, #0b0f14 100%)',
    ink: '#ffffff',
  },
  {
    id: 'cmas',
    name: 'CMAS',
    short: 'CMAS',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #0f6fc5 0%, #073b6b 100%)',
    ink: '#ffffff',
  },
  {
    id: 'fipsas',
    name: 'FIPSAS',
    short: 'FIPSAS',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #1d6fa5 0%, #0a2f47 100%)',
    ink: '#ffffff',
  },
  {
    id: 'naui',
    name: 'NAUI',
    short: 'NAUI',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #1b4b8f 0%, #0a1f3d 100%)',
    ink: '#ffffff',
  },
  {
    id: 'sdi',
    name: 'SDI / TDI',
    short: 'SDI',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #2b3a55 0%, #10161f 100%)',
    ink: '#ffffff',
  },
  {
    id: 'raid',
    name: 'RAID',
    short: 'RAID',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #7b1220 0%, #2b060c 100%)',
    ink: '#ffffff',
  },
  {
    id: 'esa',
    name: 'ESA',
    short: 'ESA',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #0d7a6b 0%, #04302a 100%)',
    ink: '#ffffff',
  },
  {
    id: 'apnea',
    name: 'Apnea Academy',
    short: 'APNEA',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #123c5a 0%, #04141f 100%)',
    ink: '#ffffff',
  },
  {
    id: 'other-cert',
    name: 'Altra agenzia',
    short: 'BREVETTO',
    kind: 'certification',
    gradient: 'linear-gradient(160deg, #3a3f47 0%, #16191d 100%)',
    ink: '#ffffff',
  },
  {
    id: 'dan',
    name: 'DAN Europe',
    short: 'DAN',
    kind: 'insurance',
    gradient: 'linear-gradient(160deg, #0f7a3d 0%, #063b1e 100%)',
    ink: '#ffffff',
  },
  {
    id: 'other-ins',
    name: 'Altra assicurazione',
    short: 'ASSICURAZIONE',
    kind: 'insurance',
    gradient: 'linear-gradient(160deg, #4a4030 0%, #1c1811 100%)',
    ink: '#ffffff',
  },
]

const FALLBACK: Agency = {
  id: 'unknown',
  name: 'Documento',
  short: 'DOC',
  kind: 'certification',
  gradient: 'linear-gradient(160deg, #3a3f47 0%, #16191d 100%)',
  ink: '#ffffff',
}

export const AGENCIES = AGENCY_LIST

export function agenciesFor(kind: CardKind): Agency[] {
  return AGENCY_LIST.filter((a) => a.kind === kind)
}

/**
 * Agenzia di partenza per una tessera nuova: neutra, non PADI. Chi carica
 * solo la foto non ha dichiarato nessuna agenzia, e indovinarla sarebbe
 * peggio che non scriverla.
 */
export function defaultAgencyFor(kind: CardKind): string {
  return kind === 'insurance' ? 'other-ins' : 'other-cert'
}

export function getAgency(id: string): Agency {
  return AGENCY_LIST.find((a) => a.id === id) ?? FALLBACK
}

/** Numero di emergenza DAN Europe, preimpostato sulle nuove polizze DAN. */
export const DAN_EMERGENCY_PHONE = '+39 06 4211 8685'

/** Livelli suggeriti nel form, per velocizzare l'inserimento. */
export const COMMON_LEVELS = [
  'Open Water Diver',
  'Advanced Open Water Diver',
  'Rescue Diver',
  'Divemaster',
  'Istruttore',
  'Enriched Air / Nitrox',
  'Deep Diver',
  'Wreck Diver',
  'Night Diver',
  'Primo soccorso / EFR',
  'Apnea 1° livello',
  'Apnea 2° livello',
]
