import { useState, useEffect } from 'react'
import { getAnimales } from '../lib/supabase'
import AnimalCard from '../components/AnimalCard'
import AuthModal from '../components/AuthModal'
import styles from './Home.module.css'

const ESPECIES = ['Todos', 'Perro', 'Gato', 'Conejo', 'Ave', 'Otro']
const TAMANOS  = ['Todos', 'Pequeño', 'Mediano', 'Grande']
const ESTADOS  = ['Todos', 'Disponible', 'Reservado']

export default function Home() {
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)
  const [especie, setEspecie] = useState('Todos')
  const [tamano, setTamano]   = useState('Todos')
  const [estado, setEstado]   = useState('Todos')
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    const filtros = {}
    if (especie !== 'Todos') filtros.especie = especie.toLowerCase()
    if (tamano  !== 'Todos') filtros.tamano  = tamano.toLowerCase()
    if (estado  !== 'Todos') filtros.estado  = estado.toLowerCase()
    setLoading(true)
    getAnimales(filtros).then(({ data }) => {
      setAnimales(data || [])
      setLoading(false)
    })
  }, [especie, tamano, estado])

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.eyebrow}>Refugio de animales</div>
            <h1>Cada animal merece un hogar <em>para siempre</em></h1>
            <p>Conoce a los animales que esperan tu visita. Adoptar cambia dos vidas — la suya y la tuya.</p>
            <div className={styles.heroActions}>
              <button className={styles.btnPrimary} onClick={() => document.getElementById('galeria').scrollIntoView({behavior:'smooth'})}>
                Ver animales
              </button>
              <button className={styles.btnOutline}>Cómo adoptar</button>
            </div>
            <div className={styles.stats}>
              <div><div className={styles.statN}>{animales.length || '—'}</div><div className={styles.statL}>En adopción</div></div>
              <div><div className={styles.statN}>312</div><div className={styles.statL}>Adoptados</div></div>
              <div><div className={styles.statN}>8 años</div><div className={styles.statL}>Salvando vidas</div></div>
            </div>
          </div>
          <div className={styles.heroImg} aria-hidden>
            <svg viewBox="0 0 100 100" width="120" height="120" opacity=".45">
              <circle cx="50" cy="60" r="30" fill="#4A9B6F"/>
              <ellipse cx="32" cy="36" rx="13" ry="20" fill="#4A9B6F" transform="rotate(-18 32 36)"/>
              <ellipse cx="68" cy="36" rx="13" ry="20" fill="#4A9B6F" transform="rotate(18 68 36)"/>
              <circle cx="42" cy="61" r="6" fill="#1B4332"/><circle cx="58" cy="61" r="6" fill="#1B4332"/>
              <path d="M41 73 Q50 80 59 73" stroke="#1B4332" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <div className={styles.filtersBar}>
        <div className={styles.filtersInner}>
          <span className={styles.filterLabel}>Especie</span>
          {ESPECIES.map(e => (
            <button key={e} className={`${styles.chip} ${especie===e ? styles.chipOn : ''}`}
              onClick={() => setEspecie(e)}>{e}</button>
          ))}
          <div className={styles.sep}/>
          <span className={styles.filterLabel}>Tamaño</span>
          {TAMANOS.map(t => (
            <button key={t} className={`${styles.chip} ${tamano===t ? styles.chipOn : ''}`}
              onClick={() => setTamano(t)}>{t}</button>
          ))}
          <div className={styles.sep}/>
          {ESTADOS.slice(1).map(s => (
            <button key={s} className={`${styles.chip} ${estado===s ? styles.chipOn : ''}`}
              onClick={() => setEstado(prev => prev === s ? 'Todos' : s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Galería */}
      <main className={styles.main} id="galeria">
        <div className={styles.secHead}>
          <h2>Buscando un hogar</h2>
          <span className={styles.count}>{animales.length} animales</span>
        </div>

        {loading ? (
          <div className={styles.loading}>Cargando animales...</div>
        ) : animales.length === 0 ? (
          <div className={styles.empty}>No hay animales con esos filtros.</div>
        ) : (
          <div className={styles.grid}>
            {animales.map(a => (
              <AnimalCard key={a.id} animal={a} onNeedAuth={() => setShowAuth(true)} />
            ))}
          </div>
        )}
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
