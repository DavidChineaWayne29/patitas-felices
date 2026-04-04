import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import AnimalPage from './pages/AnimalPage'
import AdminPage from './pages/AdminPage'
import ComoFunciona from './pages/ComoFunciona'
import Contacto from './pages/Contacto'
import Favoritos from './pages/Favoritos'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/animal/:id"   element={<AnimalPage />} />
            <Route path="/admin"         element={<AdminPage />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/contacto"      element={<Contacto />} />
            <Route path="/favoritos"     element={<Favoritos />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
