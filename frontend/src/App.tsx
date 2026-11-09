import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  const location = useLocation()
  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  )
}
