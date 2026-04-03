import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Contacto.module.css'

export default function Contacto() {
  const { t } = useTranslation()
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
          <div className={styles.eyebrow}>{t('contacto.eyebrow')}</div>
          <h1>{t('contacto.titulo')} <em>{t('contacto.tituloEm')}</em></h1>
          <p>{t('contacto.sub')}</p>
        </div>
      </section>

      <div className={styles.main}>
        <div className={styles.info}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📍</div>
            <div>
              <div className={styles.infoLabel}>{t('contacto.direccion')}</div>
              <div className={styles.infoVal}>{t('contacto.direccionVal1')}</div>
              <div className={styles.infoVal}>{t('contacto.direccionVal2')}</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📞</div>
            <div>
              <div className={styles.infoLabel}>{t('contacto.telefono')}</div>
              <a href={`tel:${t('contacto.telefonoVal')}`} className={styles.infoLink}>{t('contacto.telefonoVal')}</a>
              <div className={styles.infoSub}>{t('contacto.horario')}</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>✉️</div>
            <div>
              <div className={styles.infoLabel}>{t('contacto.emailLabel')}</div>
              <a href={`mailto:${t('contacto.emailVal')}`} className={styles.infoLink}>{t('contacto.emailVal')}</a>
              <div className={styles.infoSub}>{t('contacto.emailSub')}</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🕐</div>
            <div>
              <div className={styles.infoLabel}>{t('contacto.horarioLabel')}</div>
              <div className={styles.infoVal}>{t('contacto.horarioVal')}</div>
            </div>
          </div>
          <div className={styles.mapa}>
            <iframe
              title="Ubicación Patitas Felices"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.6!2d-3.7038!3d40.4168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287!2sMadrid!5e0!3m2!1ses!2ses!4v1"
              width="100%" height="220"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen="" loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className={styles.formBox}>
          <h2>{t('contacto.escribenos')}</h2>
          <p className={styles.formSub}>{t('contacto.formSub')}</p>
          {ok ? (
            <div className={styles.okWrap}>
              <div className={styles.okIcon}>✓</div>
              <h3>{t('contacto.okTitulo')}</h3>
              <p>{t('contacto.okSub')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>{t('contacto.nombre')}</label>
                  <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required placeholder={t('contacto.nombre')}/>
                </div>
                <div className={styles.field}>
                  <label>{t('contacto.email')}</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="tu@email.com"/>
                </div>
              </div>
              <div className={styles.field}>
                <label>{t('contacto.telefonoOpc')}</label>
                <input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+34 600 000 000"/>
              </div>
              <div className={styles.field}>
                <label>{t('contacto.mensajeLabel')}</label>
                <textarea value={form.mensaje} onChange={e => set('mensaje', e.target.value)} required placeholder={t('contacto.mensajePlaceholder')}/>
              </div>
              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? t('contacto.enviando') : t('contacto.enviar')}
              </button>
              <p className={styles.privacy}>{t('contacto.privacy')}</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
