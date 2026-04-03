import { useState } from 'react'
import styles from './Contacto.module.css'

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setOk(true)
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Contacto</div>
          <h1>Estamos aquí para <em>ayudarte</em></h1>
          <p>Escríbenos, llámanos o visítanos. Estaremos encantados de atenderte.</p>
        </div>
      </section>

      <div className={styles.main}>
        <div className={styles.info}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📍</div>
            <div>
              <div className={styles.infoLabel}>Dirección</div>
              <div className={styles.infoVal}>Calle de los Animales, 24</div>
              <div className={styles.infoVal}>28001 Madrid</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📞</div>
            <div>
              <div className={styles.infoLabel}>Teléfono</div>
              <a href="tel:+34912345678" className={styles.infoLink}>+34 912 345 678</a>
              <div className={styles.infoSub}>Lun–Dom · 10:00 a 14:00</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>✉️</div>
            <div>
              <div className={styles.infoLabel}>Email</div>
              <a href="mailto:hola@patitasfelices.es" className={styles.infoLink}>hola@patitasfelices.es</a>
              <div className={styles.infoSub}>Respondemos en menos de 24h</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🕐</div>
            <div>
              <div className={styles.infoLabel}>Horario de visitas</div>
              <div className={styles.infoVal}>Todos los días</div>
              <div className={styles.infoVal}>10:00 — 14:00</div>
            </div>
          </div>
          <div className={styles.mapa}>
            <iframe
              title="Ubicación Patitas Felices"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.6!2d-3.7038!3d40.4168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287!2sMadrid!5e0!3m2!1ses!2ses!4v1"
              width="100%"
              height="220"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className={styles.formBox}>
          <h2>Escríbenos</h2>
          <p className={styles.formSub}>Te respondemos en menos de 24 horas.</p>
          {ok ? (
            <div className={styles.okWrap}>
              <div className={styles.okIcon}>✓</div>
              <h3>¡Mensaje enviado!</h3>
              <p>Gracias por contactarnos. Te responderemos lo antes posible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Nombre</label>
                  <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required placeholder="Tu nombre"/>
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="tu@email.com"/>
                </div>
              </div>
              <div className={styles.field}>
                <label>Teléfono (opcional)</label>
                <input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+34 600 000 000"/>
              </div>
              <div className={styles.field}>
                <label>Mensaje</label>
                <textarea value={form.mensaje} onChange={e => set('mensaje', e.target.value)} required placeholder="¿En qué podemos ayudarte?"/>
              </div>
              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
              <p className={styles.privacy}>Tus datos no se comparten con terceros.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
