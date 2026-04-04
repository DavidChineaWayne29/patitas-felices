import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import AnimalPage from './pages/AnimalPage'
import AdminPage from './pages/AdminPage'
import ComoFunciona from './pages/ComoFunciona'
import Contacto from './pages/Contacto'
import Favoritos from './pages/Favoritos'
import TestPage from './pages/TestPage'

function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return null
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_scrollRestoration: false }}>
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
            <Route path="/animal/a143a468-51ce-43b3-bf6c-24af30a361e6" element={<TestPage />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
