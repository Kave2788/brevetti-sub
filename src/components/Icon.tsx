import type { ReactNode } from 'react'

export type IconName =
  | 'plus'
  | 'settings'
  | 'close'
  | 'back'
  | 'trash'
  | 'camera'
  | 'card'
  | 'phone'

interface IconProps {
  name: IconName
  size?: number
  /** spessore del tratto: 1.6 di serie, piu' sottile sulle icone grandi */
  weight?: number
}

/**
 * Icone vettoriali disegnate a mano, non emoji: le emoji cambiano forma
 * su ogni sistema e non seguono il colore del testo.
 */
export function Icon({ name, size = 22, weight = 1.6 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shapes[name]}
    </svg>
  )
}

const shapes: Record<IconName, ReactNode> = {
  plus: <path d="M12 5.5v13M5.5 12h13" />,

  settings: (
    <>
      <path d="M4 8h8M16.5 8H20M4 16h3.5M12 16h8" />
      <circle cx="14" cy="8" r="2.2" />
      <circle cx="9.5" cy="16" r="2.2" />
    </>
  ),

  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,

  back: <path d="M14.5 5.5L8 12l6.5 6.5" />,

  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2h9.2L17.5 7" />
      <path d="M10.3 10.7v5.6M13.7 10.7v5.6" />
    </>
  ),

  camera: (
    <>
      <path d="M3.5 8.8A1.8 1.8 0 015.3 7h2.3l1.3-2h6.2l1.3 2h2.3a1.8 1.8 0 011.8 1.8v8.4a1.8 1.8 0 01-1.8 1.8H5.3a1.8 1.8 0 01-1.8-1.8z" />
      <circle cx="12" cy="12.8" r="3.4" />
    </>
  ),

  card: (
    <>
      <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.4" />
      <circle cx="8.4" cy="11" r="2.1" />
      <path d="M4.9 16.4c.5-1.6 1.9-2.5 3.5-2.5s3 .9 3.5 2.5M14.6 10h4.2M14.6 13.4h4.2" />
    </>
  ),

  phone: (
    <path d="M6.4 3.8h3l1.5 3.7-1.9 1.4a11.4 11.4 0 005.1 5.1l1.4-1.9 3.7 1.5v3a1.7 1.7 0 01-1.9 1.7A15.8 15.8 0 014.7 5.7a1.7 1.7 0 011.7-1.9z" />
  ),
}
