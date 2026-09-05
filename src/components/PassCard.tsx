import { motion } from 'motion/react'
import { getAgency } from '../data/agencies'
import { expiryOf, isInsurance, numberOf, titleOf, type Card } from '../types'
import { expiryInfo, usePhotoUrl } from '../utils'

/** Stessa molla nello stack e nel dettaglio: l'apertura resta una sola
 *  animazione continua, senza scatti a meta' strada. */
export const CARD_SPRING = { type: 'spring', stiffness: 320, damping: 34 } as const

interface PassCardProps {
  card: Card
  /** collega l'animazione fra stack e dettaglio */
  layoutId?: string
}

export function PassCard({ card, layoutId }: PassCardProps) {
  const agency = getAgency(card.agency)
  const expiry = expiryInfo(expiryOf(card))
  const showBadge = expiry.state === 'soon' || expiry.state === 'expired'
  // Quando c'e' la foto del documento, e' lei la faccia della tessera:
  // e' cio' che si mostra davvero al diving.
  const photoUrl = usePhotoUrl(card.photoFrontId)

  // Tessera senza alcun dato scritto: si mostra la sola foto, senza velo
  // scuro ne' scritte sopra. E' il caso normale di chi carica e basta.
  const bare =
    Boolean(photoUrl) &&
    !showBadge &&
    !titleOf(card) &&
    !card.holderName &&
    !numberOf(card)

  return (
    <motion.div
      layoutId={layoutId}
      className={`pass${photoUrl ? ' has-photo' : ''}${bare ? ' bare' : ''}`}
      style={{ background: agency.gradient, color: agency.ink }}
      transition={CARD_SPRING}
    >
      {/* foto intera, mai ritagliata: il livello del brevetto sta in mezzo
          alla tessera, e ritagliandola sparirebbe */}
      {photoUrl && <img className="pass-photo" src={photoUrl} alt="" />}

      {!bare && (
        <>
      {/* Titolo nell'intestazione: nello stack e' l'unica parte visibile,
          e due tessere della stessa agenzia devono restare distinguibili. */}
      <div className="pass-head">
        <div className="pass-top">
          <span className="pass-agency">{agency.short}</span>
          {showBadge ? (
            <span className={`badge ${expiry.state === 'expired' ? 'expired' : 'warn'}`}>
              {expiry.label}
            </span>
          ) : (
            <span className="pass-kind">
              {isInsurance(card) ? 'Assicurazione' : 'Brevetto'}
            </span>
          )}
        </div>
        <h2 className="pass-title">
          {titleOf(card) || (isInsurance(card) ? 'Assicurazione' : 'Brevetto')}
        </h2>
      </div>

      {/* Con l'inserimento rapido i dettagli possono mancare del tutto:
          in quel caso il piede della tessera semplicemente non esiste. */}
      {(card.holderName || numberOf(card)) && (
        <div className="pass-foot">
          {card.holderName && (
            <div>
              <div className="pass-label">Intestatario</div>
              <div className="pass-value">{card.holderName}</div>
            </div>
          )}
          {numberOf(card) && (
            <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
              <div className="pass-label">
                {isInsurance(card) ? 'Nº socio' : 'Nº brevetto'}
              </div>
              <div className="pass-value mono">{numberOf(card)}</div>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </motion.div>
  )
}
