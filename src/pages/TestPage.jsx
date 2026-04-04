import { useState, useEffect, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function TestPage() {
  const { id } = 'test'
  const navigate = useNavigate()
  const { user } = useAuth()
  const [animal, setAnimal] = useState(null)
  const [fotoUrl, setFotoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [panel, setPanel] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [adoptForm, setAdoptForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [adoptOk, setAdoptOk] = useState(false)
  const [adoptLoading, setAdoptLoading] = useState(false)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setAnimal({ nombre: 'Test', especie: 'perro' })
      setLoading(false)
    }, 300)
  }, [])

  if (loading) return <div style={{padding:'2rem', color:'#6B8F7A'}}>Cargando...</div>

  return (
    <div style={{padding:'1.5rem 2rem 3rem', maxWidth:'900px', margin:'0 auto'}}>
      <h1 style={{fontFamily:'Fraunces,serif', color:'#1B4332', marginBottom:'1rem'}}>
        Ficha de prueba — {animal?.nombre}
      </h1>
      <div style={{background:'#FAFFFE', border:'1px solid #D4EAD8', borderRadius:'16px', padding:'1.5rem', marginBottom:'1.25rem'}}>
        <p style={{color:'#6B8F7A', fontSize:'13px'}}>Contenido de la ficha simulada</p>
      </div>
      {Array.from({length: 15}, (_, i) => (
        <p key={i} style={{padding:'1rem', background:'#E8F5EE', borderRadius:'8px', marginBottom:'8px', color:'#1B4332', fontSize:'13px'}}>
          Línea {i + 1} de contenido
        </p>
      ))}
    </div>
  )
}
