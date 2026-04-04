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
            <svg viewBox="0 0 160 200" width="160" height="200">
              <ellipse cx="80" cy="175" rx="55" ry="22" fill="#C8E6D4" opacity=".5"/>
              <ellipse cx="80" cy="145" rx="40" ry="48" fill="#4A9B6F" opacity=".25"/>
              <ellipse cx="80" cy="138" rx="36" ry="42" fill="#4A9B6F" opacity=".35"/>
              <ellipse cx="52" cy="88" rx="17" ry="26" fill="#4A9B6F" opacity=".45" transform="rotate(-15 52 88)"/>
              <ellipse cx="108" cy="88" rx="17" ry="26" fill="#4A9B6F" opacity=".45" transform="rotate(15 108 88)"/>
              <circle cx="68" cy="138" r="8" fill="#1B4332"/>
              <circle cx="92" cy="138" r="8" fill="#1B4332"/>
              <ellipse cx="80" cy="153" rx="10" ry="6" fill="#1B4332" opacity=".65"/>
              <path d="M66 163 Q80 172 94 163" stroke="#1B4332" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <circle cx="68" cy="134" r="2.5" fill="white" opacity=".5"/>
              <circle cx="92" cy="134" r="2.5" fill="white" opacity=".5"/>
              <ellipse cx="32" cy="170" rx="11" ry="7" fill="#4A9B6F" opacity=".35" transform="rotate(-20 32 170)"/>
              <ellipse cx="128" cy="170" rx="11" ry="7" fill="#4A9B6F" opacity=".35" transform="rotate(20 128 170)"/>
            </svg>
          </div>
        </div>
      </section>

      <div className={styles.filtersBar}>
        <div className={styles.filtersInner}>
          <div className={styles.filterGroup}>
            {ESPECIES.map((e, i) => (
              <button key={e} className={`${styles.chip} ${especie===i ? styles.chipOn : ''}`}
                onClick={() => setEspecie(i)}>{t(e)}</button>
            ))}
          </div>
          <div className={styles.sep}/>
          <div className={styles.filterGroup}>
            {TAMANOS.map((t2, i) => (
              <button key={t2} className={`${styles.chip} ${tamano===i ? styles.chipOn : ''}`}
                onClick={() => setTamano(i)}>{t(t2)}</button>
            ))}
          </div>
          <div className={styles.sep}/>
          <div className={styles.filterGroup}>
            <button
              className={`${styles.chip} ${!estado ? styles.chipOn : ''}`}
              onClick={() => setEstado(false)}>
              {t('filtros.todos')}
            </button>
            <button
              className={`${styles.chip} ${estado ? styles.chipOn : ''}`}
              onClick={() => setEstado(true)}>
              {t('filtros.disponible')}
            </button>
          </div>
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
