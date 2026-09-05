import { useRef, useState, type ChangeEvent } from 'react'
import { defaultAgencyFor } from '../data/agencies'
import { deletePhoto, newId, savePhoto } from '../db'
import type { Card, CardKind } from '../types'
import { usePhotoUrl } from '../utils'
import { Icon } from './Icon'

interface CardFormProps {
  kind: CardKind
  /** card esistente in modifica, oppure undefined per una nuova */
  existing?: Card
  onSave: (card: Card) => void
  onCancel: () => void
  onError: (message: string) => void
}

interface PhotoSlotProps {
  photoId?: string
  label: string
  onPick: (file: File) => void
  onRemove: () => void
}

function PhotoSlot({ photoId, label, onPick, onRemove }: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const url = usePhotoUrl(photoId)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onPick(file)
    // consente di riselezionare lo stesso file dopo una rimozione
    event.target.value = ''
  }

  return (
    <div className="photo-slot" onClick={() => !url && inputRef.current?.click()}>
      {url ? (
        <>
          <img src={url} alt={label} />
          <button
            type="button"
            className="remove"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            aria-label={`Rimuovi ${label}`}
          >
            <Icon name="close" size={15} weight={2} />
          </button>
        </>
      ) : (
        <span className="photo-slot-empty">
          <Icon name="camera" size={26} weight={1.3} />
          {label}
        </span>
      )}
      {/* Niente attributo `capture`: su iOS forzerebbe la fotocamera,
          mentre le foto delle tessere di solito sono gia' in galleria.
          Cosi' il telefono lascia scegliere fra scatto, libreria e file. */}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
    </div>
  )
}

/**
 * Inserimento di una tessera: solo le foto del documento.
 * Nessun campo da compilare — la foto e' la tessera.
 */
export function CardForm({ kind, existing, onSave, onCancel, onError }: CardFormProps) {
  const [photoFrontId, setPhotoFrontId] = useState(existing?.photoFrontId)
  const [photoBackId, setPhotoBackId] = useState(existing?.photoBackId)
  const [busy, setBusy] = useState(false)

  const pickPhoto = async (
    file: File,
    current: string | undefined,
    set: (id?: string) => void,
  ) => {
    setBusy(true)
    try {
      const id = await savePhoto(file)
      if (current) await deletePhoto(current)
      set(id)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Foto non salvata.')
    } finally {
      setBusy(false)
    }
  }

  const removePhoto = async (current: string | undefined, set: (id?: string) => void) => {
    if (current) await deletePhoto(current)
    set(undefined)
  }

  const canSave = Boolean(photoFrontId || photoBackId) && !busy

  const handleSubmit = () => {
    if (!canSave) return
    const now = Date.now()

    // In modifica si cambiano solo le foto: eventuali dati arrivati da un
    // backup restano intatti.
    const card: Card = existing
      ? { ...existing, photoFrontId, photoBackId, updatedAt: now }
      : {
          id: newId('c'),
          kind: 'certification',
          agency: defaultAgencyFor(kind),
          level: '',
          certNumber: '',
          holderName: '',
          photoFrontId,
          photoBackId,
          createdAt: now,
          updatedAt: now,
        }

    onSave(card)
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="text-btn" onClick={onCancel}>
          Annulla
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600 }}>
          {existing ? 'Modifica foto' : 'Nuova tessera'}
        </h1>
        <button className="text-btn" onClick={handleSubmit} disabled={!canSave}>
          Salva
        </button>
      </div>

      <p className="form-hint">Fotografa la tessera. Non serve altro.</p>

      <div className="photo-picker">
        <PhotoSlot
          photoId={photoFrontId}
          label="Fronte"
          onPick={(file) => pickPhoto(file, photoFrontId, setPhotoFrontId)}
          onRemove={() => removePhoto(photoFrontId, setPhotoFrontId)}
        />
        <PhotoSlot
          photoId={photoBackId}
          label="Retro"
          onPick={(file) => pickPhoto(file, photoBackId, setPhotoBackId)}
          onRemove={() => removePhoto(photoBackId, setPhotoBackId)}
        />
      </div>

      <button className="submit-btn" onClick={handleSubmit} disabled={!canSave}>
        {busy ? 'Elaborazione foto…' : 'Salva tessera'}
      </button>
    </div>
  )
}
