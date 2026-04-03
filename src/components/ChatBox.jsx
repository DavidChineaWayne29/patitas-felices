import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  getMensajesPublicos, enviarMensajePublico,
  getMensajesPrivados, enviarMensajePrivado,
  supabase
} from '../lib/supabase'
import styles from './ChatBox.module.css'

export default function ChatBox({ animal, tipo = 'publico', onNeedAuth }) {
  const { user } = useAuth()
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    loadMsgs()
    const tabla = tipo === 'publico' ? 'chat_publico' : 'chat_privado'
    const channel = supabase.channel(`${tabla}:${animal.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: tabla,
        filter: `animal_id=eq.${animal.id}` }, payload => {
        setMsgs(prev => [...prev, payload.new])
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [animal.id, tipo])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

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
      await enviarMensajePrivado(animal.id, user.id, msg, 'user')
    }
    setLoading(false)
  }

  const nombreUsuario = (msg) =>
    msg.usuario?.nombre || msg.usuario?.email?.split('@')[0] || 'Usuario'

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <div className={`${styles.dot} ${tipo === 'publico' ? styles.dotG : styles.dotB}`}/>
        {tipo === 'publico'
          ? `Preguntas sobre ${animal.nombre} (público)`
          : `Chat privado con el refugio`}
      </div>

      {tipo === 'privado' && !user && (
        <div className={styles.loginPrompt}>
          <button onClick={onNeedAuth}>Inicia sesión para chatear</button>
        </div>
      )}

      <div className={styles.msgs}>
        {msgs.length === 0 && (
          <p className={styles.empty}>
            {tipo === 'publico'
              ? 'Sé el primero en preguntar algo sobre este animal.'
              : 'Escríbenos para cualquier consulta privada sobre este animal.'}
          </p>
        )}
        {msgs.map(m => (
          <div key={m.id} className={`${styles.msg} ${m.autor === 'admin' || m.es_admin ? styles.msgAdmin : styles.msgUser}`}>
            {(m.autor !== 'admin' && !m.es_admin) && (
              <span className={styles.msgNombre}>
                {tipo === 'publico' ? nombreUsuario(m) : 'Tú'}
              </span>
            )}
            <span className={styles.msgTexto}>{m.mensaje}</span>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      <div className={styles.inputRow}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={user ? `Escribe un mensaje...` : 'Inicia sesión para escribir'}
          disabled={!user || loading}
        />
        <button onClick={handleSend} disabled={!user || loading || !input.trim()}>
          Enviar
        </button>
      </div>
    </div>
  )
}
