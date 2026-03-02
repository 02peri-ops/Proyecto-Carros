import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../App'
import CarCard from '../components/CarCard'
import axios from 'axios'

function Cars() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { cars, fetchCars, loading, comparisonList, removeFromComparison } = useApp()
  const [selectedCurrency, setSelectedCurrency] = useState('MXN')
  const [exchangeRates, setExchangeRates] = useState(null)
  
  const currencies = [
    { code: 'MXN', name: 'Peso Mexicano' },
    { code: 'USD', name: 'Dolar Estadounidense' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'Libra Esterlina' },
    { code: 'JPY', name: 'Yen Japones' },
  ]
  
  const [filters, setFilters] = useState({
    marca: searchParams.get('marca') || '',
    modelo: searchParams.get('modelo') || '',
    año: searchParams.get('año') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  })

  const [showComparison, setShowComparison] = useState(searchParams.get('compare') === 'true')

  useEffect(() => {
    const params = {}
    if (filters.marca) params.marca = filters.marca
    if (filters.modelo) params.modelo = filters.modelo
    if (filters.año) params.año = filters.año
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    
    fetchCars(params)
    setSearchParams(params)
  }, [])

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    const params = {}
    if (filters.marca) params.marca = filters.marca
    if (filters.modelo) params.modelo = filters.modelo
    if (filters.año) params.año = filters.año
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    
    fetchCars(params)
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({
      marca: '',
      modelo: '',
      año: '',
      minPrice: '',
      maxPrice: ''
    })
    fetchCars()
    setSearchParams({})
  }

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

  return (
    <div className="cars-page">
      <div className="container">
        <div className="page-header">
          <h1>Nuestro Inventario</h1>
          <p>Encuentra el vehículo perfecto para ti</p>
        </div>

        <div className="cars-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filtros</h3>
              <button onClick={clearFilters} className="btn-link">Limpiar</button>
            </div>
            
            <div className="filter-group">
              <label>Marca</label>
              <select name="marca" value={filters.marca} onChange={handleFilterChange}>
                <option value="">Todas las marcas</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes">Mercedes</option>
                <option value="Audi">Audi</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Ford">Ford</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Año</label>
              <select name="año" value={filters.año} onChange={handleFilterChange}>
                <option value="">Todos los años</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Precio Mínimo</label>
              <input 
                type="number" 
                name="minPrice" 
                value={filters.minPrice} 
                onChange={handleFilterChange}
                placeholder="Min price"
              />
            </div>

            <div className="filter-group">
              <label>Precio Máximo</label>
              <input 
                type="number" 
                name="maxPrice" 
                value={filters.maxPrice} 
                onChange={handleFilterChange}
                placeholder="Max price"
              />
            </div>

            <button onClick={applyFilters} className="btn btn-primary btn-block">
              Aplicar Filtros
            </button>

            <div className="filter-group" style={{ marginTop: '20px' }}>
              <label>Moneda</label>
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
          </aside>

          {/* Cars Grid */}
          <div className="cars-main">
            {loading ? (
              <div className="loader-container">
                <div className="loader"></div>
              </div>
            ) : cars.length === 0 ? (
              <div className="no-results">
                <h3>No se encontraron vehículos</h3>
                <p>Intenta con otros filtros de búsqueda</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <>
                <div className="cars-count">
                  {cars.length} vehículo{cars.length !== 1 ? 's' : ''} encontrado{cars.length !== 1 ? 's' : ''}
                </div>
                <div className="cars-grid">
                  {cars.map(car => (
                    <CarCard 
                      key={car._id} 
                      car={car} 
                      formatPrice={formatPrice}
                      convertPrice={convertPrice}
                      selectedCurrency={selectedCurrency}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Comparison Modal */}
        {showComparison && comparisonList.length > 0 && (
          <div className="comparison-modal">
            <div className="comparison-header">
              <h3>Comparar Vehículos ({comparisonList.length}/4)</h3>
              <button onClick={() => setShowComparison(false)} className="btn-close">×</button>
            </div>
            <div className="comparison-grid">
              {comparisonList.map(car => (
                <div key={car._id} className="comparison-item">
                  <button 
                    className="comparison-remove" 
                    onClick={() => removeFromComparison(car._id)}
                  >
                    ×
                  </button>
                  <img 
                    src={car.Imagen || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200'} 
                    alt={car.Modelo} 
                  />
                  <h4>{car.Marca} {car.Modelo}</h4>
                  <div className="comparison-price">{formatPrice(car.Precio)}</div>
                  <div className="comparison-specs">
                    <span>{car.Año}</span>
                    <span>{car.Kilometraje?.toLocaleString() || 0} km</span>
                    <span>{car.Transmision || 'Automático'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cars
