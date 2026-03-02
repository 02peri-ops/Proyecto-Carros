import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetail from './pages/CarDetail'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import Notifications from './components/Notifications'

// Create context for global state
export const AppContext = createContext()

export const useApp = () => useContext(AppContext)

const API_BASE_URL = '/api'

function App() {
  const [user, setUser] = useState(null)
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [comparisonList, setComparisonList] = useState([])

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchCars()
  }, [])

  const fetchCars = async (filters = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams(filters)
      const response = await axios.get(`${API_BASE_URL}/cars?${params}`)
      setCars(response.data.data || response.data)
    } catch (error) {
      addNotification('Error al cargar los vehículos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password })
      const token = response.data.token
      
      // Decode token to get user info (simplified)
      const userData = { token, username }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      addNotification('¡Bienvenido!', 'success')
      return true
    } catch (error) {
      addNotification(error.response?.data?.message || 'Error al iniciar sesión', 'error')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
    addNotification('Sesión cerrada', 'info')
  }

  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const addToComparison = (car) => {
    if (comparisonList.length >= 4) {
      addNotification('Máximo 4 vehículos para comparar', 'warning')
      return
    }
    if (comparisonList.find(c => c._id === car._id)) {
      addNotification('Vehículo ya en comparación', 'warning')
      return
    }
    setComparisonList([...comparisonList, car])
    addNotification('Vehículo agregado a comparación', 'success')
  }

  const removeFromComparison = (carId) => {
    setComparisonList(comparisonList.filter(c => c._id !== carId))
  }

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      cars,
      fetchCars,
      loading,
      addNotification,
      comparisonList,
      addToComparison,
      removeFromComparison
    }}>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <Notifications notifications={notifications} />
      </div>
    </AppContext.Provider>
  )
}

export default App
