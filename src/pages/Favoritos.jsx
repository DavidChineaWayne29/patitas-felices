import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import AnimalCard from '../components/AnimalCard'
import AuthModal from '../components/AuthModal'
import styles from './Favoritos.module.css'

export default function Favoritos() {
  const { user } = useAuth()
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
      <h2>Tus favoritos</h2>
      <p>Inicia sesión para ver los animales que has guardado.</p>
      <button className={styles.btnPrimary} onClick={() => setShowAuth(true)}>
        Iniciar sesión
      </button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )

  if (loading) return <div className={styles.loading}>Cargando favoritos...</div>

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1>Tus favoritos</h1>
        <p>{animales.length === 0 ? 'Aún no has guardado ningún animal.' : `${animales.length} animal${animales.length !== 1 ? 'es' : ''} guardado${animales.length !== 1 ? 's' : ''}`}</p>
      </div>

      {animales.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🤍</div>
          <h2>Sin favoritos todavía</h2>
          <p>Cuando veas un animal que te guste, pulsa el corazón en su tarjeta para guardarlo aquí.</p>
          <Link to="/" className={styles.btnPrimary}>Ver animales disponibles</Link>
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
