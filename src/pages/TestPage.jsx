import { useEffect, useLayoutEffect } from 'react'

export default function TestPage() {
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

  return (
    <div style={{padding:'2rem', maxWidth:'900px', margin:'0 auto'}}>
      <h1 style={{fontFamily:'Fraunces,serif', color:'#1B4332', marginBottom:'1rem'}}>Página de prueba</h1>
      <p style={{color:'#6B8F7A', marginBottom:'2rem'}}>Si ves esto desde arriba, el scroll funciona correctamente en esta página.</p>
      {Array.from({length: 20}, (_, i) => (
        <p key={i} style={{padding:'1rem', background:'#E8F5EE', borderRadius:'8px', marginBottom:'8px', color:'#1B4332'}}>
          Línea {i + 1} de contenido de prueba
        </p>
      ))}
    </div>
  )
}
