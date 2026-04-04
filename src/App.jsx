import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import AnimalPage from './pages/AnimalPage'
import AdminPage from './pages/AdminPage'
import ComoFunciona from './pages/ComoFunciona'
import Contacto from './pages/Contacto'
import Favoritos from './pages/Favoritos'

function ScrollToTop({ contentRef }) {
  const { pathname } = useLocation()
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])
  return null
}

export default function App() {
  const contentRef = useRef(null)

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop contentRef={contentRef} />
        <Navbar />
        <div className="main-content" ref={contentRef}>
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
