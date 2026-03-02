import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../App'

function Login() {
  const navigate = useNavigate()
  const { login, user, addNotification } = useApp()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/admin" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const success = await login(formData.username, formData.password)
    
    if (success) {
      navigate('/admin')
    }
    
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-icon">🚗</div>
            <h1>Veloza Motors</h1>
            <p>Ingresa a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Tu usuario"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-footer">
            <p>¿Necesitas ayuda? <a href="#">Contacta al administrador</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
