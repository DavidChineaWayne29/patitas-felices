import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import AnimalPage from './pages/AnimalPage'
import AdminPage from './pages/AdminPage'
import ComoFunciona from './pages/ComoFunciona'
import Contacto from './pages/Contacto'
import Favoritos from './pages/Favoritos'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
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
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
