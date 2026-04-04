import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { getLike, toggleLike, getAnimalFotoUrl } from '../lib/supabase'
import styles from './AnimalCard.module.css'

const ESPECIES_COLOR = {
  perro: styles.bgPerro,
  gato: styles.bgGato,
  conejo: styles.bgConejo,
  ave: styles.bgAve,
  otro: styles.bgOtro,
}

export default function AnimalCard({ animal, onNeedAuth }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [fotoUrl, setFotoUrl] = useState(null)

  useEffect(() => {
    if (user) getLike(animal.id, user.id).then(setLiked)
    if (animal.foto_principal) getAnimalFotoUrl(animal.foto_principal).then(setFotoUrl)
  }, [animal.id, user])

  async function handleLike(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { onNeedAuth?.(); return }
    const result = await toggleLike(animal.id, user.id)
    setLiked(result)
  }

  function goToAnimal(e) {
    e.preventDefault()
    e.stopPropagation()
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    setTimeout(() => navigate(`/animal/${animal.id}`), 10)
  }

  const bgClass = ESPECIES_COLOR[animal.especie?.toLowerCase()] || styles.bgOtro
  const disponible = animal.estado === 'disponible'

  return (
    <div className={styles.card} onClick={goToAnimal} style={{cursor:'pointer'}}>
      <div className={`${styles.photo} ${bgClass}`}>
        <span className={`${styles.badge} ${disponible ? styles.badgeOk : styles.badgeRes}`}>
          {animal.estado === 'disponible' ? t('animal.disponible') : animal.estado === 'reservado' ? t('animal.reservado') : t('animal.adoptado')}
        </span>

        <button className={`${styles.likeBtn} ${liked ? styles.liked : ''}`} onClick={handleLike}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        {fotoUrl ? (
          <img src={fotoUrl} alt={animal.nombre} className={styles.foto} />
        ) : (
          <AnimalSvg especie={animal.especie} />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.name}>{animal.nombre}</div>
        <div className={styles.meta}>
          {animal.especie} · {animal.raza || t('animal.mestizo')} · {formatEdad(animal.edad_meses, t)} · {animal.tamano}
        </div>
        <div className={styles.tags}>
          {animal.vacunado && <span className={styles.tag}>{t('animal.vacunado')}</span>}
          {animal.castrado && <span className={styles.tag}>{t('animal.castrado')}</span>}
          {animal.caracter?.split(',').slice(0, 2).map(c => (
            <span key={c} className={styles.tag}>{c.trim()}</span>
          ))}
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btnAdopt} ${!disponible ? styles.btnDis : ''}`}
            onClick={goToAnimal}>
            {disponible
              ? (animal.sexo === 'hembra' ? t('animal.quieroAdoptarla') : t('animal.quieroAdoptar'))
              : t('animal.listaEspera')}
          </button>
          <button className={styles.btnVisit} onClick={goToAnimal}>
            {t('animal.visita')}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatEdad(meses, t) {
  if (!meses) return ''
  if (meses < 12) return `${meses} ${t('animal.meses')}`
  const a = Math.floor(meses / 12)
  return `${a} ${a === 1 ? t('animal.anyo') : t('animal.anyos')}`
}

function AnimalSvg({ especie }) {
  const e = especie?.toLowerCase()
  if (e === 'perro') return (
    <svg viewBox="0 0 100 100" width="90" height="90">
      <circle cx="50" cy="60" r="28" fill="#4A9B6F" opacity=".4"/>
      <ellipse cx="32" cy="34" rx="12" ry="18" fill="#4A9B6F" opacity=".55" transform="rotate(-15 32 34)"/>
      <ellipse cx="68" cy="34" rx="12" ry="18" fill="#4A9B6F" opacity=".55" transform="rotate(15 68 34)"/>
      <circle cx="43" cy="61" r="5" fill="#1B4332"/><circle cx="57" cy="61" r="5" fill="#1B4332"/>
      <path d="M42 72 Q50 78 58 72" stroke="#1B4332" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
  if (e === 'gato') return (
    <svg viewBox="0 0 100 100" width="80" height="80">
      <circle cx="50" cy="55" r="22" fill="#4A9B6F" opacity=".35"/>
      <polygon points="32,36 24,18 42,30" fill="#4A9B6F" opacity=".55"/>
      <polygon points="68,36 76,18 58,30" fill="#4A9B6F" opacity=".55"/>
      <circle cx="43" cy="56" r="4" fill="#1B4332"/><circle cx="57" cy="56" r="4" fill="#1B4332"/>
      <path d="M38 65 Q50 72 62 65" stroke="#1B4332" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )
  if (e === 'conejo') return (
    <svg viewBox="0 0 100 100" width="80" height="80">
      <circle cx="50" cy="64" r="20" fill="#4A9B6F" opacity=".35"/>
      <ellipse cx="36" cy="30" rx="9" ry="22" fill="#4A9B6F" opacity=".5"/>
      <ellipse cx="64" cy="30" rx="9" ry="22" fill="#4A9B6F" opacity=".5"/>
      <circle cx="44" cy="64" r="4" fill="#1B4332"/><circle cx="56" cy="64" r="4" fill="#1B4332"/>
      <ellipse cx="50" cy="73" rx="7" ry="4" fill="#1B4332" opacity=".6"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 100 100" width="72" height="72">
      <ellipse cx="50" cy="60" rx="16" ry="20" fill="#4A9B6F" opacity=".4"/>
      <circle cx="50" cy="38" r="14" fill="#2D6A4F" opacity=".45"/>
      <circle cx="45" cy="36" r="3" fill="#1B4332"/>
      <path d="M47 43 L56 40 L52 46 Z" fill="#1B4332"/>
    </svg>
  )
}
