import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../App'
import axios from 'axios'

function AdminDashboard() {
  const { user, addNotification } = useApp()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [formData, setFormData] = useState({
    Marca: '',
    Modelo: '',
    Año: '',
    Precio: '',
    Kilometraje: '',
    Transmision: '',
    Combustible: '',
    Descripcion: '',
    Imagen: ''
  })

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const response = await axios.get('/api/cars')
      setCars(response.data.data || response.data)
    } catch (error) {
      addNotification('Error al cargar vehículos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      }
      
      if (editingCar) {
        await axios.put(`/api/cars/${editingCar._id}`, formData, config)
        addNotification('Vehículo actualizado', 'success')
      } else {
        await axios.post('/api/cars', formData, config)
        addNotification('Vehículo agregado', 'success')
      }
      
      setShowModal(false)
      setEditingCar(null)
      setFormData({
        Marca: '',
        Modelo: '',
        Año: '',
        Precio: '',
        Kilometraje: '',
        Transmision: '',
        Combustible: '',
        Descripcion: '',
        Imagen: ''
      })
      fetchCars()
    } catch (error) {
      addNotification('Error al guardar vehículo', 'error')
    }
  }

  const handleEdit = (car) => {
    setEditingCar(car)
    setFormData({
      Marca: car.Marca || '',
      Modelo: car.Modelo || '',
      Año: car.Año || '',
      Precio: car.Precio || '',
      Kilometraje: car.Kilometraje || '',
      Transmision: car.Transmision || '',
      Combustible: car.Combustible || '',
      Descripcion: car.Descripcion || '',
      Imagen: car.Imagen || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este vehículo?')) return
    
    try {
      await axios.delete(`/api/cars/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      addNotification('Vehículo eliminado', 'success')
      fetchCars()
    } catch (error) {
      addNotification('Error al eliminar vehículo', 'error')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Panel de Administración</h1>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingCar(null)
              setFormData({
                Marca: '',
                Modelo: '',
                Año: '',
                Precio: '',
                Kilometraje: '',
                Transmision: '',
                Combustible: '',
                Descripcion: '',
                Imagen: ''
              })
              setShowModal(true)
            }}
          >
            + Agregar Vehículo
          </button>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Vehículo</th>
                  <th>Año</th>
                  <th>Precio</th>
                  <th>Kilometraje</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car._id}>
                    <td>
                      <img 
                        src={car.Imagen || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100'} 
                        alt={car.Modelo}
                        className="car-thumbnail"
                      />
                    </td>
                    <td>{car.Marca} {car.Modelo}</td>
                    <td>{car.Año}</td>
                    <td>{formatPrice(car.Precio)}</td>
                    <td>{car.Kilometraje?.toLocaleString() || 0} km</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(car)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(car._id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingCar ? 'Editar Vehículo' : 'Agregar Vehículo'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Marca</label>
                    <input type="text" name="Marca" value={formData.Marca} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input type="text" name="Modelo" value={formData.Modelo} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Año</label>
                    <input type="number" name="Año" value={formData.Año} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Precio</label>
                    <input type="number" name="Precio" value={formData.Precio} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Kilometraje</label>
                    <input type="number" name="Kilometraje" value={formData.Kilometraje} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Transmisión</label>
                    <select name="Transmision" value={formData.Transmision} onChange={handleChange}>
                      <option value="">Seleccionar</option>
                      <option value="Automático">Automático</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Combustible</label>
                  <select name="Combustible" value={formData.Combustible} onChange={handleChange}>
                    <option value="">Seleccionar</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diésel">Diésel</option>
                    <option value="Eléctrico">Eléctrico</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>URL de Imagen</label>
                  <input type="url" name="Imagen" value={formData.Imagen} onChange={handleChange} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="Descripcion" value={formData.Descripcion} onChange={handleChange} rows="3"></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
