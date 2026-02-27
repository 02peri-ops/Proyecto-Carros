import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../App'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, comparisonList } = useApp()
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <div className="logo-icon">🚗</div>
          <span>Veloza Motors</span>
        </Link>
        
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/')}`}>Inicio</Link>
          <Link to="/cars" className={`nav-link ${isActive('/cars')}`}>Autos</Link>
          <Link to="/services" className={`nav-link ${isActive('/services')}`}>Servicios</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>Contacto</Link>
          {comparisonList.length > 0 && (
            <Link to="/cars?compare=true" className="nav-link comparison-badge">
              Comparar ({comparisonList.length})
            </Link>
          )}
        </nav>
        
        <div className="header-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-name">Hola, {user.username}</span>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-secondary btn-sm">Admin</Link>
              )}
              <button onClick={logout} className="btn btn-outline btn-sm">Cerrar Sesión</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Iniciar Sesión</Link>
          )}
        </div>

        <button 
          className="nav-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}

export default Header
