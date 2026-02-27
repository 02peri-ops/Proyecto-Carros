import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApp } from '../App'
import CarCard from '../components/CarCard'

function Home() {
  const { cars, fetchCars, loading } = useApp()
  const [featuredCars, setFeaturedCars] = useState([])

  useEffect(() => {
    fetchCars({ limit: 6 })
  }, [])

  useEffect(() => {
    setFeaturedCars(cars.slice(0, 6))
  }, [cars])

  return (
    <>
      {/* Hero Section */}
      <section className="hero" id="inicio">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Encuentra el Auto de Tus Sueños</h1>
            <p className="hero-subtitle">
              Ofrecemos la mejor selección de vehículos de alta gama con financiamiento 
              flexible y servicio de primera clase. Tu próximo auto te está esperando.
            </p>
            <div className="hero-buttons">
              <Link to="/cars" className="btn btn-primary btn-lg">Ver Inventario</Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">Contáctanos</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Autos Vendidos</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Clientes Satisfechos</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">Años de Experiencia</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop" alt="Colección de autos de lujo" />
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="section section-gray" id="autos">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Autos Destacados</h2>
            <p className="section-subtitle">
              Descubre nuestra selección de vehículos premium cuidadosamente seleccionados para ti
            </p>
          </div>
          
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="cars-grid">
              {featuredCars.map(car => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}
          
          <div className="section-footer">
            <Link to="/cars" className="btn btn-primary">Ver Todos los Autos</Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" id="servicios">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nuestros Servicios</h2>
            <p className="section-subtitle">
              Ofrecemos una gama completa de servicios para satisfacer todas tus necesidades automotrices
            </p>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🚗</div>
              <h3>Venta de Autos</h3>
              <p>Amplio inventario de vehículos nuevos y usados de las mejores marcas</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💰</div>
              <h3>Financiamiento</h3>
              <p>Planes de financiamiento flexibles con tasas competitivas</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔧</div>
              <h3>Servicio Técnico</h3>
              <p>Mantenimiento y reparaciones con técnicos certificados</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3>Trámites</h3>
              <p>Te ayudamos con todos los trámites de documentación</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section section-gray" id="testimonios">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Testimonios</h2>
            <p className="section-subtitle">
              Lo que dicen nuestros clientes sobre nosotros
            </p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Excelente atención y servicio. Encontréexactlyamente el auto que buscaba."</p>
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">👤</div>
                <div className="testimonial-info">
                  <h4>Juan Pérez</h4>
                  <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"El mejor financiamiento que conseguí. Recomendado 100%."</p>
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">👤</div>
                <div className="testimonial-info">
                  <h4>María García</h4>
                  <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Servicio de postventa excepcional. Siempre atento a mis necesidades."</p>
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">👤</div>
                <div className="testimonial-info">
                  <h4>Carlos López</h4>
                  <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>¿Listo para Comprar tu Nuevo Auto?</h2>
          <p>Visítanos o contáctanos hoy mismo y encuentra el auto de tus sueños</p>
          <div className="cta-buttons">
            <Link to="/cars" className="btn btn-primary btn-lg">Ver Inventario</Link>
            <Link to="/contact" className="btn btn-outline btn-lg">Contáctanos</Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
