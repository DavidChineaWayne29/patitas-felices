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
      const { data, error } = await enviarMensajePublico(animal.id, user.id, msg)
      if (error) {
        console.error('Error chat publico:', error)
        alert('Error: ' + error.message + ' | Code: ' + error.code)
      }
    } else {
      const { data, error } = await enviarMensajePrivado(animal.id, user.id, msg, 'user')
      if (error) {
        console.error('Error chat privado:', error)
        alert('Error: ' + error.message + ' | Code: ' + error.code)
      }
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
          ? `${t('chat.publico')} ${animal.nombre} ${t('chat.publicoSuf')}`
          : t('chat.privado')}
      </div>

      {tipo === 'privado' && !user && (
        <div className={styles.loginPrompt}>
          <button onClick={onNeedAuth}>{t('chat.loginPrompt')}</button>
        </div>
      )}

      <div className={styles.msgs}>
        {msgs.length === 0 && (
          <p className={styles.empty}>
            {tipo === 'publico' ? t('chat.emptyPublico') : t('chat.emptyPrivado')}
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
          placeholder={user ? t('chat.escribe') : t('chat.iniciarSesion')}
          disabled={!user || loading}
        />
        <button onClick={handleSend} disabled={!user || loading || !input.trim()}>
          {t('chat.enviar')}
        </button>
      </div>
    </div>
  )
}
