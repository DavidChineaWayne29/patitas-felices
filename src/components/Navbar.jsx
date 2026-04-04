import { useState, useEffect } from 'react'
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
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  async function handleSignOut() {
    await signOut()
    setShowSignOutConfirm(false)
    setShowUserMenu(false)
    navigate('/')
  }

  const isActive = (path) => location.pathname === path
  const currentLang = LANGS.find(l => l.code === i18n.language?.slice(0,2)) || LANGS[0]

  function changeLang(code) {
    i18n.changeLanguage(code)
    setShowLangs(false)
  }

  const isAdmin = user?.user_metadata?.rol === 'admin'
  const userName = user?.user_metadata?.nombre || user?.user_metadata?.full_name || user?.email?.split('@')[0]

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
                    className={`${styles.langOption} ${i18n.language?.slice(0,2) === l.code ? styles.langOptionActive : ''}`}
                    onClick={() => changeLang(l.code)}>
                    <span>{l.flag}</span><span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className={styles.userWrap}>
              <button className={styles.userBtn} onClick={() => setShowUserMenu(v => !v)}>
                <div className={styles.userAvatar}>
                  {userName?.[0]?.toUpperCase()}
                </div>
                <span className={styles.userEmail}>{userName}</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style={{opacity:.5}}>
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
              {showUserMenu && (
                <div className={styles.userDropdown}>
                  <div className={styles.userDropdownHeader}>
                    <div className={styles.userDropdownName}>{userName}</div>
                    <div className={styles.userDropdownEmail}>{user.email}</div>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" className={styles.userDropdownItem}
                      onClick={() => setShowUserMenu(false)}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                      </svg>
                      {t('nav.panelAdmin')}
                    </Link>
                  )}
                  <Link to="/favoritos" className={styles.userDropdownItem}
                    onClick={() => setShowUserMenu(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {t('nav.favoritos')}
                  </Link>
                  <div className={styles.userDropdownSep}/>
                  <button className={`${styles.userDropdownItem} ${styles.userDropdownSignOut}`}
                    onClick={() => { setShowUserMenu(false); setShowSignOutConfirm(true) }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    {t('nav.salir')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.cta} onClick={() => setShowAuth(true)}>
              {t('nav.iniciarSesion')}
            </button>
          )}
        </div>

        <div className={styles.mobileRight}>
          <div className={styles.langWrapMobile}>
            <button className={styles.langBtnMobile} onClick={() => setShowLangs(v => !v)}>
              <span style={{fontSize:'16px'}}>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
            </button>
            {showLangs && (
              <div className={styles.langDropdownMobile}>
                {LANGS.map(l => (
                  <button key={l.code}
                    className={`${styles.langOption} ${i18n.language?.slice(0,2) === l.code ? styles.langOptionActive : ''}`}
                    onClick={() => changeLang(l.code)}>
                    <span>{l.flag}</span><span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {user ? (
            <button className={styles.avatarBtn} onClick={() => setShowUserMenu(v => !v)}>
              {userName?.[0]?.toUpperCase()}
            </button>
          ) : (
            <button className={styles.ctaMobile} onClick={() => setShowAuth(true)}>
              {t('nav.iniciarSesion')}
            </button>
          )}
          {showUserMenu && user && (
            <div className={styles.userDropdownMobile}>
              <div className={styles.userDropdownHeader}>
                <div className={styles.userDropdownName}>{userName}</div>
                <div className={styles.userDropdownEmail}>{user.email}</div>
              </div>
              {isAdmin && (
                <Link to="/admin" className={styles.userDropdownItem}
                  onClick={() => setShowUserMenu(false)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  {t('nav.panelAdmin')}
                </Link>
              )}
              <Link to="/favoritos" className={styles.userDropdownItem}
                onClick={() => setShowUserMenu(false)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {t('nav.favoritos')}
              </Link>
              <div className={styles.userDropdownSep}/>
              <button className={`${styles.userDropdownItem} ${styles.userDropdownSignOut}`}
                onClick={() => { setShowUserMenu(false); setShowSignOutConfirm(true) }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                {t('nav.salir')}
              </button>
            </div>
          )}
        </div>
      </nav>

      <BottomBar isActive={isActive} t={t} user={user} isAdmin={isAdmin}
        onAuth={() => setShowAuth(true)} onSignOut={() => setShowSignOutConfirm(true)} />

      {showSignOutConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowSignOutConfirm(false)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <h3>{t('nav.cerrarSesionT')}</h3>
            <p>{t('nav.cerrarSesionD')}</p>
            <div className={styles.confirmBtns}>
              <button className={styles.confirmCancel} onClick={() => setShowSignOutConfirm(false)}>
                {t('nav.cancelar')}
              </button>
              <button className={styles.confirmOk} onClick={handleSignOut}>
                {t('nav.salir')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}

function BottomBar({ isActive, t, user, isAdmin, onAuth, onSignOut }) {
  const navigate = useNavigate()

  useEffect(() => {
    const bar = document.getElementById('bottom-bar')
    if (!bar) return

    function fix() {
      const vh = window.innerHeight
      bar.style.top = (vh - bar.offsetHeight) + 'px'
    }

    fix()
    window.addEventListener('resize', fix)
    window.addEventListener('scroll', fix, { passive: true })
    return () => {
      window.removeEventListener('resize', fix)
      window.removeEventListener('scroll', fix)
    }
  }, [])

  return (
    <div id="bottom-bar" style={{
      position: 'fixed',
      left: 0,
      right: 0,
      background: '#FAFFFE',
      borderTop: '1px solid #D4EAD8',
      zIndex: 9999,
      display: 'flex',
    }}>
      <Link to="/" className={`${styles.tabItem} ${isActive('/') ? styles.tabActive : ''}`}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span>{t('nav.adoptar')}</span>
      </Link>
      <Link to="/como-funciona" className={`${styles.tabItem} ${isActive('/como-funciona') ? styles.tabActive : ''}`}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
        </svg>
        <span>{t('nav.comoFunciona')}</span>
      </Link>
      <Link to="/favoritos" className={`${styles.tabItem} ${isActive('/favoritos') ? styles.tabActive : ''}`}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>{t('nav.favoritos')}</span>
      </Link>
      <Link to="/contacto" className={`${styles.tabItem} ${isActive('/contacto') ? styles.tabActive : ''}`}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        <span>{t('nav.contacto')}</span>
      </Link>
      {user ? (
        <button className={`${styles.tabItem} ${styles.tabBtn}`}
          onClick={() => isAdmin ? navigate('/admin') : onSignOut()}>
          {isAdmin ? (
            <>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <span>{t('nav.panelAdmin')}</span>
            </>
          ) : (
            <>
              <div className={styles.tabAvatar}>
                {(user.user_metadata?.nombre || user.email)?.[0]?.toUpperCase()}
              </div>
              <span>{(user.user_metadata?.nombre || user.email?.split('@')[0])?.split(' ')[0]}</span>
            </>
          )}
        </button>
      ) : (
        <button className={`${styles.tabItem} ${styles.tabBtn}`} onClick={onAuth}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
          <span>{t('nav.iniciarSesion')}</span>
        </button>
      )}
    </div>
  )
}
