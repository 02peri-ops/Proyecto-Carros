import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">🚗</div>
              <span>Veloza Motors</span>
            </div>
            <p className="footer-description">
              Tu agencia de confianza para comprar el auto de tus sueños. 
              Ofrecemos la mejor selección de vehículos de alta gama.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Enlaces Rápidos</h4>
            <ul className="footer-links">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/cars">Autos</Link></li>
              <li><Link to="/services">Servicios</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Servicios</h4>
            <ul className="footer-links">
              <li><a href="#">Venta de Autos</a></li>
              <li><a href="#">Financiamiento</a></li>
              <li><a href="#">Servicio Técnico</a></li>
              <li><a href="#">Seguro de Auto</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contacto</h4>
            <ul className="footer-contact">
              <li>📍 Dirección: Av. Principal 123</li>
              <li>📞 Teléfono: +52 123 456 7890</li>
              <li>✉️ Email: info@velozamotors.com</li>
              <li>🕐 Horario: Lun-Sáb 9am-7pm</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Veloza Motors. Todos los derechos reservados.</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="Twitter">🐦</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
