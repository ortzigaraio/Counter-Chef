import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useRoast } from '../components/ui'
import { daySeed } from '../lib/roasts'
import { css } from '../lib/css'

export function Tools() {
  const r = useRoast()
  return (
    <>
      <h1 className="h-page">Calcular</h1>
      <p className="lede">{r('dough', {}, daySeed())}</p>
      <div className="tool-links section" style={{ marginTop: 20 }}>
        <Link to="/herramientas/masa" className="tool-link tool-link--wide">
          <span className="row between">
            <b>Masa de pizza y pan</b>
            <ArrowRight aria-hidden />
          </span>
          <span className="small" style={{ opacity: 0.8 }}>
            Bolas, hidratación, sal, levadura según horas y temperatura, poolish y biga.
          </span>
        </Link>
        <Link to="/herramientas/convertir?t=medidas" className="tool-link" style={css({ '--tl': 'var(--mostaza-soft)' })}>
          <b>Tazas a gramos</b>
          <span className="small muted">Con la densidad de cada ingrediente.</span>
        </Link>
        <Link to="/herramientas/convertir?t=moldes" className="tool-link" style={css({ '--tl': 'var(--albahaca-soft)' })}>
          <b>Cambiar de molde</b>
          <span className="small muted">De 20 cm a 26 cm sin hacer un bizcocho plano.</span>
        </Link>
        <Link to="/herramientas/convertir?t=horno" className="tool-link" style={css({ '--tl': 'var(--bomba-soft)' })}>
          <b>Horno</b>
          <span className="small muted">°C, °F, gas y ventilador.</span>
        </Link>
        <Link to="/herramientas/convertir?t=levadura" className="tool-link" style={css({ '--tl': 'var(--ct-soft)' })}>
          <b>Levaduras</b>
          <span className="small muted">Fresca, seca, instantánea y masa madre.</span>
        </Link>
      </div>
      <p className="small faint" style={{ marginTop: 24 }}>
        El escalador de raciones, el % panadero y la nutrición están dentro de cada receta.
      </p>
    </>
  )
}
