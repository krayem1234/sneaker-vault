import { LockIcon } from './icons'

export default function PaymentOverlay({ message = 'Connexion sécurisée à Stripe' }: { message?: string }) {
  return (
    <div className="payment-overlay">
      <div className="card-3d-scene">
        <div className="card-3d">
          <div className="card-3d__face card-3d__face--front">
            <div>
              <div className="card-3d__brand">VAULT KICKS</div>
              <div className="card-3d__chip" />
            </div>
            <div className="card-3d__number">•••• •••• •••• 4242</div>
            <div className="card-3d__row">
              <span>
                TITULAIRE
                <span>TON NOM</span>
              </span>
              <span>
                EXPIRE
                <span>12/28</span>
              </span>
            </div>
          </div>
          <div className="card-3d__face card-3d__face--back">
            <div className="card-3d__stripe" />
            <div className="card-3d__cvc">•••</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
        <LockIcon size={14} />
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>
          {message}
          <span className="payment-dots" style={{ marginLeft: 2 }}>
            <span>.</span><span>.</span><span>.</span>
          </span>
        </span>
      </div>
    </div>
  )
}
