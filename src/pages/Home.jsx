import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getAnimales } from '../lib/supabase'
import AnimalCard from '../components/AnimalCard'
import AuthModal from '../components/AuthModal'
import styles from './Home.module.css'

const ESPECIES = ['filtros.todos', 'filtros.perro', 'filtros.gato', 'filtros.conejo', 'filtros.ave', 'filtros.otro']
const ESPECIES_VAL = ['Todos', 'Perro', 'Gato', 'Conejo', 'Ave', 'Otro']
const TAMANOS = ['filtros.todos', 'filtros.pequeno', 'filtros.mediano', 'filtros.grande']
const TAMANOS_VAL = ['Todos', 'Pequeño', 'Mediano', 'Grande']

export default function Home() {
  const { t } = useTranslation()
  const [animales, setAnimales] = useState([])
  const [loading, setLoading] = useState(true)
  const [especie, setEspecie] = useState(0)
  const [tamano, setTamano] = useState(0)
  const [estado, setEstado] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    const filtros = {}
    if (especie > 0) filtros.especie = ESPECIES_VAL[especie].toLowerCase()
    if (tamano > 0) filtros.tamano = TAMANOS_VAL[tamano].toLowerCase()
    if (estado) filtros.estado = 'disponible'
    setLoading(true)
    getAnimales(filtros).then(({ data }) => {
      setAnimales(data || [])
      setLoading(false)
    })
  }, [especie, tamano, estado])

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.eyebrow}>{t('home.eyebrow')}</div>
            <h1>{t('home.titulo')} <em>{t('home.tituloEm')}</em></h1>
            <p>{t('home.desc')}</p>
            <div className={styles.heroActions}>
              <button className={styles.btnPrimary} onClick={() => document.getElementById('galeria').scrollIntoView({behavior:'smooth'})}>
                {t('home.verAnimales')}
              </button>
              <button className={styles.btnOutline}>{t('home.comoAdoptar')}</button>
            </div>
            <div className={styles.stats}>
              <div><div className={styles.statN}>{animales.length || '—'}</div><div className={styles.statL}>{t('home.enAdopcion')}</div></div>
              <div><div className={styles.statN}>312</div><div className={styles.statL}>{t('home.adoptados')}</div></div>
              <div><div className={styles.statN}>8</div><div className={styles.statL}>{t('home.anyos')}</div></div>
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

      <div className={styles.filtersBar}>
        <div className={styles.filtersInner}>
          <span className={styles.filterLabel}>{t('filtros.especie')}</span>
          {ESPECIES.map((e, i) => (
            <button key={e} className={`${styles.chip} ${especie===i ? styles.chipOn : ''}`}
              onClick={() => setEspecie(i)}>{t(e)}</button>
          ))}
          <div className={styles.sep}/>
          <span className={styles.filterLabel}>{t('filtros.tamano')}</span>
          {TAMANOS.map((t2, i) => (
            <button key={t2} className={`${styles.chip} ${tamano===i ? styles.chipOn : ''}`}
              onClick={() => setTamano(i)}>{t(t2)}</button>
          ))}
          <div className={styles.sep}/>
          <button className={`${styles.chip} ${estado ? styles.chipOn : ''}`}
            onClick={() => setEstado(v => !v)}>{t('filtros.disponible')}</button>
        </div>
      </div>

      <main className={styles.main} id="galeria">
        <div className={styles.secHead}>
          <h2>{t('home.buscandoHogar')}</h2>
          <span className={styles.count}>{animales.length} {t('home.animales')}</span>
        </div>

        {loading ? (
          <div className={styles.loading}>{t('home.cargando')}</div>
        ) : animales.length === 0 ? (
          <div className={styles.empty}>{t('home.noAnimales')}</div>
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
