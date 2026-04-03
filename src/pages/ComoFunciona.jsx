import { Link } from 'react-router-dom'
import styles from './ComoFunciona.module.css'

const PASOS = [
  { n: '01', titulo: 'Explora y elige', desc: 'Navega por nuestra galería de animales. Filtra por especie, tamaño o edad. Cuando encuentres a alguien especial, dale un me gusta o abre su ficha para conocerle mejor.', icono: '🔍' },
  { n: '02', titulo: 'Concerta una visita', desc: 'Desde la ficha del animal puedes reservar una visita en el refugio. Elige el día y la hora que mejor te venga — disponemos de franjas de lunes a domingo de 10h a 14h.', icono: '📅' },
  { n: '03', titulo: 'Conócele en persona', desc: 'Ven al refugio y pasa tiempo con el animal. Nuestro equipo te acompañará durante la visita y resolverá todas tus dudas. Sin prisas, sin compromisos.', icono: '🐾' },
  { n: '04', titulo: 'Solicita la adopción', desc: 'Si sientes que es el compañero ideal, rellena la solicitud de adopción. Revisamos cada caso con cariño para asegurarnos de que el animal va a un hogar feliz.', icono: '📝' },
  { n: '05', titulo: '¡Bienvenido a casa!', desc: 'Una vez aprobada la solicitud, el animal es tuyo. Te damos toda la documentación, el historial veterinario y apoyo post-adopción si lo necesitas.', icono: '🏠' },
]

const REQUISITOS = [
  'Ser mayor de 18 años',
  'Tener una vivienda estable donde el animal pueda vivir cómodamente',
  'Comprometerse a cubrir sus necesidades veterinarias básicas',
  'No tener antecedentes de maltrato animal',
  'Disponer de tiempo para dedicarle atención y cuidados diarios',
]

const FAQS = [
  { p: '¿Cuánto cuesta adoptar?', r: 'La adopción es gratuita. Pedimos una donación voluntaria para ayudar a sufragar los gastos veterinarios de los animales que siguen en el refugio.' },
  { p: '¿Los animales están vacunados y desparasitados?', r: 'Sí. Todos los animales salen del refugio vacunados, desparasitados y esterilizados. Recibirás su cartilla veterinaria completa.' },
  { p: '¿Puedo devolver al animal si no funciona?', r: 'Siempre. Preferimos que el animal vuelva con nosotros antes de que acabe en una situación difícil. Te pedimos que nos contactes y buscamos una solución juntos.' },
  { p: '¿Hacéis seguimiento post-adopción?', r: 'Sí, hacemos un seguimiento a los 7 días, al mes y a los 3 meses. Estamos disponibles por email y WhatsApp para cualquier duda.' },
  { p: '¿Puedo adoptar si vivo de alquiler?', r: 'Sí, siempre que tu contrato o casero lo permita. Te pediremos que nos lo confirmes en la solicitud.' },
]

export default function ComoFunciona() {
  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Proceso de adopción</div>
          <h1>Adoptar es más fácil <em>de lo que crees</em></h1>
          <p>Te acompañamos en cada paso. Desde que conoces al animal hasta que llega a su nuevo hogar.</p>
          <Link to="/" className={styles.btnPrimary}>Ver animales disponibles</Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2>Los 5 pasos para adoptar</h2>
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
              <h2>Requisitos para adoptar</h2>
              <p className={styles.reqSub}>Queremos asegurarnos de que cada animal va al hogar que merece.</p>
              <ul className={styles.reqList}>
                {REQUISITOS.map(r => (
                  <li key={r}><span className={styles.reqCheck}>✓</span>{r}</li>
                ))}
              </ul>
            </div>
            <div className={styles.reqBox}>
              <div className={styles.reqBoxIcon}>🐕</div>
              <h3>¿Tienes dudas?</h3>
              <p>Escríbenos sin compromiso. Estamos aquí para ayudarte a encontrar al compañero perfecto para tu estilo de vida.</p>
              <Link to="/contacto" className={styles.btnOutline}>Contactar con el refugio</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2>Preguntas frecuentes</h2>
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
          <h2>¿Listo para conocerles?</h2>
          <p>47 animales están esperando un hogar ahora mismo.</p>
          <Link to="/" className={styles.btnPrimary}>Ver todos los animales</Link>
        </div>
      </section>
    </div>
  )
}
