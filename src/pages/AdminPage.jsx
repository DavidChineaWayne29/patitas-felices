import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('animales')
  const [animales, setAnimales] = useState([])
  const [citas, setCitas] = useState([])
  const [adopciones, setAdopciones] = useState([])
  const [chatsPrivados, setChatsPrivados] = useState([])
  const [formAnimal, setFormAnimal] = useState(defaultAnimal())
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [foto, setFoto] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.user_metadata?.rol !== 'admin')) {
      navigate('/')
    }
  }, [user, loading])

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [a, c, ad] = await Promise.all([
      supabase.from('animales').select('*').order('created_at', { ascending: false }),
      supabase.from('citas').select('*, animal:animal_id(nombre)').order('fecha'),
      supabase.from('adopciones').select('*, animal:animal_id(nombre)').order('created_at', { ascending: false }),
    ])
    setAnimales(a.data || [])
    setCitas(c.data || [])
    setAdopciones(ad.data || [])

    // Conversaciones privadas únicas
    const { data: privs } = await supabase
      .from('chat_privado')
      .select('animal_id, usuario_id, mensaje, created_at, animales(nombre)')
      .order('created_at', { ascending: false })
    // Agrupar por animal+usuario único
    const map = {}
    ;(privs || []).forEach(m => {
      const k = `${m.animal_id}_${m.usuario_id}`
      if (!map[k]) map[k] = { ...m, count: 0 }
      map[k].count++
    })
    setChatsPrivados(Object.values(map))
  }

  function defaultAnimal() {
    return {
      nombre: '', especie: 'perro', raza: '', edad_meses: '', sexo: 'macho',
      tamano: 'mediano', descripcion: '', caracter: '',
      vacunado: false, castrado: false, desparasitado: false,
      apto_ninos: false, apto_perros: false, apto_gatos: false,
      estado: 'disponible',
    }
  }

  function setF(k, v) { setFormAnimal(f => ({ ...f, [k]: v })) }

  async function handleSaveAnimal(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    let foto_principal = formAnimal.foto_principal || null

    if (foto) {
      const ext = foto.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('animales-fotos').upload(path, foto)
      if (!upErr) foto_principal = path
    }

    const payload = { ...formAnimal, foto_principal, edad_meses: Number(formAnimal.edad_meses) || null }

    if (editId) {
      await supabase.from('animales').update(payload).eq('id', editId)
    } else {
      await supabase.from('animales').insert(payload)
    }

    setSaving(false)
    setMsg(editId ? 'Animal actualizado.' : 'Animal añadido.')
    setFormAnimal(defaultAnimal())
    setEditId(null)
    setFoto(null)
    loadAll()
  }

  function editAnimal(a) {
    setFormAnimal(a)
    setEditId(a.id)
    setTab('animales')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteAnimal(id) {
    if (!confirm('¿Eliminar este animal?')) return
    await supabase.from('animales').delete().eq('id', id)
    loadAll()
  }

  async function confirmarCita(id) {
  const cita = citas.find(c => c.id === id)
  
  // Llamar a la Edge Function que envía el email
  await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirmar-cita`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ cita_id: id }),
  })

  // Botón WhatsApp si tiene teléfono
  if (cita?.telefono) {
    const tel = cita.telefono.replace(/\s+/g, '').replace('+', '')
    const msg = encodeURIComponent(`Hola ${cita.nombre}, tu visita a ${cita.animal?.nombre} está confirmada para el ${cita.fecha} a las ${cita.hora}. ¡Hasta pronto! 🐾 Patitas Felices`)
    window.open(`https://wa.me/${tel}?text=${msg}`, '_blank')
  }

  loadAll()
}

 async function rechazarCita(id) {
  await supabase.from('citas').update({ estado: 'rechazada' }).eq('id', id)
  loadAll()
}

  async function actualizarAdopcion(id, estado) {
    await supabase.from('adopciones').update({ estado }).eq('id', id)
    loadAll()
  }

  const citasPend = citas.filter(c => c.estado === 'pendiente')
  const citasConf = citas.filter(c => c.estado === 'confirmada')

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1>Panel de administración</h1>
        <p>Gestiona animales, citas y solicitudes de adopción</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          ['animales', `Animales (${animales.length})`],
          ['citas', `Citas (${citasPend.length} pendientes)`],
          ['adopciones', `Adopciones (${adopciones.filter(a=>a.estado==='pendiente').length})`],
          ['chats', `Chats privados (${chatsPrivados.length})`],
        ].map(([k, label]) => (
          <button key={k} className={`${styles.tab} ${tab===k ? styles.tabOn : ''}`} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── ANIMALES ── */}
      {tab === 'animales' && (
        <div className={styles.section}>
          <div className={styles.sectionGrid}>
            {/* Formulario */}
            <div className={styles.formBox}>
              <h2>{editId ? 'Editar animal' : 'Añadir animal'}</h2>
              {msg && <div className={styles.msgOk}>{msg}</div>}
              <form onSubmit={handleSaveAnimal} className={styles.form}>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Nombre *</label>
                    <input value={formAnimal.nombre} onChange={e=>setF('nombre',e.target.value)} required placeholder="Nombre del animal"/>
                  </div>
                  <div className={styles.field}>
                    <label>Especie *</label>
                    <select value={formAnimal.especie} onChange={e=>setF('especie',e.target.value)}>
                      {['perro','gato','conejo','ave','otro'].map(e=><option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Raza</label>
                    <input value={formAnimal.raza} onChange={e=>setF('raza',e.target.value)} placeholder="Mestizo/a si no se sabe"/>
                  </div>
                  <div className={styles.field}>
                    <label>Edad (meses)</label>
                    <input type="number" value={formAnimal.edad_meses} onChange={e=>setF('edad_meses',e.target.value)} placeholder="Ej: 24"/>
                  </div>
                </div>
                <div className={styles.row3}>
                  <div className={styles.field}>
                    <label>Sexo</label>
                    <select value={formAnimal.sexo} onChange={e=>setF('sexo',e.target.value)}>
                      <option value="macho">Macho</option>
                      <option value="hembra">Hembra</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Tamaño</label>
                    <select value={formAnimal.tamano} onChange={e=>setF('tamano',e.target.value)}>
                      {['pequeño','mediano','grande'].map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Estado</label>
                    <select value={formAnimal.estado} onChange={e=>setF('estado',e.target.value)}>
                      {['disponible','reservado','adoptado'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Descripción</label>
                  <textarea value={formAnimal.descripcion} onChange={e=>setF('descripcion',e.target.value)} placeholder="Descripción del animal, su historia, carácter..."/>
                </div>
                <div className={styles.field}>
                  <label>Carácter (separado por comas)</label>
                  <input value={formAnimal.caracter} onChange={e=>setF('caracter',e.target.value)} placeholder="Juguetón, Tranquilo, Cariñoso"/>
                </div>
                <div className={styles.checks}>
                  {[
                    ['vacunado','Vacunado/a'],['castrado','Castrado/a'],['desparasitado','Desparasitado/a'],
                    ['apto_ninos','Apto con niños'],['apto_perros','Apto con perros'],['apto_gatos','Apto con gatos'],
                  ].map(([k,label])=>(
                    <label key={k} className={styles.check}>
                      <input type="checkbox" checked={!!formAnimal[k]} onChange={e=>setF(k,e.target.checked)}/>
                      {label}
                    </label>
                  ))}
                </div>
                <div className={styles.field}>
                  <label>Foto principal</label>
                  <label className={styles.fotoUpload}>
                    {foto ? (
                      <img src={URL.createObjectURL(foto)} alt="preview" className={styles.fotoPreview}/>
                    ) : formAnimal.foto_principal ? (
                      <div className={styles.fotoExiste}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--green)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                        <span>Ya tiene foto — haz clic para cambiarla</span>
                      </div>
                    ) : (
                      <div className={styles.fotoPlaceholder}>
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--sage)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                        <span>Haz clic para subir una foto</span>
                        <span className={styles.fotoHint}>JPG, PNG o WebP · Máx 5MB</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={e=>setFoto(e.target.files[0])} style={{display:'none'}}/>
                  </label>
                  {foto && (
                    <button type="button" className={styles.fotoRemove}
                      onClick={() => setFoto(null)}>
                      Quitar foto
                    </button>
                  )}
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.btnSave} disabled={saving}>
                    {saving ? 'Guardando...' : editId ? 'Actualizar animal' : 'Añadir animal'}
                  </button>
                  {editId && (
                    <button type="button" className={styles.btnCancel}
                      onClick={() => { setFormAnimal(defaultAnimal()); setEditId(null); setMsg('') }}>
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista animales */}
            <div className={styles.listBox}>
              <h2>Animales ({animales.length})</h2>
              <div className={styles.animalList}>
                {animales.map(a => (
                  <div key={a.id} className={styles.animalRow}>
                    <div className={styles.animalInfo}>
                      <span className={styles.animalNombre}>{a.nombre}</span>
                      <span className={styles.animalMeta}>{a.especie} · {a.tamano} · {a.estado}</span>
                    </div>
                    <div className={styles.animalActions}>
                      <button className={styles.btnEdit} onClick={() => editAnimal(a)}>Editar</button>
                      <button className={styles.btnDel} onClick={() => deleteAnimal(a.id)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CITAS ── */}
      {tab === 'citas' && (
        <div className={styles.section}>
          <h2>Citas pendientes</h2>
          {citasPend.length === 0 && <p className={styles.empty}>No hay citas pendientes.</p>}
          {citasPend.map(c => (
            <div key={c.id} className={`${styles.citaRow} ${styles.citaPend}`}>
              <div className={styles.citaInfo}>
                <div className={styles.citaNombre}>{c.nombre}</div>
                <div className={styles.citaMeta}>
                  {c.animal?.nombre} · {c.fecha} · {c.hora} · {c.email} · {c.telefono}
                </div>
                {c.notas && <div className={styles.citaNotas}>"{c.notas}"</div>}
              </div>
              <div className={styles.citaActions}>
                <button className={styles.btnConf} onClick={() => confirmarCita(c.id)}>Confirmar</button>
                <button className={styles.btnRech} onClick={() => rechazarCita(c.id)}>Rechazar</button>
              </div>
            </div>
          ))}

          <h2 style={{marginTop:'1.5rem'}}>Citas confirmadas</h2>
          {citasConf.length === 0 && <p className={styles.empty}>No hay citas confirmadas.</p>}
          {citasConf.map(c => (
            <div key={c.id} className={`${styles.citaRow} ${styles.citaConf}`}>
              <div className={styles.citaInfo}>
                <div className={styles.citaNombre}>{c.nombre}</div>
                <div className={styles.citaMeta}>{c.animal?.nombre} · {c.fecha} · {c.hora} · {c.email}</div>
              </div>
              <span className={styles.badgeConf}>Confirmada</span>
            </div>
          ))}
        </div>
      )}

      {/* ── ADOPCIONES ── */}
      {tab === 'adopciones' && (
        <div className={styles.section}>
          <h2>Solicitudes de adopción</h2>
          {adopciones.length === 0 && <p className={styles.empty}>No hay solicitudes.</p>}
          {adopciones.map(a => (
            <div key={a.id} className={`${styles.citaRow} ${a.estado==='pendiente'?styles.citaPend:styles.citaConf}`}>
              <div className={styles.citaInfo}>
                <div className={styles.citaNombre}>{a.nombre} → {a.animal?.nombre}</div>
                <div className={styles.citaMeta}>{a.email} · {a.telefono} · Estado: <strong>{a.estado}</strong></div>
                {a.mensaje && <div className={styles.citaNotas}>"{a.mensaje}"</div>}
              </div>
              {a.estado === 'pendiente' && (
                <div className={styles.citaActions}>
                  <button className={styles.btnConf} onClick={() => actualizarAdopcion(a.id,'en_proceso')}>En proceso</button>
                  <button className={styles.btnRech} onClick={() => actualizarAdopcion(a.id,'rechazada')}>Rechazar</button>
                </div>
              )}
              {a.estado !== 'pendiente' && <span className={styles.badgeConf}>{a.estado}</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── CHATS PRIVADOS ── */}
      {tab === 'chats' && (
        <div className={styles.section}>
          <h2>Conversaciones privadas</h2>
          <p className={styles.chatNote}>Responde directamente desde la ficha del animal en Supabase o a través del panel de mensajes.</p>
          {chatsPrivados.length === 0 && <p className={styles.empty}>No hay conversaciones privadas.</p>}
          {chatsPrivados.map(c => (
            <div key={`${c.animal_id}_${c.usuario_id}`} className={styles.chatRow}>
              <div>
                <div className={styles.citaNombre}>{c.animales?.nombre || 'Animal'}</div>
                <div className={styles.citaMeta}>Usuario: {c.usuario_id} · {c.count} mensajes · Último: {new Date(c.created_at).toLocaleDateString('es')}</div>
                <div className={styles.citaNotas}>"{c.mensaje}"</div>
              </div>
              <button className={styles.btnEdit}
                onClick={() => navigate(`/animal/${c.animal_id}`)}>
                Ver ficha
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
