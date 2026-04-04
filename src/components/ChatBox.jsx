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
  }, [animal.id, tipo, user])

  useEffect(() => {
    const tabla = tipo === 'publico' ? 'chat_publico' : 'chat_privado'
    const channel = supabase
      .channel(`${tabla}_${animal.id}_${Math.random()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: tabla,
      }, () => {
        loadMsgs()
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
      const userId = user.user_metadata?.rol === 'admin' 
        ? animal.usuario_id || user.id 
        : user.id
      const { data } = await getMensajesPrivados(animal.id, userId)
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
    await loadMsgs()
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
        {msgs.map(m => {
          const esAdmin = m.autor === 'admin' || m.es_admin
          const esMio = m.usuario_id === user?.id && !esAdmin
          return (
            <div key={m.id} className={styles.msgWrap} style={{alignItems: esAdmin ? 'flex-start' : esMio ? 'flex-end' : 'flex-start'}}>
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
    </div>
  )
}
