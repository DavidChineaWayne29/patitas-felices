import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { signIn, signUp, signInWithGoogle } from '../lib/supabase'
import styles from './AuthModal.module.css'

export default function AuthModal({ onClose }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (tab === 'login') {
      const { error } = await signIn({ email: form.email, password: form.password })
      if (error) setError(t('auth.errorCredenciales'))
      else onClose()
    } else {
      if (!form.nombre.trim()) { setError(t('auth.errorNombre')); setLoading(false); return }
      const { error } = await signUp({ email: form.email, password: form.password, nombre: form.nombre, telefono: form.telefono })
      if (error) setError(error.message)
      else setOk(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await signInWithGoogle()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>✕</button>

        {ok ? (
          <div className={styles.okWrap}>
            <div className={styles.okIcon}>✓</div>
            <h2>{t('auth.okTitulo')}</h2>
            <p>{t('auth.okSub')}</p>
            <button className={styles.btnPrimary} onClick={onClose}>{t('auth.cerrar')}</button>
          </div>
        ) : (
          <>
            <h2 className={styles.title}>
              {tab === 'login' ? t('auth.iniciarSesion') : t('auth.crearCuenta')}
            </h2>
            <p className={styles.subtitle}>
              {tab === 'login' ? t('auth.subtitleLogin') : t('auth.subtitleRegister')}
            </p>

            <button className={styles.googleBtn} onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth.continuarGoogle')}
            </button>

            <div className={styles.divider}><span>o</span></div>

            <form onSubmit={handleSubmit}>
              {tab === 'register' && (
                <div className={styles.field}>
                  <label>{t('auth.nombre')}</label>
                  <input type="text" placeholder={t('auth.nombre')} value={form.nombre}
                    onChange={e => set('nombre', e.target.value)} required />
                </div>
              )}
              <div className={styles.field}>
                <label>{t('auth.email')}</label>
                <input type="email" placeholder="tu@email.com" value={form.email}
                  onChange={e => set('email', e.target.value)} required />
              </div>
              {tab === 'register' && (
                <div className={styles.field}>
                  <label>
                    {t('auth.whatsapp')}
                    <span style={{ color: '#6B8F7A', fontSize: '11px', marginLeft: '6px' }}>
                      ({t('cita.opcional')})
                    </span>
                  </label>
                  <input type="tel" placeholder="+34 600 000 000" value={form.telefono}
                    onChange={e => set('telefono', e.target.value)} />
                </div>
              )}
              <div className={styles.field}>
                <label>{t('auth.password')}</label>
                <input type="password" placeholder={t('auth.passwordPlaceholder')} value={form.password}
                  onChange={e => set('password', e.target.value)} required minLength={6} />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button className={styles.btnPrimary} type="submit" disabled={loading}>
                {loading ? '...' : tab === 'login' ? t('auth.entrar') : t('auth.crearCuenta')}
              </button>
            </form>

            <p className={styles.switch}>
              {tab === 'login' ? t('auth.sinCuenta') : t('auth.conCuenta')}{' '}
              <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }}>
                {tab === 'login' ? t('auth.registrate') : t('auth.inicia')}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
