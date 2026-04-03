import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getCitasOcupadas, crearCita } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import styles from './CitaCalendar.module.css'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MESES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MESES_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MESES_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const DIAS   = ['Do','Lu','Ma','Mi','Ju','Vi','Sa']
const DIAS_EN = ['Su','Mo','Tu','We','Th','Fr','Sa']
const DIAS_FR = ['Di','Lu','Ma','Me','Je','Ve','Sa']
const DIAS_DE = ['So','Mo','Di','Mi','Do','Fr','Sa']
const HORAS  = ['10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00']
const MAX_POR_FRANJA = 2

export default function CitaCalendar({ animal }) {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [diaSelec, setDia]   = useState(null)
  const [hora, setHora]       = useState('')
  const [ocupadas, setOcupadas] = useState([])
  const [form, setForm] = useState({
    nombre: user?.user_metadata?.nombre || '',
    email: user?.email || '',
    telefono: user?.user_metadata?.telefono || '',
    notas: ''
  })
  const [step, setStep] = useState('cal')
  const [loading, setLoading] = useState(false)

  const lang = i18n.language?.slice(0,2)
  const meses = lang === 'en' ? MESES_EN : lang === 'fr' ? MESES_FR : lang === 'de' ? MESES_DE : MESES
  const dias  = lang === 'en' ? DIAS_EN  : lang === 'fr' ? DIAS_FR  : lang === 'de' ? DIAS_DE  : DIAS

  useEffect(() => {
    if (diaSelec) {
      getCitasOcupadas(animal.id, toISO(diaSelec)).then(rows => setOcupadas(rows))
    }
  }, [diaSelec, animal.id])

  function toISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  function countHora(h) {
    return ocupadas.filter(r => r.hora === h).reduce((s, r) => s + (r.count || 1), 0)
  }

  function changeMonth(dir) {
    let m = month + dir, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setMonth(m); setYear(y)
  }

  function selectHora(h) {
    setHora(h)
    setStep('form')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await crearCita({
      animalId: animal.id,
      usuarioId: user?.id,
      fecha: toISO(diaSelec),
      hora,
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      notas: form.notas,
    })
    setLoading(false)
    if (!error) setStep('ok')
  }

  function downloadICS() {
    const [h, m] = hora.split(':').map(Number)
    const start = new Date(diaSelec)
    start.setHours(h, m, 0)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 30)
    const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PatitasFelices//ES',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Visita a ${animal.nombre} — Patitas Felices`,
      `DESCRIPTION:Visita concertada para conocer a ${animal.nombre}`,
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `visita-${animal.nombre}.ics`
    a.click()
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()

  if (step === 'ok') return (
    <div className={styles.ok}>
      <div className={styles.okIcon}>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#4A9B6F" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3>{t('cita.okTitulo')}</h3>
      <p>{t('cita.okSub')}</p>
      <div className={styles.icalRow}>
        <button className={styles.icalBtn} onClick={downloadICS}>{t('cita.apple')}</button>
        <button className={styles.icalBtn} onClick={downloadICS}>{t('cita.outlook')}</button>
      </div>
    </div>
  )

  if (step === 'form') return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.resumen}>
        <span>{dias[diaSelec.getDay()]} {diaSelec.getDate()} {meses[diaSelec.getMonth()]}</span>
        <span className={styles.horaTag}>{hora}</span>
        <button type="button" className={styles.cambiar} onClick={() => setStep('cal')}>{t('cita.cambiar')}</button>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label>{t('cita.nombre')}</label>
          <input value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} required placeholder={t('cita.nombre')}/>
        </div>
        <div className={styles.field}>
          <label>{t('cita.email')}</label>
          <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required placeholder="email@ejemplo.com"/>
        </div>
      </div>
      <div className={styles.field}>
        <label>{t('cita.whatsapp')} / {t('cita.telefono')} <span style={{color:'var(--muted)',fontSize:'11px'}}>({t('cita.opcional')})</span></label>
        <input value={form.telefono} onChange={e => setForm(f=>({...f,telefono:e.target.value}))} placeholder="+34 600 000 000"/>
      </div>
      <button className={styles.btnEnviar} type="submit" disabled={loading}>
        {loading ? t('cita.enviando') : t('cita.enviar')}
      </button>
    </form>
  )

  return (
    <div className={styles.cal}>
      <div className={styles.calHead}>
        <button className={styles.navBtn} onClick={() => changeMonth(-1)}>‹</button>
        <span>{meses[month]} {year}</span>
        <button className={styles.navBtn} onClick={() => changeMonth(1)}>›</button>
      </div>
      <div className={styles.grid7}>
        {dias.map(d => <div key={d} className={styles.dow}>{d}</div>)}
        {Array.from({length: firstDay}, (_, i) => <div key={`e${i}`} className={styles.empty}/>)}
        {Array.from({length: daysInMonth}, (_, i) => {
          const d = i + 1
          const dt = new Date(year, month, d)
          const isPast = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const isToday = dt.toDateString() === today.toDateString()
          const isPicked = diaSelec?.toDateString() === dt.toDateString()
          return (
            <button key={d} disabled={isPast}
              className={`${styles.day} ${isPast?styles.past:''} ${isToday?styles.today:''} ${isPicked?styles.picked:''}`}
              onClick={() => { setDia(new Date(year,month,d)); setHora('') }}>
              {d}
            </button>
          )
        })}
      </div>

      {diaSelec && (
        <div className={styles.slots}>
          <div className={styles.slotsLabel}>
            {dias[diaSelec.getDay()]} {diaSelec.getDate()} {meses[diaSelec.getMonth()]}
          </div>
          <div className={styles.slotsGrid}>
            {HORAS.map(h => {
              const n = countHora(h)
              const full = n >= MAX_POR_FRANJA
              const libres = MAX_POR_FRANJA - n
              return (
                <button key={h} disabled={full} onClick={() => selectHora(h)}
                  className={`${styles.slot} ${full?styles.slotFull:''} ${hora===h?styles.slotPicked:''}`}>
                  {h}
                  <span className={styles.slotCap}>
                    {full ? t('cita.completo') : `${libres} ${libres === 1 ? t('cita.plaza') : t('cita.plazas')}`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
