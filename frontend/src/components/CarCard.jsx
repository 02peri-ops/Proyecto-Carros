import { Link } from 'react-router-dom'
import { useApp } from '../App'

function CarCard({ car }) {
  const { addToComparison, comparisonList } = useApp()
  
  const isInComparison = comparisonList.find(c => c._id === car._id)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

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
        <div className="car-price">{formatPrice(car.Precio)}</div>
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
