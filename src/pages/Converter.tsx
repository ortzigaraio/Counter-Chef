import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownUp } from 'lucide-react'
import { NumberField } from '../components/ui'
import { FOODS } from '../lib/foods'
import { cToF, convert, fmtNum, fToC, gasMark, getUnit, MASS_UNITS, panArea, panFactor, round, VOLUME_UNITS, type Pan } from '../lib/units'
import { css } from '../lib/css'

type Tab = 'medidas' | 'moldes' | 'horno' | 'levadura'
const TABS: { id: Tab; label: string }[] = [
  { id: 'medidas', label: 'Medidas' },
  { id: 'moldes', label: 'Moldes' },
  { id: 'horno', label: 'Horno' },
  { id: 'levadura', label: 'Levadura' },
]

export function Converter() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('t') as Tab) || 'medidas'
  return (
    <>
      <h1 className="h-page">Convertir</h1>
      <div className="seg" role="tablist" aria-label="Conversor">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} aria-pressed={tab === t.id} onClick={() => setParams({ t: t.id }, { replace: true })}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="section" style={{ marginTop: 20 }}>
        {tab === 'medidas' && <Measures />}
        {tab === 'moldes' && <Pans />}
        {tab === 'horno' && <Oven />}
        {tab === 'levadura' && <Yeast />}
      </div>
    </>
  )
}

const ALL_UNITS = [...MASS_UNITS, ...VOLUME_UNITS]
const withDensity = FOODS.filter((f) => f.density).sort((a, b) => a.label.localeCompare(b.label, 'es'))

function Measures() {
  const [value, setValue] = useState(1)
  const [from, setFrom] = useState<string>('taza')
  const [to, setTo] = useState<string>('g')
  const [food, setFood] = useState('harina')
  const f = FOODS.find((x) => x.key === food)
  const out = convert(value, from, to, f?.density ?? 1)

  return (
    <div className="stack" style={css({ '--gap': '16px' })}>
      <label className="field">
        <span className="label">Ingrediente</span>
        <select className="select" value={food} onChange={(e) => setFood(e.target.value)}>
          {withDensity.map((x) => (
            <option key={x.key} value={x.key}>
              {x.label} · {fmtNum(x.density!)} g/ml
            </option>
          ))}
        </select>
      </label>
      <div className="row" style={css({ alignItems: 'flex-end', '--gap': '8px' })}>
        <NumberField label="Cantidad" value={value} step={0.25} onChange={setValue} />
        <UnitSelect label="De" value={from} onChange={setFrom} />
      </div>
      <div className="row" style={css({ alignItems: 'flex-end', '--gap': '8px' })}>
        <button
          className="icon-btn"
          aria-label="Intercambiar unidades"
          onClick={() => {
            setFrom(to)
            setTo(from)
          }}
        >
          <ArrowDownUp size={20} />
        </button>
        <UnitSelect label="A" value={to} onChange={setTo} />
      </div>
      <div className="panel">
        <div className="conv-out num" aria-live="polite">
          {out == null ? '—' : fmtNum(round(out, out < 10 ? 2 : 0))} <span className="h-sec">{getUnit(to)?.many}</span>
        </div>
        <p className="small muted" style={{ marginTop: 6 }}>
          {fmtNum(value)} {getUnit(from)?.[value === 1 ? 'one' : 'many']} de {f?.label.toLowerCase()}. Taza = 240 ml, cucharada = 15 ml, cucharadita = 5 ml.
        </p>
      </div>
      <h2 className="h-sec">Una taza de…</h2>
      <table className="result-table">
        <tbody>
          {['harina', 'azucar', 'azucar-glas', 'mantequilla', 'leche', 'aceite-oliva', 'cacao', 'arroz', 'avena', 'miel'].map((k) => {
            const x = FOODS.find((y) => y.key === k)!
            return (
              <tr key={k}>
                <td>{x.label}</td>
                <td>
                  <b>{Math.round(240 * x.density!)} g</b>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function UnitSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="field grow">
      <span className="label">{label}</span>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {ALL_UNITS.map((u) => (
          <option key={u} value={u}>
            {getUnit(u)?.many}
          </option>
        ))}
      </select>
    </label>
  )
}

function PanInput({ label, pan, onChange }: { label: string; pan: Pan; onChange: (p: Pan) => void }) {
  return (
    <div className="panel stack" style={css({ '--gap': '10px' })}>
      <div className="row between">
        <strong>{label}</strong>
        <div className="seg" role="group" aria-label={`Forma ${label}`}>
          <button aria-pressed={pan.shape === 'redondo'} onClick={() => onChange({ shape: 'redondo', d: 22 })}>
            Redondo
          </button>
          <button aria-pressed={pan.shape === 'rectangular'} onClick={() => onChange({ shape: 'rectangular', w: 30, h: 20 })}>
            Rectangular
          </button>
        </div>
      </div>
      {pan.shape === 'redondo' ? (
        <NumberField label="Diámetro" suffix="cm" value={pan.d} onChange={(d) => onChange({ ...pan, d })} />
      ) : (
        <div className="grid-2">
          <NumberField label="Largo" suffix="cm" value={pan.w} onChange={(w) => onChange({ ...pan, w })} />
          <NumberField label="Ancho" suffix="cm" value={pan.h} onChange={(h) => onChange({ ...pan, h })} />
        </div>
      )}
      <span className="small faint num">{fmtNum(Math.round(panArea(pan)))} cm²</span>
    </div>
  )
}

function Pans() {
  const [a, setA] = useState<Pan>({ shape: 'redondo', d: 20 })
  const [b, setB] = useState<Pan>({ shape: 'redondo', d: 26 })
  const k = panFactor(a, b)
  return (
    <div className="stack" style={css({ '--gap': '14px' })}>
      <PanInput label="Molde de la receta" pan={a} onChange={setA} />
      <PanInput label="Tu molde" pan={b} onChange={setB} />
      <div className="panel" style={{ background: 'var(--ink)', color: 'var(--bg)', borderColor: 'transparent' }}>
        <div className="conv-out num">×{fmtNum(round(k, 2))}</div>
        <p className="small" style={{ opacity: 0.8, marginTop: 6 }}>
          Multiplica todos los ingredientes por {fmtNum(round(k, 2))} para mantener la misma altura. Usa el modo «Factor» dentro de la receta.
          {k > 1.4 ? ' Vigila el horneado: unos minutos más y comprueba con palillo.' : ''}
          {k < 0.7 ? ' Hornea menos tiempo, que se te seca.' : ''}
        </p>
      </div>
    </div>
  )
}

function Oven() {
  const [c, setC] = useState(180)
  return (
    <div className="stack" style={css({ '--gap': '16px' })}>
      <NumberField label="Temperatura" suffix="°C" value={c} step={5} onChange={setC} />
      <input className="range" type="range" min={50} max={300} step={5} value={c} aria-label="Temperatura en grados" onChange={(e) => setC(Number(e.target.value))} />
      <div className="grid-3 num">
        <div className="panel">
          <div className="conv-out">{Math.round(cToF(c))}</div>
          <span className="small muted">°F</span>
        </div>
        <div className="panel">
          <div className="conv-out">{gasMark(c)}</div>
          <span className="small muted">gas</span>
        </div>
        <div className="panel">
          <div className="conv-out">{c - 20}</div>
          <span className="small muted">°C con ventilador</span>
        </div>
      </div>
      <h2 className="h-sec">De Fahrenheit</h2>
      <table className="result-table">
        <tbody>
          {[325, 350, 375, 400, 425, 450, 500].map((f) => (
            <tr key={f}>
              <td>{f} °F</td>
              <td>
                <b>{Math.round(fToC(f))} °C</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Yeast() {
  const [fresh, setFresh] = useState(25)
  return (
    <div className="stack" style={css({ '--gap': '16px' })}>
      <NumberField label="Levadura fresca" suffix="g" value={fresh} step={1} onChange={setFresh} hint="Un cubito de levadura fresca suele pesar 25 g." />
      <table className="result-table">
        <thead>
          <tr>
            <th scope="col">Equivale a</th>
            <th scope="col">Gramos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Levadura seca activa</td>
            <td>
              <b>{fmtNum(round(fresh * 0.4, 1))}</b>
            </td>
          </tr>
          <tr>
            <td>Levadura instantánea</td>
            <td>
              <b>{fmtNum(round(fresh * 0.33, 1))}</b>
            </td>
          </tr>
          <tr>
            <td>Masa madre al 100 % (aprox.)</td>
            <td>
              <b>{fmtNum(Math.round(fresh * 8))}</b>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">
        Con masa madre, resta la mitad de su peso a la harina y la otra mitad al agua de la receta. Y ten paciencia: tarda el triple.
      </p>
    </div>
  )
}
