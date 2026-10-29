import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BookOpen, CalendarDays, Calculator, Home, Swords, Import } from 'lucide-react'
import { LogoMark } from './LogoMark'
import { Avatar } from './ui'
import { useProfile } from '../data/repo'

const TABS = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/recetas', label: 'Recetas', icon: BookOpen },
  { to: '/herramientas', label: 'Calcular', icon: Calculator },
  { to: '/diario', label: 'Diario', icon: CalendarDays },
  { to: '/pandilla', label: 'Pandilla', icon: Swords },
]

export function Shell({ children }: { children: ReactNode }) {
  const profile = useProfile()
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="app">
      <header className="topbar" data-scrolled={scrolled}>
        <Link to="/" className="brand" aria-label="Counter-Chef, inicio">
          <LogoMark size={38} />
          <span className="brand-name">
            Counter<b>-</b>Chef
          </span>
        </Link>
        <Link to="/importar" className="btn btn--primary btn--sm">
          <Import size={16} aria-hidden /> Importar
        </Link>
        <Link to="/perfil" className="icon-btn" aria-label="Perfil y ajustes">
          <Avatar name={profile?.name || 'Tú'} hue={profile?.hue ?? 18} />
        </Link>
      </header>
      <main className="main">{children}</main>
      <nav className="tabbar" aria-label="Secciones">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            <Icon size={22} strokeWidth={2} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
