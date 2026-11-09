export default function CardPaymentAnimation() {
  return (
    <div className="modal-overlay" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="pay-card-scene fade-in">
        <div className="pay-card">
          <div className="pay-card-shine" />
          <div className="pay-card-chip" />
          <div className="pay-card-number">•••• •••• •••• 4242</div>
          <div className="pay-card-brand">VAULT KICKS</div>
        </div>
        <div className="pay-card-dots">
          <span /><span /><span />
        </div>
        <p className="pay-card-label">Préparation du paiement sécurisé...</p>
      </div>
    </div>
  )
}
