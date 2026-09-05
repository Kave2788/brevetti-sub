import { motion } from 'motion/react'
import { getAgency } from '../data/agencies'
import { expiryOf, isInsurance, numberOf, titleOf, type Card } from '../types'
import { expiryInfo, formatDate, telHref, usePhotoUrl } from '../utils'
import { Icon } from './Icon'

interface CardViewerProps {
  card: Card
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="field-row">
      <span className="field-label">{label}</span>
      <span className="field-value">{value}</span>
    </div>
  )
}

/**
 * La tessera a tutto schermo: e' il momento in cui la si mostra davvero,
 * quindi la foto occupa tutto e si puo' ingrandire con due dita.
 */
export function CardViewer({ card, onClose, onEdit, onDelete }: CardViewerProps) {
  const agency = getAgency(card.agency)
  const expiry = expiryInfo(expiryOf(card))
  const frontUrl = usePhotoUrl(card.photoFrontId)
  const backUrl = usePhotoUrl(card.photoBackId)

  const hasFields = Boolean(
    titleOf(card) || card.holderName || numberOf(card) || expiryOf(card) || card.notes,
  )

  return (
    <motion.div
      className="viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="viewer-bar">
        <button className="icon-btn" onClick={onClose} aria-label="Chiudi">
          <Icon name="close" size={19} weight={1.9} />
        </button>
        {expiry.state === 'expired' && <span className="badge expired">Scaduta</span>}
        {expiry.state === 'soon' && <span className="badge warn">{expiry.label}</span>}
      </div>

      <div className="viewer-body">
        {frontUrl && <img className="viewer-photo" src={frontUrl} alt={agency.name} />}
        {backUrl && <img className="viewer-photo" src={backUrl} alt={`${agency.name} — retro`} />}

        {isInsurance(card) && card.emergencyPhone && (
          <a className="big-action" href={telHref(card.emergencyPhone)}>
            <Icon name="phone" size={19} />
            Emergenza {agency.short}
          </a>
        )}

        {hasFields && (
          <div className="detail-fields">
            {isInsurance(card) ? (
              <>
                <Field label="Compagnia" value={agency.name} />
                <Field label="Piano" value={card.planName} />
                <Field label="Nº socio" value={card.memberNumber} />
                <Field label="Intestatario" value={card.holderName} />
                <Field label="Valida fino al" value={formatDate(card.validTo)} />
              </>
            ) : (
              <>
                <Field label="Agenzia" value={agency.name} />
                <Field label="Livello" value={card.level} />
                <Field label="Nº brevetto" value={card.certNumber} />
                <Field label="Intestatario" value={card.holderName} />
              </>
            )}
            <Field label="Note" value={card.notes} />
          </div>
        )}

        <div className="detail-actions">
          <button className="pill-btn" onClick={onEdit}>
            <Icon name="camera" size={18} />
            Cambia foto
          </button>
          <button className="pill-btn danger" onClick={onDelete}>
            <Icon name="trash" size={18} />
            Elimina
          </button>
        </div>
      </div>
    </motion.div>
  )
}
