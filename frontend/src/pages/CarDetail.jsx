import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

function CarDetail() {
  const { id } = useParams()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await axios.get(`/api/cars/${id}`)
        setCar(response.data)
      } catch (error) {
        console.error('Error fetching car:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCar()
  }, [id])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="car-detail-page">
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="car-detail-page">
        <div className="container">
          <div className="not-found">
            <h2>Vehículo no encontrado</h2>
            <Link to="/cars" className="btn btn-primary">Volver al inventario</Link>
          </div>
        </div>
      </div>
    )
  }

  const images = car.Imagenes || [
    car.Imagen || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'
  ]

  return (
    <div className="car-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to="/cars">Autos</Link>
          <span>/</span>
          <span>{car.Marca} {car.Modelo}</span>
        </nav>

        <div className="car-detail-grid">
          {/* Images */}
          <div className="car-detail-images">
            <div className="main-image">
              <img src={images[activeImage]} alt={car.Modelo} />
              <span className="car-badge">Nuevo</span>
            </div>
            <div className="thumbnail-grid">
              {images.map((img, index) => (
                <button 
                  key={index}
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={img} alt={`${car.Modelo} ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="car-detail-info">
            <h1>{car.Marca} {car.Modelo}</h1>
            <div className="car-detail-price">{formatPrice(car.Precio)}</div>
            
            <div className="car-specs-grid">
              <div className="spec-item">
                <span className="spec-icon">📅</span>
                <div className="spec-content">
                  <span className="spec-label">Año</span>
                  <span className="spec-value">{car.Año}</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon">⛽</span>
                <div className="spec-content">
                  <span className="spec-label">Kilometraje</span>
                  <span className="spec-value">{car.Kilometraje?.toLocaleString() || 0} km</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon">⚙️</span>
                <div className="spec-content">
                  <span className="spec-label">Transmisión</span>
                  <span className="spec-value">{car.Transmision || 'Automático'}</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon">⛽</span>
                <div className="spec-content">
                  <span className="spec-label">Combustible</span>
                  <span className="spec-value">{car.Combustible || 'Gasolina'}</span>
                </div>
              </div>
            </div>

            <div className="car-description">
              <h3>Descripción</h3>
              <p>{car.Descripcion || `Excelente ${car.Marca} ${car.Modelo} ${car.Año}, en perfecto estado. 
              Kilometraje certificado, único dueño, todos los servicios hecho en agencia. 
              Incluye garantía y financiamiento disponible.`}</p>
            </div>

            <div className="car-features-list">
              <h3>Características</h3>
              <ul>
                <li>✅ Aire acondicionado</li>
                <li>✅ Bluetooth</li>
                <li>✅ Cámara de reversa</li>
                <li>✅ Sunroof</li>
                <li>✅ Asientos de piel</li>
                <li>✅ Sistema de navegación</li>
              </ul>
            </div>

            <div className="car-actions">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Solicitar Información
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                Agendar Prueba de Manejo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarDetail
