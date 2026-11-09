import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import ThemeToggle from './ThemeToggle'
import { BagIcon, UserIcon, LogOutIcon, SettingsIcon } from './icons'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  return (
    <div className="navbar">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>
          V
        </div>
        <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: -0.3 }}>VAULT KICKS</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link to="/shop" className="btn-ghost hide-mobile" style={{ border: 'none', background: 'none', padding: '8px 12px' }}>Boutique</Link>
        {user && (
          <Link to="/orders" className="btn-ghost hide-mobile" style={{ border: 'none', background: 'none', padding: '8px 12px' }}>Mes commandes</Link>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin" className="icon-btn" title="Admin">
            <SettingsIcon />
          </Link>
        )}
        <ThemeToggle />
        <Link to="/cart" className="icon-btn" title="Panier">
          <BagIcon />
          {count > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2, background: 'var(--accent)', color: '#fff',
              fontSize: 10, fontWeight: 800, borderRadius: 999, minWidth: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
            }}>
              {count}
            </span>
          )}
        </Link>
        {user ? (
          <button className="icon-btn" title={`${user.name} — déconnexion`} onClick={() => { logout(); navigate('/') }}>
            <LogOutIcon size={16} />
          </button>
        ) : (
          <Link to="/login" className="icon-btn" title="Connexion">
            <UserIcon />
          </Link>
        )}
      </div>
    </div>
  )
}
