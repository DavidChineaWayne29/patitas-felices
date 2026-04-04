import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────
//  CONFIGURA AQUÍ TUS CREDENCIALES DE SUPABASE
//  Las encuentras en: supabase.com → tu proyecto → Settings → API
// ─────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Auth helpers ──────────────────────────────────────────

export async function signUp({ email, password, nombre, telefono }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre, telefono } },
  })
  return { data, error }
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── Animales ──────────────────────────────────────────────

export async function getAnimales(filtros = {}) {
  let query = supabase
    .from('animales')
    .select('*')
    .order('created_at', { ascending: false })

  if (filtros.especie) query = query.eq('especie', filtros.especie)
  if (filtros.tamano)  query = query.eq('tamano', filtros.tamano)
  if (filtros.estado)  query = query.eq('estado', filtros.estado)

  const { data, error } = await query
  return { data, error }
}

export async function getAnimal(id) {
  const { data, error } = await supabase
    .from('animales')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function getAnimalFotoUrl(path) {
  if (!path) return null
  const { data } = supabase.storage.from('animales-fotos').getPublicUrl(path)
  return data.publicUrl
}

// ── Likes ─────────────────────────────────────────────────

export async function getLike(animalId, userId) {
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('animal_id', animalId)
    .eq('usuario_id', userId)
    .maybeSingle()
  return !!data
}

export async function toggleLike(animalId, userId) {
  const existe = await getLike(animalId, userId)
  if (existe) {
    await supabase.from('likes').delete()
      .eq('animal_id', animalId).eq('usuario_id', userId)
    return false
  } else {
    await supabase.from('likes').insert({ animal_id: animalId, usuario_id: userId })
    return true
  }
}

// ── Chat público ──────────────────────────────────────────

export async function getMensajesPublicos(animalId) {
  const { data, error } = await supabase
    .from('chat_publico')
    .select('*')
    .eq('animal_id', animalId)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function enviarMensajePublico(animalId, usuarioId, mensaje) {
  const { data, error } = await supabase
    .from('chat_publico')
    .insert({ animal_id: animalId, usuario_id: usuarioId, mensaje })
    .select()
    .single()
  return { data, error }
}

// ── Chat privado ──────────────────────────────────────────

export async function getMensajesPrivados(animalId, usuarioId) {
  const { data, error } = await supabase
    .from('chat_privado')
    .select('*')
    .eq('animal_id', animalId)
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function enviarMensajePrivado(animalId, usuarioId, mensaje, autor = 'user') {
  const { data, error } = await supabase
    .from('chat_privado')
    .insert({ animal_id: animalId, usuario_id: usuarioId, mensaje, autor })
    .select()
    .single()
  return { data, error }
}

// ── Citas ─────────────────────────────────────────────────

export async function getCitasOcupadas(animalId, fecha) {
  const { data } = await supabase
    .from('citas')
    .select('hora, count:id')
    .eq('animal_id', animalId)
    .eq('fecha', fecha)
    .neq('estado', 'rechazada')
  return data || []
}

export async function crearCita({ animalId, usuarioId, fecha, hora, nombre, email, telefono, notas }) {
  const { data, error } = await supabase
    .from('citas')
    .insert({
      animal_id: animalId,
      usuario_id: usuarioId,
      fecha,
      hora,
      nombre,
      email,
      telefono,
      notas,
      estado: 'pendiente',
    })
    .select()
    .single()
  return { data, error }
}

export async function getMisCitas(usuarioId) {
  const { data, error } = await supabase
    .from('citas')
    .select('*, animal:animal_id(nombre, especie)')
    .eq('usuario_id', usuarioId)
    .order('fecha', { ascending: true })
  return { data, error }
}

// ── Solicitudes de adopción ───────────────────────────────

export async function crearSolicitudAdopcion({ animalId, usuarioId, nombre, email, telefono, mensaje }) {
  const { data, error } = await supabase
    .from('adopciones')
    .insert({ animal_id: animalId, usuario_id: usuarioId, nombre, email, telefono, mensaje, estado: 'pendiente' })
    .select()
    .single()
  return { data, error }
}
