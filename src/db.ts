import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Card } from './types'

const DB_NAME = 'brevetti-sub'
const DB_VERSION = 1

const MAX_IMAGE_EDGE = 1600
const IMAGE_QUALITY = 0.85

interface PhotoRecord {
  id: string
  blob: Blob
}

interface BrevettiDB extends DBSchema {
  cards: { key: string; value: Card }
  photos: { key: string; value: PhotoRecord }
}

let dbPromise: Promise<IDBPDatabase<BrevettiDB>> | null = null

function db(): Promise<IDBPDatabase<BrevettiDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BrevettiDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('cards')) {
          database.createObjectStore('cards', { keyPath: 'id' })
        }
        if (!database.objectStoreNames.contains('photos')) {
          database.createObjectStore('photos', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 12)}`
}

/* ---------------------------------------------------------------- cards */

export async function getAllCards(): Promise<Card[]> {
  const cards = await (await db()).getAll('cards')
  return [...cards].sort((a, b) => a.createdAt - b.createdAt)
}

export async function saveCard(card: Card): Promise<void> {
  await (await db()).put('cards', card)
}

export async function deleteCard(id: string): Promise<void> {
  const database = await db()
  const card = await database.get('cards', id)
  if (card) {
    await Promise.all(
      [card.photoFrontId, card.photoBackId]
        .filter((p): p is string => Boolean(p))
        .map((photoId) => database.delete('photos', photoId)),
    )
  }
  await database.delete('cards', id)
}

/* --------------------------------------------------------------- photos */

/**
 * Ridimensiona e ricomprime prima di salvare: le foto da fotocamera sono
 * da diversi MB e lo spazio del browser sul telefono e' limitato.
 */
export async function processImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Impossibile elaborare l’immagine su questo dispositivo.')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', IMAGE_QUALITY),
  )
  if (!blob) throw new Error('Conversione dell’immagine non riuscita.')
  return blob
}

export async function savePhoto(file: Blob): Promise<string> {
  const blob = await processImage(file)
  const id = newId('p')
  await (await db()).put('photos', { id, blob })
  return id
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  return (await (await db()).get('photos', id))?.blob
}

export async function deletePhoto(id: string): Promise<void> {
  await (await db()).delete('photos', id)
}

/* --------------------------------------------------------------- backup */

export interface BackupFile {
  version: number
  exportedAt: string
  cards: Card[]
  photos: { id: string; dataUrl: string }[]
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

export async function exportBackup(): Promise<BackupFile> {
  const database = await db()
  const cards = await database.getAll('cards')
  const photos = await database.getAll('photos')
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    cards,
    photos: await Promise.all(
      photos.map(async (p) => ({ id: p.id, dataUrl: await blobToDataUrl(p.blob) })),
    ),
  }
}

/** Ripristina un backup. Le card con lo stesso id vengono sovrascritte. */
export async function importBackup(backup: BackupFile): Promise<number> {
  if (!backup || !Array.isArray(backup.cards)) {
    throw new Error('File di backup non valido.')
  }
  const database = await db()
  for (const photo of backup.photos ?? []) {
    await database.put('photos', { id: photo.id, blob: await dataUrlToBlob(photo.dataUrl) })
  }
  for (const card of backup.cards) {
    await database.put('cards', card)
  }
  return backup.cards.length
}

/** Spazio occupato, per la schermata impostazioni. */
export async function storageEstimate(): Promise<{ usedMb: number; quotaMb: number } | null> {
  if (!navigator.storage?.estimate) return null
  const { usage = 0, quota = 0 } = await navigator.storage.estimate()
  return { usedMb: usage / 1024 / 1024, quotaMb: quota / 1024 / 1024 }
}

/**
 * Chiede al browser di non sfrattare i dati sotto pressione di spazio.
 * Su iOS non e' garantito, per questo esiste comunque il backup.
 */
export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  return navigator.storage.persist()
}
