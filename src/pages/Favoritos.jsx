import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import AnimalCard from '../components/AnimalCard'
import AuthModal from '../components/AuthModal'
import styles from './Favoritos.module.css'

export default function Favoritos() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    if (user) loadFavoritos()
    else setLoading(false)
  }, [user])

  async function loadFavoritos() {
    setLoading(true)
    const { data } = await supabase
      .from('likes')
      .select('animal:animal_id(*)')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
    setAnimales((data || []).map(d => d.animal).filter(Boolean))
    setLoading(false)
  }

  if (!user) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>🤍</div>
      <h2>{t('favoritos.loginTitulo')}</h2>
      <p>{t('favoritos.loginSub')}</p>
      <button className={styles.btnPrimary} onClick={() => setShowAuth(true)}>
        {t('favoritos.iniciarSesion')}
      </button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )

  if (loading) return <div className={styles.loading}>{t('favoritos.cargando')}</div>

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1>{t('favoritos.titulo')}</h1>
        <p>
          {animales.length === 0
            ? t('favoritos.vacio')
            : `${animales.length} ${animales.length === 1 ? t('favoritos.guardado') : t('favoritos.guardados')}`}
        </p>
      </div>

      {animales.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🤍</div>
          <h2>{t('favoritos.sinFavoritos')}</h2>
          <p>{t('favoritos.sinFavoritosSub')}</p>
          <Link to="/" className={styles.btnPrimary}>{t('favoritos.verAnimales')}</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {animales.map(a => (
            <AnimalCard key={a.id} animal={a} onNeedAuth={() => setShowAuth(true)} />
          ))}
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
