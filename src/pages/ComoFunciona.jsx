import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styles from './ComoFunciona.module.css'

export default function ComoFunciona() {
  const { t } = useTranslation()

  const PASOS = [
    { n: '01', titulo: t('como.paso1T'), desc: t('como.paso1D'), icono: '🔍' },
    { n: '02', titulo: t('como.paso2T'), desc: t('como.paso2D'), icono: '📅' },
    { n: '03', titulo: t('como.paso3T'), desc: t('como.paso3D'), icono: '🐾' },
    { n: '04', titulo: t('como.paso4T'), desc: t('como.paso4D'), icono: '📝' },
    { n: '05', titulo: t('como.paso5T'), desc: t('como.paso5D'), icono: '🏠' },
  ]

  const REQUISITOS = [
    t('como.req1'), t('como.req2'), t('como.req3'), t('como.req4'), t('como.req5'),
  ]

  const FAQS = [
    { p: t('como.faq1P'), r: t('como.faq1R') },
    { p: t('como.faq2P'), r: t('como.faq2R') },
    { p: t('como.faq3P'), r: t('como.faq3R') },
    { p: t('como.faq4P'), r: t('como.faq4R') },
    { p: t('como.faq5P'), r: t('como.faq5R') },
  ]

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>{t('como.eyebrow')}</div>
          <h1>{t('como.titulo')} <em>{t('como.tituloEm')}</em></h1>
          <p>{t('como.sub')}</p>
          <Link to="/" className={styles.btnPrimary}>{t('como.verAnimales')}</Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2>{t('como.faqT')}</h2>
          <div className={styles.pasos}>
            {PASOS.map(p => (
              <div key={p.n} className={styles.paso}>
                <div className={styles.pasoNum}>{p.n}</div>
                <div className={styles.pasoIco}>{p.icono}</div>
                <h3>{p.titulo}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.reqGrid}>
            <div>
              <h2>{t('como.requisitosT')}</h2>
              <p className={styles.reqSub}>{t('como.requisitosSub')}</p>
              <ul className={styles.reqList}>
                {REQUISITOS.map(r => (
                  <li key={r}><span className={styles.reqCheck}>✓</span>{r}</li>
                ))}
              </ul>
            </div>
            <div className={styles.reqBox}>
              <div className={styles.reqBoxIcon}>🐕</div>
              <h3>{t('como.dudasT')}</h3>
              <p>{t('como.dudasD')}</p>
              <Link to="/contacto" className={styles.btnOutline}>{t('como.contactar')}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2>{t('como.faqT')}</h2>
          <div className={styles.faqs}>
            {FAQS.map(f => (
              <div key={f.p} className={styles.faq}>
                <div className={styles.faqP}>{f.p}</div>
                <div className={styles.faqR}>{f.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2>{t('como.ctaT')}</h2>
          <p>{t('como.ctaSub')}</p>
          <Link to="/" className={styles.btnPrimary}>{t('como.verAnimales')}</Link>
        </div>
      </section>
    </div>
  )
}
