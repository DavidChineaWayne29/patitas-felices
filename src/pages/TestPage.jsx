import { useState, useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import styles from './AnimalPage.module.css'

export default function TestPage() {
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

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

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

  useEffect(() => {
    setTimeout(() => {
      setAnimal({
        id: 'test-id',
        nombre: 'Rocky',
        especie: 'perro',
        raza: 'Labrador',
        edad_meses: 24,
        sexo: 'macho',
        tamano: 'mediano',
        descripcion: 'Rocky es un labrador cariñoso lleno de energía. Lleva 3 meses en el refugio y está muy bien socializado.',
        caracter: 'Juguetón, Cariñoso, Activo',
        vacunado: true,
        castrado: true,
        desparasitado: true,
        apto_ninos: true,
        apto_perros: true,
        apto_gatos: false,
        estado: 'disponible',
      })
      setLoading(false)
    }, 300)
  }, [])

  function openPanel(p) {
    if (!user) { setShowAuth(true); return }
    setPanel(prev => prev === p ? null : p)
    setAdoptOk(false)
  }

  function formatEdad(meses) {
    if (!meses) return ''
    if (meses < 12) return `${meses} meses`
    const a = Math.floor(meses / 12)
    return `${a} ${a === 1 ? 'año' : 'años'}`
  }

  if (loading) return <div className={styles.loading}>Cargando...</div>
  if (!animal) return null

  const disponible = animal.estado === 'disponible'
  const esHembra = animal.sexo === 'hembra'

  return (
    <div className={styles.wrap}>
      <div className={styles.ficha}>
        <div className={styles.fichaPhoto}>
          <div style={{width:'100%',height:'100%',background:'linear-gradient(145deg,#E8F5EE,#C8E6D4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg viewBox="0 0 100 100" width="120" height="120">
              <circle cx="50" cy="60" r="28" fill="#4A9B6F" opacity=".4"/>
              <ellipse cx="32" cy="34" rx="12" ry="18" fill="#4A9B6F" opacity=".55" transform="rotate(-15 32 34)"/>
              <ellipse cx="68" cy="34" rx="12" ry="18" fill="#4A9B6F" opacity=".55" transform="rotate(15 68 34)"/>
              <circle cx="43" cy="61" r="5" fill="#1B4332"/><circle cx="57" cy="61" r="5" fill="#1B4332"/>
              <path d="M42 72 Q50 78 58 72" stroke="#1B4332" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className={styles.fichaInfo}>
          <div className={styles.fichaTop}>
            <span className={`${styles.estadoBadge} ${disponible ? styles.ok : styles.res}`}>
              {disponible ? t('animal.disponible') : t('animal.reservado')}
            </span>
          </div>

          <h1 className={styles.nombre}>{animal.nombre}</h1>
          <p className={styles.sub}>
            {[animal.especie, animal.raza, formatEdad(animal.edad_meses), animal.tamano, animal.sexo]
              .filter(Boolean).join(' · ')}
          </p>

          <p className={styles.desc}>{animal.descripcion}</p>

          <div className={styles.pills}>
            {animal.vacunado      && <span className={styles.pill}>{t('animal.vacunado')}</span>}
            {animal.castrado      && <span className={styles.pill}>{t('animal.castrado')}</span>}
            {animal.desparasitado && <span className={styles.pill}>{t('animal.desparasitado')}</span>}
            {animal.apto_ninos    && <span className={styles.pill}>{t('animal.aptoNinos')}</span>}
            {animal.apto_perros   && <span className={styles.pill}>{t('animal.aptoPerros')}</span>}
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
            <form onSubmit={e => { e.preventDefault(); setAdoptOk(true) }} className={styles.adoptForm}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>{t('adopcion.nombre')}</label>
                  <input value={adoptForm.nombre} onChange={e => setAdoptForm(f=>({...f,nombre:e.target.value}))} required placeholder={t('adopcion.nombre')}/>
                </div>
                <div className={styles.field}>
                  <label>{t('adopcion.apellidos')}</label>
                  <input placeholder={t('adopcion.apellidos')}/>
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
                <textarea value={adoptForm.mensaje} onChange={e => setAdoptForm(f=>({...f,mensaje:e.target.value}))} placeholder={t('adopcion.mensajePlaceholder')}/>
              </div>
              <button type="submit" className={styles.btnSubmit} disabled={adoptLoading}>
                {t('adopcion.enviar')}
              </button>
              <p className={styles.privacy}>{t('adopcion.privacy')}</p>
            </form>
          )}
        </div>
      )}

      <div className={styles.chats}>
        <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'14px',padding:'1rem'}}>
          <div style={{fontSize:'13px',fontWeight:'600',color:'var(--deep)',marginBottom:'.5rem',display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#4A9B6F'}}/>
            Chat público — {animal.nombre}
          </div>
          <p style={{fontSize:'12px',color:'var(--muted)',textAlign:'center',padding:'1rem 0'}}>Chat de prueba</p>
        </div>
        <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'14px',padding:'1rem'}}>
          <div style={{fontSize:'13px',fontWeight:'600',color:'var(--deep)',marginBottom:'.5rem',display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#5B8FCC'}}/>
            Chat privado
          </div>
          <p style={{fontSize:'12px',color:'var(--muted)',textAlign:'center',padding:'1rem 0'}}>Chat de prueba</p>
        </div>
      </div>
    </div>
  )
}
