import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import {
  getMensajesPublicos, enviarMensajePublico,
  getMensajesPrivados, enviarMensajePrivado,
  supabase
} from '../lib/supabase'
import styles from './ChatBox.module.css'

export default function ChatBox({ animal, tipo = 'publico', onNeedAuth }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hilos, setHilos] = useState([])
  const [hiloSelec, setHiloSelec] = useState(null)
  const bottomRef = useRef(null)

  const isAdmin = user?.user_metadata?.rol === 'admin'

  useEffect(() => {
    if (tipo === 'privado' && isAdmin) {
      loadHilos()
    } else {
      loadMsgs()
    }
  }, [animal.id, tipo, user])

  useEffect(() => {
    if (tipo === 'privado' && isAdmin && hiloSelec) {
      loadMsgsAdmin(hiloSelec)
    }
  }, [hiloSelec])

  useEffect(() => {
    const tabla = tipo === 'publico' ? 'chat_publico' : 'chat_privado'
    const channel = supabase
      .channel(`${tabla}_${animal.id}_${Math.random()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: tabla }, () => {
        if (tipo === 'privado' && isAdmin && hiloSelec) {
          loadMsgsAdmin(hiloSelec)
        } else {
          loadMsgs()
        }
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [animal.id, tipo, hiloSelec])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function loadHilos() {
    const { data } = await supabase
      .from('chat_privado')
      .select('usuario_id, mensaje, created_at')
      .eq('animal_id', animal.id)
      .order('created_at', { ascending: false })

    if (!data) return
    const map = {}
    data.forEach(m => {
      if (!map[m.usuario_id]) map[m.usuario_id] = { usuario_id: m.usuario_id, ultimo: m.mensaje, fecha: m.created_at }
    })
    setHilos(Object.values(map))
    if (Object.values(map).length > 0) {
      setHiloSelec(Object.values(map)[0].usuario_id)
    }
  }

  async function loadMsgsAdmin(userId) {
    const { data } = await supabase
      .from('chat_privado')
      .select('*')
      .eq('animal_id', animal.id)
      .eq('usuario_id', userId)
      .order('created_at', { ascending: true })
    setMsgs(data || [])
  }

  async function loadMsgs() {
    if (tipo === 'publico') {
      const { data } = await getMensajesPublicos(animal.id)
      setMsgs(data || [])
    } else if (user) {
      const { data } = await getMensajesPrivados(animal.id, user.id)
      setMsgs(data || [])
    }
  }

  async function handleSend() {
    if (!input.trim()) return
    if (!user) { onNeedAuth?.(); return }
    setLoading(true)
    const msg = input.trim()
    setInput('')

    if (tipo === 'publico') {
      await enviarMensajePublico(animal.id, user.id, msg)
    } else {
      const userId = isAdmin && hiloSelec ? hiloSelec : user.id
      await enviarMensajePrivado(animal.id, userId, msg, isAdmin ? 'admin' : 'user')
    }

    if (tipo === 'privado' && isAdmin && hiloSelec) {
      await loadMsgsAdmin(hiloSelec)
    } else {
      await loadMsgs()
    }
    setLoading(false)
  }

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <div className={`${styles.dot} ${tipo === 'publico' ? styles.dotG : styles.dotB}`}/>
        {tipo === 'publico'
          ? `${t('chat.publico')} ${animal.nombre} ${t('chat.publicoSuf')}`
          : t('chat.privado')}
      </div>

      {tipo === 'privado' && isAdmin && hilos.length > 0 && (
        <div className={styles.hilos}>
          {hilos.map(h => (
            <button key={h.usuario_id}
              className={`${styles.hilo} ${hiloSelec === h.usuario_id ? styles.hiloOn : ''}`}
              onClick={() => setHiloSelec(h.usuario_id)}>
              <div className={styles.hiloAvatar}>
                {h.usuario_id.slice(0,2).toUpperCase()}
              </div>
              <div className={styles.hiloInfo}>
                <div className={styles.hiloId}>Usuario</div>
                <div className={styles.hiloUltimo}>{h.ultimo}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {tipo === 'privado' && !user && (
        <div className={styles.loginPrompt}>
          <button onClick={onNeedAuth}>{t('chat.loginPrompt')}</button>
        </div>
      )}

      {tipo === 'privado' && isAdmin && hilos.length === 0 && (
        <div className={styles.msgs}>
          <p className={styles.empty}>No hay conversaciones privadas aún.</p>
        </div>
      )}

      {(!isAdmin || tipo === 'publico' || hiloSelec) && (
        <>
          <div className={styles.msgs}>
            {msgs.length === 0 && (
              <p className={styles.empty}>
                {tipo === 'publico' ? t('chat.emptyPublico') : t('chat.emptyPrivado')}
              </p>
            )}
            {msgs.map(m => {
              const esAdmin = m.autor === 'admin' || m.es_admin
              const esMio = m.usuario_id === user?.id && !esAdmin
              return (
                <div key={m.id} className={styles.msgWrap}
                  style={{alignItems: esAdmin ? 'flex-start' : esMio ? 'flex-end' : 'flex-start'}}>
                  {!esAdmin && !esMio && tipo === 'publico' && (
                    <span className={styles.msgNombre}>Usuario</span>
                  )}
                  {esAdmin && (
                    <span className={styles.msgNombre} style={{color:'var(--forest)'}}>Refugio</span>
                  )}
                  <div className={`${styles.msgBurbuja} ${esAdmin ? styles.msgBurbujaAdmin : esMio ? styles.msgBurbujaMia : styles.msgBurbujaOtro}`}>
                    {m.mensaje}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef}/>
          </div>

          <div className={styles.inputRow}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={user ? t('chat.escribe') : t('chat.iniciarSesion')}
              disabled={!user || loading}
            />
            <button onClick={handleSend} disabled={!user || loading || !input.trim()}>
              {t('chat.enviar')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
