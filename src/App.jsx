import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom'
import { useLayoutEffect } from 'react'
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
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AnimalPageWrapper() {
  const { id } = useParams()
  return <AnimalPage key={id} />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_scrollRestoration: false }}>
        <ScrollToTop />
        <div className="app-layout">
          <Navbar />
          <div className="app-scroll">
            <Routes>
              <Route path="/"              element={<Home />} />
              <Route path="/animal/:id"    element={<AnimalPageWrapper />} />
              <Route path="/admin"         element={<AdminPage />} />
              <Route path="/como-funciona" element={<ComoFunciona />} />
              <Route path="/contacto"      element={<Contacto />} />
              <Route path="/favoritos"     element={<Favoritos />} />
            </Routes>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
