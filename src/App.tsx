import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CARD_SPRING, PassCard } from './components/PassCard'
import { CardViewer } from './components/CardViewer'
import { CardForm } from './components/CardForm'
import { Settings } from './components/Settings'
import { deleteCard, getAllCards, saveCard } from './db'
import type { Card, CardKind } from './types'

const TOAST_MS = 2600

type View =
  | { name: 'stack' }
  | { name: 'form'; kind: CardKind; id?: string }
  | { name: 'settings' }

export default function App() {
  const [cards, setCards] = useState<Card[]>([])
  const [view, setView] = useState<View>({ name: 'stack' })
  // Il tocco su una tessera porta dritto alla vista a tutto schermo:
  // in home non c'e' nessuno stato intermedio.
  const [viewerId, setViewerId] = useState<string>()
  const [confirmDelete, setConfirmDelete] = useState<string>()
  const [toast, setToast] = useState<string>()

  const reload = useCallback(async () => {
    setCards(await getAllCards())
  }, [])

  useEffect(() => {
    reload().catch(() => setToast('Impossibile leggere l’archivio locale.'))
  }, [reload])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(undefined), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const viewed = cards.find((c) => c.id === viewerId)
  const editing =
    view.name === 'form' && view.id ? cards.find((c) => c.id === view.id) : undefined

  const handleSave = async (card: Card) => {
    try {
      await saveCard(card)
      await reload()
      setView({ name: 'stack' })
      setViewerId(undefined)
      setToast('Tessera salvata.')
    } catch {
      setToast('Salvataggio non riuscito.')
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmDelete(undefined)
    try {
      await deleteCard(id)
      await reload()
      setViewerId(undefined)
      setToast('Tessera eliminata.')
    } catch {
      setToast('Eliminazione non riuscita.')
    }
  }

  if (view.name === 'form') {
    return (
      <div className="app">
        <CardForm
          kind={view.kind}
          existing={editing}
          onSave={handleSave}
          onCancel={() => setView({ name: 'stack' })}
          onError={setToast}
        />
        <Toast message={toast} />
      </div>
    )
  }

  if (view.name === 'settings') {
    return (
      <div className="app">
        <Settings
          cardCount={cards.length}
          onBack={() => setView({ name: 'stack' })}
          onImported={reload}
          onMessage={setToast}
        />
        <Toast message={toast} />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="screen">
        <div className="topbar">
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            <button
              className="icon-btn"
              onClick={() => setView({ name: 'settings' })}
              aria-label="Impostazioni"
            >
              ⚙
            </button>
            <button
              className="icon-btn"
              onClick={() => setView({ name: 'form', kind: 'certification' })}
              aria-label="Aggiungi tessera"
            >
              ＋
            </button>
          </div>
        </div>

        <div className="stack">
          <AnimatePresence initial={false}>
            {cards.map((card) => (
              <motion.div
                layout
                key={card.id}
                className="stack-item"
                transition={CARD_SPRING}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                onClick={() => setViewerId(card.id)}
              >
                <PassCard card={card} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {cards.length === 0 && (
          <div className="empty">
            <div className="empty-glyph">🤿</div>
            <h2>Nessuna tessera</h2>
            <p>
              Aggiungi i tuoi brevetti subacquei e l’assicurazione DAN per averli
              sempre con te, anche senza rete.
            </p>
            <button
              className="submit-btn"
              onClick={() => setView({ name: 'form', kind: 'certification' })}
            >
              Aggiungi la prima tessera
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewed && (
          <CardViewer
            key={viewed.id}
            card={viewed}
            onClose={() => setViewerId(undefined)}
            onEdit={() => setView({ name: 'form', kind: viewed.kind, id: viewed.id })}
            onDelete={() => setConfirmDelete(viewed.id)}
          />
        )}
      </AnimatePresence>

      {confirmDelete && (
        <>
          <div className="sheet-backdrop" onClick={() => setConfirmDelete(undefined)} />
          <motion.div
            className="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          >
            <div className="sheet-grabber" />
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
              La tessera e le sue foto verranno eliminate da questo dispositivo.
            </p>
            <button
              className="sheet-option"
              style={{ color: 'var(--danger)', justifyContent: 'center' }}
              onClick={() => handleDelete(confirmDelete)}
            >
              Elimina definitivamente
            </button>
            <button
              className="sheet-option"
              style={{ justifyContent: 'center' }}
              onClick={() => setConfirmDelete(undefined)}
            >
              Annulla
            </button>
          </motion.div>
        </>
      )}

      <Toast message={toast} />
    </div>
  )
}

function Toast({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
