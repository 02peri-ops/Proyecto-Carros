import { Link } from 'react-router-dom'

function Services() {
  const services = [
    {
      icon: '🚗',
      title: 'Venta de Autos',
      description: 'Amplio inventario de vehículos nuevos y seminuevos de las mejores marcas del mercado.',
      features: ['Vehículos certificados', 'Garantía extendida', 'Historial verificado']
    },
    {
      icon: '💰',
      title: 'Financiamiento',
      description: 'Planes de financiamiento flexibles adaptados a tus necesidades y capacidad de pago.',
      features: ['Tasas competitivas', 'Aprobación rápida', 'Sin anticipo disponible']
    },
    {
      icon: '🔧',
      title: 'Servicio Técnico',
      description: 'Mantenimiento y reparaciones con técnicos certificados y refacciones originales.',
      services: ['Cambio de aceite', 'Alineación y balanceo', 'Diagnóstico computarizado']
    },
    {
      icon: '📋',
      title: 'Trámites',
      description: 'Te ayudamos con todos los tramites de documentación de tu vehículo.',
      features: ['Transferencia', 'Verificación', 'Seguro']
    },
    {
      icon: '🔄',
      title: 'Trade-In',
      description: 'Cambia tu auto actual por uno nuevo. Evaluamos tu vehículo al instante.',
      features: ['Cotización inmediata', 'Mejor precio de mercado', 'Proceso rápido']
    },
    {
      icon: '🛡️',
      title: 'Seguro',
      description: 'Coberturas de seguro adaptadas a tus necesidades con las mejores aseguradoras.',
      features: ['Cobertura completa', 'Precios competitivos', 'Asistencia 24/7']
    }
  ]

  return (
    <div className="services-page">
      <div className="container">
        <div className="page-header">
          <h1>Nuestros Servicios</h1>
          <p>Una gama completa de servicios para satisfacer todas tus necesidades automotrices</p>
        </div>

        <div className="services-detail-grid">
          {services.map((service, index) => (
            <div key={index} className="service-detail-card">
              <div className="service-detail-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul className="service-features">
                {(service.features || service.services)?.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <Link to="/contact" className="btn btn-primary">Solicitar Información</Link>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <section className="why-choose-us">
          <div className="section-header">
            <h2>¿Por Qué Elegirnos?</h2>
          </div>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🏆</div>
              <h4>Experiencia</h4>
              <p>Más de 15 años en el mercado automotriz</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">⭐</div>
              <h4>Calidad</h4>
              <p>Vehículos inspected y certificados</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🤝</div>
              <h4>Confianza</h4>
              <p>98% de clientes satisfechos</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">⚡</div>
              <h4>Rapidez</h4>
              <p>Procesos ágiles y sin complicaciones</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2>¿Necesitas Más Información?</h2>
          <p>Nuestro equipo está listo para ayudarte</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-primary btn-lg">Contáctanos</Link>
            <Link to="/cars" className="btn btn-outline btn-lg">Ver Inventario</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Services
