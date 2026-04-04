import { useState, useEffect, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import styles from './AnimalPage.module.css'

export default function AnimalPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [animal, setAnimal] = useState(null)
  const [fotoUrl, setFotoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [panel, setPanel] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [adoptForm, setAdoptForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [adoptOk, setAdoptOk] = useState(false)
  const [adoptLoading, setAdoptLoading] = useState(false)
  const [msgs, setMsgs] = useState([
    { id: 1, mensaje: '¿Convive bien con otros perros?', autor: 'user', es_admin: false, usuario: { nombre: 'Ana M.' } },
    { id: 2, mensaje: 'Sí, Rocky es muy sociable.', autor: 'admin', es_admin: true },
  ])
  const [msgsPriv, setMsgsPriv] = useState([])
  const [inputPub, setInputPub] = useState('')
  const [inputPriv, setInputPriv] = useState('')

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
        vacunado: true, castrado: true, desparasitado: true,
        apto_ninos: true, apto_perros: true, apto_gatos: false,
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

  function sendPub() {
    if (!inputPub.trim()) return
    setMsgs(m => [...m, { id: Date.now(), mensaje: inputPub, autor: 'user', es_admin: false, usuario: { nombre: 'Tú' } }])
    setInputPub('')
    setTimeout(() => {
      setMsgs(m => [...m, { id: Date.now()+1, mensaje: 'Gracias por tu pregunta, te respondemos enseguida.', autor: 'admin', es_admin: true }])
    }, 800)
  }

  function sendPriv() {
    if (!inputPriv.trim()) return
    setMsgsPriv(m => [...m, { id: Date.now(), mensaje: inputPriv, autor: 'user', es_admin: false }])
    setInputPriv('')
    setTimeout(() => {
      setMsgsPriv(m => [...m, { id: Date.now()+1, mensaje: 'Recibido, te respondemos en breve.', autor: 'admin', es_admin: true }])
    }, 800)
  }

  if (loading) return <div className={styles.loading}>Cargando...</div>
  if (!animal) return null

  const disponible = animal.estado === 'disponible'
  const esHembra = animal.sexo === 'hembra'

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <button onClick={() => navigate('/')}>{t('animal.volverGaleria')}</button>
      </div>

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
            {[animal.especie, animal.raza, formatEdad(animal.edad_meses), animal.tamano, animal.sexo].filter(Boolean).join(' · ')}
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
            <button className={`${styles.btnP} ${!disponible ? styles.btnDis : ''}`}
              onClick={() => openPanel('adopcion')} disabled={!disponible}>
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
        <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'14px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'.75rem 1rem',borderBottom:'1px solid var(--border)',fontSize:'13px',fontWeight:'600',color:'var(--deep)',display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#4A9B6F'}}/>
            Preguntas sobre {animal.nombre} (público)
          </div>
          <div style={{flex:1,padding:'.75rem 1rem',display:'flex',flexDirection:'column',gap:'8px',minHeight:'120px',maxHeight:'220px',overflowY:'auto'}}>
            {msgs.map(m => (
              <div key={m.id} style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                {!m.es_admin && <span style={{fontSize:'11px',fontWeight:'600',color:'var(--muted)'}}>{m.usuario?.nombre || 'Usuario'}</span>}
                {m.es_admin
                  ? <span style={{fontSize:'12px',background:'var(--mint)',color:'var(--forest)',padding:'7px 10px',borderRadius:'8px',display:'inline-block',lineHeight:'1.55'}}>{m.mensaje}</span>
                  : <span style={{fontSize:'12px',color:'var(--text)',lineHeight:'1.55'}}>{m.mensaje}</span>
                }
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'6px',padding:'.75rem 1rem',borderTop:'1px solid var(--border)'}}>
            <input value={inputPub} onChange={e => setInputPub(e.target.value)} onKeyDown={e => e.key==='Enter' && sendPub()}
              placeholder="Escribe un mensaje..." style={{flex:1,fontSize:'12px',padding:'7px 10px',border:'1px solid var(--border)',borderRadius:'8px',background:'var(--cream)',color:'var(--text)',fontFamily:'inherit'}}/>
            <button onClick={sendPub} style={{fontSize:'12px',padding:'7px 14px',background:'var(--green)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Enviar</button>
          </div>
        </div>

        <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'14px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'.75rem 1rem',borderBottom:'1px solid var(--border)',fontSize:'13px',fontWeight:'600',color:'var(--deep)',display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#5B8FCC'}}/>
            Chat privado con el refugio
          </div>
          <div style={{flex:1,padding:'.75rem 1rem',display:'flex',flexDirection:'column',gap:'8px',minHeight:'120px',maxHeight:'220px',overflowY:'auto'}}>
            {msgsPriv.length === 0 && <p style={{fontSize:'12px',color:'var(--muted)',textAlign:'center',margin:'auto',padding:'1rem 0'}}>Escríbenos para cualquier consulta privada.</p>}
            {msgsPriv.map(m => (
              <div key={m.id} style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                {!m.es_admin && <span style={{fontSize:'11px',fontWeight:'600',color:'var(--muted)'}}>Tú</span>}
                {m.es_admin
                  ? <span style={{fontSize:'12px',background:'var(--mint)',color:'var(--forest)',padding:'7px 10px',borderRadius:'8px',display:'inline-block',lineHeight:'1.55'}}>{m.mensaje}</span>
                  : <span style={{fontSize:'12px',color:'var(--text)',lineHeight:'1.55'}}>{m.mensaje}</span>
                }
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'6px',padding:'.75rem 1rem',borderTop:'1px solid var(--border)'}}>
            <input value={inputPriv} onChange={e => setInputPriv(e.target.value)} onKeyDown={e => e.key==='Enter' && sendPriv()}
              placeholder="Escribe al refugio..." style={{flex:1,fontSize:'12px',padding:'7px 10px',border:'1px solid var(--border)',borderRadius:'8px',background:'var(--cream)',color:'var(--text)',fontFamily:'inherit'}}/>
            <button onClick={sendPriv} style={{fontSize:'12px',padding:'7px 14px',background:'var(--green)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
