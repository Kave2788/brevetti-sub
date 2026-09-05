import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  exportBackup,
  importBackup,
  requestPersistence,
  storageEstimate,
  type BackupFile,
} from '../db'
import { todayIso } from '../utils'

interface SettingsProps {
  cardCount: number
  onBack: () => void
  onImported: () => void
  onMessage: (message: string) => void
}

export function Settings({ cardCount, onBack, onImported, onMessage }: SettingsProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [storage, setStorage] = useState<{ usedMb: number; quotaMb: number } | null>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)

  useEffect(() => {
    storageEstimate().then(setStorage).catch(() => setStorage(null))
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null))
  }, [])

  const handleExport = async () => {
    try {
      const backup = await exportBackup()
      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })
      const filename = `brevetti-backup-${todayIso()}.json`
      const file = new File([blob], filename, { type: 'application/json' })

      // Su iOS il foglio di condivisione e' l'unico modo comodo per salvare il file.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Backup brevetti' })
        return
      }

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)
      onMessage('Backup esportato.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      onMessage('Esportazione non riuscita.')
    }
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const backup = JSON.parse(await file.text()) as BackupFile
      const count = await importBackup(backup)
      onImported()
      onMessage(`Importate ${count} tessere.`)
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Import non riuscito.')
    }
  }

  const handlePersist = async () => {
    const granted = await requestPersistence()
    setPersisted(granted)
    onMessage(
      granted
        ? 'Archiviazione resa persistente.'
        : 'Il browser non ha concesso l’archiviazione persistente: tieni un backup.',
    )
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="text-btn" onClick={onBack}>
          ‹ Tessere
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600 }}>Impostazioni</h1>
        <span style={{ width: 60 }} />
      </div>

      <div className="section-title">Backup</div>
      <div className="detail-fields" style={{ marginTop: 0 }}>
        <div className="field-row">
          <span className="field-label">Tessere salvate</span>
          <span className="field-value">{cardCount}</span>
        </div>
        {storage && (
          <div className="field-row">
            <span className="field-label">Spazio usato</span>
            <span className="field-value">
              {storage.usedMb.toFixed(1)} MB
              {storage.quotaMb > 0 && ` / ${storage.quotaMb.toFixed(0)} MB`}
            </span>
          </div>
        )}
        <div className="field-row">
          <span className="field-label">Archiviazione</span>
          <span className="field-value">
            {persisted === null ? '—' : persisted ? 'Persistente' : 'Non garantita'}
          </span>
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.45, padding: '0 4px' }}>
        I dati restano solo su questo dispositivo: non esiste un server. Esporta un
        backup prima di cambiare telefono o svuotare i dati del browser.
      </p>

      <button className="big-action neutral" onClick={handleExport}>
        Esporta backup
      </button>
      <button className="big-action neutral" onClick={() => fileRef.current?.click()}>
        Importa backup
      </button>
      {persisted === false && (
        <button className="big-action neutral" onClick={handlePersist}>
          Rendi l’archiviazione persistente
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleImport}
      />
    </div>
  )
}
