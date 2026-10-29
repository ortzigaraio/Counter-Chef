import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './App'
import './styles/app.css'

// Web Share Target: Android abre ./?share_text=…; lo guardamos y vamos a Importar.
const params = new URLSearchParams(location.search)
if (params.has('share_text') || params.has('share_url') || params.has('share_title')) {
  sessionStorage.setItem(
    'cc-share',
    JSON.stringify({ title: params.get('share_title') ?? '', text: params.get('share_text') ?? '', url: params.get('share_url') ?? '' }),
  )
  history.replaceState(null, '', `${location.pathname}#/importar`)
}

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
