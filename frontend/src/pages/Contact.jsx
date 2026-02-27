import { useState } from 'react'
import { useApp } from '../App'

function Contact() {
  const { addNotification } = useApp()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    motivo: 'informacion',
    mensaje: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      addNotification('¡Mensaje enviado! Nos pondremos en contacto contigo pronto.', 'success')
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        motivo: 'informacion',
        mensaje: ''
      })
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div className="contact-page">
      <div className="container">
        <div className="page-header">
          <h1>Contáctanos</h1>
          <p>Estamos aquí para ayudarte. Escríbenos o visítanos</p>
        </div>

        <div className="contact-layout">
          {/* Contact Info */}
          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <h3>Dirección</h3>
              <p>Av. Principal 123<br />Col. Centro<br />Ciudad de México</p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">📞</div>
              <h3>Teléfono</h3>
              <p>+52 123 456 7890<br />+52 098 765 4321</p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">✉️</div>
              <h3>Email</h3>
              <p>info@velozamotors.com<br />ventas@velozamotors.com</p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">🕐</div>
              <h3>Horario</h3>
              <p>Lunes - Viernes: 9am - 7pm<br />Sábado: 9am - 5pm<br />Domingo: 11am - 4pm</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form">
              <h2>Envíanos un Mensaje</h2>
              
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+52 123 456 7890"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="motivo">Motivo de Contacto</label>
                <select
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                >
                  <option value="informacion">Información general</option>
                  <option value="compra">Quiero comprar un auto</option>
                  <option value="financiamiento">Información de financiamiento</option>
                  <option value="servicio">Servicio técnico</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">Mensaje *</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="¿En qué podemos ayudarte?"
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="contact-map">
          <div className="map-placeholder">
            <div className="map-icon">🗺️</div>
            <p>Map integration available</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
