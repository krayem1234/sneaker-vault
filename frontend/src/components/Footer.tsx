import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line-soft)', marginTop: 40 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 28px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>V</div>
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: -0.3 }}>VAULT KICKS</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 280 }}>
            Sneakers running, trail et lifestyle sélectionnées pour durer. Projet portfolio — paiement en mode test, aucune vraie transaction.
          </p>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 12 }}>Boutique</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/shop" style={{ fontSize: 13.5, color: 'var(--text)' }}>Tous les produits</Link>
            <Link to="/shop?category=running" style={{ fontSize: 13.5, color: 'var(--text)' }}>Running</Link>
            <Link to="/shop?category=trail" style={{ fontSize: 13.5, color: 'var(--text)' }}>Trail</Link>
            <Link to="/shop?category=lifestyle" style={{ fontSize: 13.5, color: 'var(--text)' }}>Lifestyle</Link>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 12 }}>Mon compte</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/orders" style={{ fontSize: 13.5, color: 'var(--text)' }}>Mes commandes</Link>
            <Link to="/wishlist" style={{ fontSize: 13.5, color: 'var(--text)' }}>Mes favoris</Link>
            <Link to="/cart" style={{ fontSize: 13.5, color: 'var(--text)' }}>Panier</Link>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--line-soft)', padding: '16px 24px', textAlign: 'center', fontSize: 11.5, color: 'var(--muted)' }}>
        © {new Date().getFullYear()} Vault Kicks — projet portfolio, paiements en mode test Stripe uniquement.
      </div>
    </footer>
  )
}
