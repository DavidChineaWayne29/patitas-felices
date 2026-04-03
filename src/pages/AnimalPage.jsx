import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAnimal, getAnimalFotoUrl, crearSolicitudAdopcion } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import CitaCalendar from '../components/CitaCalendar'
import ChatBox from '../components/ChatBox'
import AuthModal from '../components/AuthModal'
import styles from './AnimalPage.module.css'

export default function AnimalPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [animal, setAnimal] = useState(null)
  const [fotoUrl, setFotoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [panel, setPanel] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [adoptForm, setAdoptForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [adoptOk, setAdoptOk] = useState(false)
  const [adoptLoading, setAdoptLoading] = useState(false)

  useEffect(() => {
    getAnimal(id).then(({ data }) => {
      if (!data) { navigate('/'); return }
      setAnimal(data)
      setLoading(false)
      if (data.foto_principal) getAnimalFotoUrl(data.foto_principal).then(setFotoUrl)
    })
  }, [id])

  useEffect(() => {
    if (user) {
      setAdoptForm(f => ({
        ...f,
        nombre: user.user_metadata?.nombre || f.nombre,
        email: user.email || f.email,
        telefono: user.user_metadata?.telefono || f.telefono,
      }))
    }
  }, [user])

  function openPanel(p) {
    if (!user) { setShowAuth(true); return }
    setPanel(prev => prev === p ? null : p)
    setAdoptOk(false)
  }

  async function handleAdopt(e) {
    e.preventDefault()
    setAdoptLoading(true)
    await crearSolicitudAdopcion({ animalId: animal.id, usuarioId: user?.id, ...adoptForm })
    setAdoptLoading(false)
    setAdoptOk(true)
  }

  function formatEdad(meses) {
    if (!meses) return ''
    if (meses < 12) return `${meses} meses`
    const a = Math.floor(meses / 12)
    return `${a} ${a === 1 ? 'año' : 'años'}`
  }

  if (loading) return <div className={styles.loading}>{t('home.cargando')}</div>
  if (!animal) return null

  const disponible = animal.estado === 'disponible'
  const esHembra = animal.sexo === 'hembra'

  return (
    <>
      <div className={styles.wrap}>
        <div className={styles.breadcrumb}>
          <button onClick={() => navigate('/')}>{t('animal.volverGaleria')}</button>
        </div>

        <div className={styles.ficha}>
          <div className={styles.fichaPhoto}>
            {fotoUrl
              ? <img src={fotoUrl} alt={animal.nombre} className={styles.foto}/>
              : <AnimalSvg especie={animal.especie} />}
          </div>

          <div className={styles.fichaInfo}>
            <div className={styles.fichaTop}>
              <span className={`${styles.estadoBadge} ${disponible ? styles.ok : styles.res}`}>
                {animal.estado === 'disponible' ? t('animal.disponible') : animal.estado === 'reservado' ? t('animal.reservado') : t('animal.adoptado')}
              </span>
            </div>

            <h1 className={styles.nombre}>{animal.nombre}</h1>
            <p className={styles.sub}>
              {[animal.especie, animal.raza || 'Mestizo/a', formatEdad(animal.edad_meses), animal.tamano, animal.sexo]
                .filter(Boolean).join(' · ')}
            </p>

            <p className={styles.desc}>{animal.descripcion}</p>

            <div className={styles.pills}>
              {animal.vacunado      && <span className={styles.pill}>{t('animal.vacunado')}</span>}
              {animal.castrado      && <span className={styles.pill}>{t('animal.castrado')}</span>}
              {animal.desparasitado && <span className={styles.pill}>{t('animal.desparasitado')}</span>}
              {animal.apto_ninos    && <span className={styles.pill}>{t('animal.aptoNinos')}</span>}
              {animal.apto_perros   && <span className={styles.pill}>{t('animal.aptoPerros')}</span>}
              {animal.apto_gatos    && <span className={styles.pill}>{t('animal.aptoGatos')}</span>}
              {animal.caracter?.split(',').map(c => (
                <span key={c} className={styles.pill}>{c.trim()}</span>
              ))}
            </div>

            <div className={styles.acciones}>
              <button
                className={`${styles.btnP} ${!disponible ? styles.btnDis : ''}`}
                onClick={() => openPanel('adopcion')}
                disabled={!disponible}>
                {disponible ? (esHembra ? t('animal.quieroAdoptarla') : t('animal.quieroAdoptar')) : t('animal.listaEspera')}
              </button>
              <button className={`${styles.btnS} ${panel === 'cita' ? styles.btnSActive : ''}`}
                onClick={() => openPanel('cita')}>
                {t('animal.concertarVisita')}
              </button>
            </div>
          </div>
        </div>

        {panel === 'adopcion' && (
          <div className={styles.panelBox}>
            <div className={styles.panelHead}>
              <h2>{t('adopcion.titulo')} — {animal.nombre}</h2>
              <button className={styles.panelClose} onClick={() => setPanel(null)}>✕</button>
            </div>
            {adoptOk ? (
              <div className={styles.adoptOk}>
                <div className={styles.okIcon}>✓</div>
                <h3>{t('adopcion.okTitulo')}</h3>
                <p>{t('adopcion.okSub')} {animal.nombre}.</p>
              </div>
            ) : (
              <form onSubmit={handleAdopt} className={styles.adoptForm}>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>{t('adopcion.nombre')}</label>
                    <input value={adoptForm.nombre} onChange={e => setAdoptForm(f=>({...f,nombre:e.target.value}))} required placeholder={t('adopcion.nombre')}/>
                  </div>
                  <div className={styles.field}>
                    <label>{t('adopcion.apellidos')}</label>
                    <input value={adoptForm.apellidos||''} onChange={e => setAdoptForm(f=>({...f,apellidos:e.target.value}))} placeholder={t('adopcion.apellidos')}/>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>{t('adopcion.email')}</label>
                    <input type="email" value={adoptForm.email} onChange={e => setAdoptForm(f=>({...f,email:e.target.value}))} required placeholder="tu@email.com"/>
                  </div>
                  <div className={styles.field}>
                    <label>{t('adopcion.whatsapp')}</label>
                    <input value={adoptForm.telefono} onChange={e => setAdoptForm(f=>({...f,telefono:e.target.value}))} placeholder="+34 600 000 000"/>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>{t('adopcion.mensaje')}</label>
                  <textarea value={adoptForm.mensaje} onChange={e => setAdoptForm(f=>({...f,mensaje:e.target.value}))}
                    placeholder={t('adopcion.mensajePlaceholder')}/>
                </div>
                <button type="submit" className={styles.btnSubmit} disabled={adoptLoading}>
                  {adoptLoading ? t('adopcion.enviando') : t('adopcion.enviar')}
                </button>
                <p className={styles.privacy}>{t('adopcion.privacy')}</p>
              </form>
            )}
          </div>
        )}

        {panel === 'cita' && (
          <div className={styles.panelBox}>
            <div className={styles.panelHead}>
              <h2>{t('cita.titulo')} — {animal.nombre}</h2>
              <button className={styles.panelClose} onClick={() => setPanel(null)}>✕</button>
            </div>
            <p className={styles.panelSub}>{t('cita.sub')}</p>
            <CitaCalendar animal={animal} />
          </div>
        )}

        <div className={styles.chats}>
          <ChatBox animal={animal} tipo="publico" onNeedAuth={() => setShowAuth(true)} />
          <ChatBox animal={animal} tipo="privado" onNeedAuth={() => setShowAuth(true)} />
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}

function AnimalSvg({ especie }) {
  const bgColor = especie?.toLowerCase() === 'perro' ? '#E8F5EE'
    : especie?.toLowerCase() === 'gato' ? '#EEF5E8'
    : especie?.toLowerCase() === 'conejo' ? '#E8F0F5' : '#F0EEF5'
  return (
    <div style={{ width:'100%', height:'100%', background: bgColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg viewBox="0 0 100 100" width="120" height="120">
        <circle cx="50" cy="60" r="28" fill="#4A9B6F" opacity=".4"/>
        <ellipse cx="32" cy="34" rx="12" ry="18" fill="#4A9B6F" opacity=".55" transform="rotate(-15 32 34)"/>
        <ellipse cx="68" cy="34" rx="12" ry="18" fill="#4A9B6F" opacity=".55" transform="rotate(15 68 34)"/>
        <circle cx="43" cy="61" r="5" fill="#1B4332"/><circle cx="57" cy="61" r="5" fill="#1B4332"/>
        <path d="M42 72 Q50 78 58 72" stroke="#1B4332" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
