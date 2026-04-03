import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../lib/supabase'
import { useTranslation } from 'react-i18next'
import AuthModal from './AuthModal'
import styles from './Navbar.module.css'

const LANGS = [
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
]

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [showAuth, setShowAuth] = useState(false)
  const [showLangs, setShowLangs] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path
  const currentLang = LANGS.find(l => l.code === i18n.language) || LANGS[0]

  function changeLang(code) {
    i18n.changeLanguage(code)
    setShowLangs(false)
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
          <Link to="/" className={`${styles.link} ${isActive('/') ? styles.linkActive : ''}`}>{t('nav.adoptar')}</Link>
          <Link to="/como-funciona" className={`${styles.link} ${isActive('/como-funciona') ? styles.linkActive : ''}`}>{t('nav.comoFunciona')}</Link>
          <Link to="/contacto" className={`${styles.link} ${isActive('/contacto') ? styles.linkActive : ''}`}>{t('nav.contacto')}</Link>

          <Link to="/favoritos" className={`${styles.heartBtn} ${isActive('/favoritos') ? styles.heartActive : ''}`} title={t('nav.favoritos')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </Link>

          {/* Selector de idioma */}
          <div className={styles.langWrap}>
            <button className={styles.langBtn} onClick={() => setShowLangs(v => !v)}>
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style={{opacity:.5}}>
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            {showLangs && (
              <div className={styles.langDropdown}>
                {LANGS.map(l => (
                  <button key={l.code}
                    className={`${styles.langOption} ${i18n.language === l.code ? styles.langOptionActive : ''}`}
                    onClick={() => changeLang(l.code)}>
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.userEmail}>
                {user.user_metadata?.nombre || user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              {user.user_metadata?.rol === 'admin' && (
                <Link to="/admin" className={styles.adminBtn}>{t('nav.panelAdmin')}</Link>
              )}
              <button className={styles.outBtn} onClick={handleSignOut}>{t('nav.salir')}</button>
            </div>
          ) : (
            <button className={styles.cta} onClick={() => setShowAuth(true)}>
              {t('nav.iniciarSesion')}
            </button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
