import { useEffect, useState } from 'react'
import { getPhoto } from './db'

const DAY_MS = 24 * 60 * 60 * 1000

/** Giorni di anticipo con cui segnalare una scadenza imminente. */
export const EXPIRY_WARNING_DAYS = 60

export type ExpiryState = 'none' | 'ok' | 'soon' | 'expired'

export interface ExpiryInfo {
  state: ExpiryState
  days: number
  label: string
}

export function expiryInfo(isoDate?: string): ExpiryInfo {
  if (!isoDate) return { state: 'none', days: 0, label: '' }

  const target = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(target.getTime())) {
    return { state: 'none', days: 0, label: '' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((target.getTime() - today.getTime()) / DAY_MS)

  if (days < 0) return { state: 'expired', days, label: 'Scaduta' }
  if (days === 0) return { state: 'soon', days, label: 'Scade oggi' }
  if (days <= EXPIRY_WARNING_DAYS) {
    return { state: 'soon', days, label: `Scade tra ${days} g` }
  }
  return { state: 'ok', days, label: `Valida fino al ${formatDate(isoDate)}` }
}

export function formatDate(isoDate?: string): string {
  if (!isoDate) return '—'
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Espone una foto di IndexedDB come object URL, revocandolo allo smontaggio
 * per non trattenere i blob in memoria.
 */
export function usePhotoUrl(photoId?: string): string | undefined {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    if (!photoId) {
      setUrl(undefined)
      return
    }

    let objectUrl: string | undefined
    let cancelled = false

    getPhoto(photoId)
      .then((blob) => {
        if (cancelled || !blob) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => setUrl(undefined))

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoId])

  return url
}

/** Numero di telefono in formato utilizzabile da un link tel:. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
