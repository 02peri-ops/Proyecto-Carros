import { Link } from 'react-router-dom'
import { useApp } from '../App'

function CarCard({ car, formatPrice: propFormatPrice, convertPrice: propConvertPrice, selectedCurrency }) {
  const { addToComparison, comparisonList } = useApp()
  
  const isInComparison = comparisonList.find(c => c._id === car._id)

  const defaultFormatPrice = (price, currency = 'MXN') => {
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

  const formatPrice = propFormatPrice || defaultFormatPrice
  const convertPrice = propConvertPrice || ((price) => price)
  
  const displayPrice = formatPrice(convertPrice(car.Precio, selectedCurrency || 'MXN'), selectedCurrency || 'MXN')

  return (
    <div className="car-card">
      <div className="car-image">
        <img 
          src={car.Imagen || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop'} 
          alt={car.Modelo}
        />
        <span className="car-badge">Nuevo</span>
      </div>
      <div className="car-content">
        <h3 className="car-title">
          <Link to={`/cars/${car._id}`}>{car.Marca} {car.Modelo}</Link>
        </h3>
        <div className="car-price">{displayPrice}</div>
        <div className="car-features">
          <div className="car-feature">
            <span>📅</span> {car.Año}
          </div>
          <div className="car-feature">
            <span>⛽</span> {car.Kilometraje?.toLocaleString() || 0} km
          </div>
          <div className="car-feature">
            <span>⚙️</span> {car.Transmision || 'Automático'}
          </div>
        </div>
        <div className="car-actions">
          <Link to={`/cars/${car._id}`} className="btn btn-primary btn-sm">Detalles</Link>
          <button 
            onClick={() => addToComparison(car)}
            className={`btn btn-secondary btn-sm ${isInComparison ? 'active' : ''}`}
          >
            {isInComparison ? '✓ Comparando' : 'Comparar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CarCard
