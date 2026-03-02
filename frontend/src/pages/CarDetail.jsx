import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../App'

function CarDetail() {
  const { id } = useParams()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedCurrency, setSelectedCurrency] = useState('MXN')
  const [exchangeRates, setExchangeRates] = useState(null)
  const { addNotification } = useApp()

  const currencies = [
    { code: 'MXN', name: 'Peso Mexicano' },
    { code: 'USD', name: 'Dolar Estadounidense' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'Libra Esterlina' },
    { code: 'JPY', name: 'Yen Japones' },
  ]

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

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get('/api/exchange/rates?base=MXN&symbols=USD,EUR,GBP,JPY')
        if (response.data.success) {
          setExchangeRates(response.data.rates)
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error)
      }
    }
    fetchExchangeRates()
  }, [])

  const formatPrice = (price, currency = 'MXN') => {
    const currencyConfig = {
      MXN: { locale: 'es-MX', currency: 'MXN' },
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
    }
    
    const config = currencyConfig[currency] || currencyConfig.MXN
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency
    }).format(price)
  }

  const convertPrice = (price, targetCurrency) => {
    if (targetCurrency === 'MXN' || !exchangeRates) return price
    return price * exchangeRates[targetCurrency]
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
            <h2>Vehiculo no encontrado</h2>
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
            
            <div className="car-detail-price-section">
              <div className="car-detail-price">{formatPrice(convertPrice(car.Precio, selectedCurrency), selectedCurrency)}</div>
              
              <div className="currency-selector">
                <label>Moneda:</label>
                <select 
                  value={selectedCurrency} 
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedCurrency !== 'MXN' && exchangeRates && (
                <div className="exchange-rate-info">
                  <small>1 MXN = {exchangeRates[selectedCurrency]} {selectedCurrency}</small>
                </div>
              )}
            </div>
            
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
                  <span className="spec-label">Transmision</span>
                  <span className="spec-value">{car.Transmision || 'Automatico'}</span>
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

            {/* === YOUR CAR SPECS START HERE === */}
            <div className="car-custom-specs">
              <h3>Especificaciones del Vehiculo</h3>
              <div className="specs-grid">
                <div className="spec-row">
                  <span className="spec-name">Motor</span>
                  <span className="spec-value">{car.Cilindraje || 4} cilindro(s) {car.Disposición || 'en línea'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Cilindrada</span>
                  <span className="spec-value">{car.Cilindraje ? (car.Cilindraje <= 4 ? '2.0L' : '3.0L') : '2.5L'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Transmision</span>
                  <span className="spec-value">{car.Transmision || 'Automático'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Traccion</span>
                  <span className="spec-value">{car.Tracción || 'Delantera'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Combustible</span>
                  <span className="spec-value">{car.Combustible || 'Gasolina'}</span>
                </div>
              </div>
            </div>
            {/* === YOUR CAR SPECS END HERE === */}

            <div className="car-description">
              <h3>Descripcion</h3>
              <p>{car.Descripcion || `Excelente ${car.Marca} ${car.Modelo} ${car.Año}, en perfecto estado. 
              Kilometraje certificado, unico dueño, todos los servicios hecho en agencia. 
              Incluye garantía y financiamiento disponible.`}</p>
            </div>

            <div className="car-features-list">
              <h3>Caracteristicas</h3>
              <ul>
                <li>Aire acondicionado</li>
                <li>Bluetooth</li>
                <li>Camara de reversa</li>
                <li>Sunroof</li>
                <li>Asientos de piel</li>
                <li>Sistema de navegación</li>
              </ul>
            </div>

            <div className="car-actions">
              <button 
                className="btn btn-success btn-lg"
                onClick={() => addNotification('¡Gracias por tu interes! Te contactaremos pronto.', 'success')}
              >
                Comprar Ahora
              </button>
              <Link to="/contact" className="btn btn-primary btn-lg">
                Solicitar Informacion
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
