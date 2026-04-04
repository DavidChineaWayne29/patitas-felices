import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './lib/i18n'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

function setVh() {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}
setVh()
window.addEventListener('resize', setVh)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
