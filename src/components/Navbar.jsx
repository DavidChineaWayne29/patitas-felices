import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../lib/supabase'
import AuthModal from './AuthModal'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>
          <div className={styles.brandMark}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M4.5 11.5c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm9 0c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm-4 5.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-2-9c0-.8.7-1.5 1.5-1.5S10.5 7.2 10.5 8s-.7 1.5-1.5 1.5S7.5 8.8 7.5 8zm7 0c0-.8.7-1.5 1.5-1.5S17.5 7.2 17.5 8s-.7 1.5-1.5 1.5S14.5 8.8 14.5 8z"/>
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>Patitas Felices</div>
            <div className={styles.brandTag}>Refugio de animales</div>
          </div>
        </Link>

        <div className={styles.links}>
          <Link to="/" className={styles.link}>Adoptar</Link>
          <Link to="/como-funciona" className={styles.link}>Cómo funciona</Link>
          <Link to="/contacto" className={styles.link}>Contacto</Link>
          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.userEmail}>
                {user.user_metadata?.nombre || user.email}
              </span>
              {user.user_metadata?.rol === 'admin' && (
                <Link to="/admin" className={styles.adminBtn}>Panel admin</Link>
              )}
              <button className={styles.outBtn} onClick={handleSignOut}>Salir</button>
            </div>
          ) : (
            <button className={styles.cta} onClick={() => setShowAuth(true)}>
              Iniciar sesión
            </button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
