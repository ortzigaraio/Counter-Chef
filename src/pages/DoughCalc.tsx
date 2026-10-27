import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Save } from 'lucide-react'
import { NumberField, useRoast } from '../components/ui'
import { computeDough, DEFAULT_DOUGH, DOUGH_PRESETS, YEAST_LABEL, type DoughInput, type Preferment, type YeastType } from '../lib/dough'
import { emptyDraft } from '../lib/importers'
import { uid } from '../lib/id'
import { fmtNum, round } from '../lib/units'
import { css } from '../lib/css'

const KEY = 'cc-dough'

const g = (n: number) => (n < 10 ? fmtNum(round(n, 1)) : fmtNum(Math.round(n)))

export function DoughCalc() {
  const navigate = useNavigate()
  const r = useRoast()
  const [preset, setPreset] = useState('napo')
  const [inp, setInp] = useState<DoughInput>(() => {
    try {
      return { ...DEFAULT_DOUGH, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
    } catch {
      return DEFAULT_DOUGH
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(inp))
    } catch {
      /* modo privado */
    }
  }, [inp])

  const res = useMemo(() => computeDough(inp), [inp])
  const set = (p: Partial<DoughInput>) => setInp((x) => ({ ...x, ...p }))
  const isPizza = inp.balls > 1 || inp.ballWeight < 500

  const saveAsRecipe = () => {
    const pre = res.pre
    const lines = (pre ? res.main.slice(1) : res.main).map((l) => ({ id: uid(), qty: round(l.grams, l.grams < 10 ? 1 : 0), unit: 'g', name: l.name.replace(' (resto)', ''), isFlour: l.name.startsWith('Harina') || undefined }))
    const preLines = pre?.map((l) => ({ id: uid(), qty: round(l.grams, l.grams < 10 ? 2 : 0), unit: 'g', name: `${l.name} (${inp.preferment})`, isFlour: l.name === 'Harina' || undefined })) ?? []
    const steps = [
      ...(pre ? [`Prepara la ${inp.preferment}: mezcla su harina, agua y levadura y deja fermentar 12–16 h a 18–20 °C.`] : []),
      'Disuelve la levadura en el agua (reserva un poco de agua para el final).',
      'Añade la harina poco a poco y mezcla hasta que no quede harina seca. Reposa 20 min.',
      'Añade la sal y amasa 10–15 min hasta que la masa esté lisa.',
      ...(inp.oil > 0 ? ['Incorpora el aceite al final del amasado.'] : []),
      `Fermenta en bloque y después divide en ${inp.balls} ${isPizza ? 'bolas' : 'piezas'} de ${inp.ballWeight} g.`,
      `Fermentación total: ${inp.hours} h a ${inp.tempC} °C.`,
    ]
    navigate('/recetas/nueva', {
      state: {
        draft: {
          ...emptyDraft(),
          title: `Masa ${DOUGH_PRESETS.find((p) => p.id === preset)?.label ?? ''} · ${inp.hydration} %`.replace('  ', ' '),
          category: isPizza ? 'pizza' : 'panaderia',
          servings: inp.balls,
          servingsLabel: isPizza ? 'bolas' : 'piezas',
          ingredients: [...preLines, ...lines],
          steps,
          tags: ['masa', `${inp.hydration}%`],
          notes: `Calculada con Counter-Chef: ${inp.hydration} % de hidratación, ${inp.salt} % de sal, ${fmtNum(round(res.yeastPct, 3))} % de ${YEAST_LABEL[inp.yeast].toLowerCase()}.`,
        },
      },
    })
  }

  return (
    <>
      <h1 className="h-page">Masa</h1>
      <div className="chips" role="group" aria-label="Plantillas">
        {DOUGH_PRESETS.map((p) => (
          <button
            key={p.id}
            className="chip"
            aria-pressed={preset === p.id}
            onClick={() => {
              setPreset(p.id)
              set({ balls: inp.balls, ...p.input })
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <section className="panel section" style={{ marginTop: 18 }}>
        <div className="row between wrap" style={css({ '--gap': '16px' })}>
          <div>
            <div className="dough-total num" aria-live="polite">
              {fmtNum(Math.round(res.total))} g
            </div>
            <div className="small muted num">
              {inp.balls} × {inp.ballWeight} g · harina {fmtNum(Math.round(res.flour))} g · agua {fmtNum(Math.round(res.water))} g
            </div>
          </div>
          <div className="stepper" aria-label="Número de bolas">
            <button aria-label="Una bola menos" onClick={() => set({ balls: Math.max(1, inp.balls - 1) })}>
              <Minus size={18} />
            </button>
            <output className="num">
              {inp.balls} <span className="small muted">{isPizza ? 'bolas' : 'piezas'}</span>
            </output>
            <button aria-label="Una bola más" onClick={() => set({ balls: inp.balls + 1 })}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        <table className="result-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th scope="col">Ingrediente</th>
              <th scope="col">Gramos</th>
              <th scope="col">% harina</th>
            </tr>
          </thead>
          <tbody>
            {res.main.map((l) => (
              <tr key={l.name}>
                <td>{l.name}</td>
                <td>
                  <b>{g(l.grams)}</b>
                </td>
                <td className="faint">{l.pct ? `${fmtNum(round(l.pct, 2))} %` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {res.pre && (
          <>
            <h3 className="h-sec" style={{ marginTop: 18, fontSize: '1.05rem' }}>
              {inp.preferment === 'poolish' ? 'Poolish' : 'Biga'} (la víspera)
            </h3>
            <table className="result-table">
              <tbody>
                {res.pre.map((l) => (
                  <tr key={l.name}>
                    <td>{l.name}</td>
                    <td>
                      <b>{l.grams < 1 ? fmtNum(round(l.grams, 2)) : g(l.grams)}</b>
                    </td>
                    <td className="faint">{fmtNum(round(l.pct, 2))} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <button className="btn btn--primary btn--block" style={{ marginTop: 16 }} onClick={saveAsRecipe}>
          <Save size={18} aria-hidden /> Guardar como receta
        </button>
      </section>

      <section className="section stack" style={css({ '--gap': '16px' })}>
        <div className="grid-2">
          <NumberField label="Peso por bola" suffix="g" value={inp.ballWeight} step={5} onChange={(n) => set({ ballWeight: n })} />
          <NumberField label="Hidratación" suffix="%" value={inp.hydration} step={1} onChange={(n) => set({ hydration: n })} hint={inp.hydration > 75 ? 'Masa pegajosa: manos mojadas.' : undefined} />
          <NumberField label="Sal" suffix="%" value={inp.salt} step={0.1} onChange={(n) => set({ salt: n })} />
          <NumberField label="Aceite" suffix="%" value={inp.oil} step={0.5} onChange={(n) => set({ oil: n })} />
          <NumberField label="Azúcar" suffix="%" value={inp.sugar} step={0.5} onChange={(n) => set({ sugar: n })} />
        </div>
        <input className="range" type="range" min={50} max={90} value={inp.hydration} aria-label="Hidratación" onChange={(e) => set({ hydration: Number(e.target.value) })} />

        <div className="field">
          <span className="label">Levadura</span>
          <div className="seg" role="group" aria-label="Tipo de levadura">
            {(Object.keys(YEAST_LABEL) as YeastType[]).map((y) => (
              <button key={y} aria-pressed={inp.yeast === y} onClick={() => set({ yeast: y })}>
                {{ fresca: 'Fresca', seca: 'Seca', instantanea: 'Instantánea', 'masa-madre': 'Masa madre' }[y]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid-2">
          <NumberField label="Fermentación total" suffix="h" value={inp.hours} step={1} min={1} onChange={(n) => set({ hours: n })} />
          <NumberField label="Temperatura" suffix="°C" value={inp.tempC} step={1} onChange={(n) => set({ tempC: n })} hint={inp.tempC <= 6 ? 'Nevera: fermentación lenta.' : undefined} />
        </div>
        <p className="small muted num">
          Levadura estimada: <b>{fmtNum(round(res.yeastPct, 3))} %</b> sobre harina. Es una estimación; tu cocina, tu harina y tu paciencia mandan.
        </p>

        {inp.yeast !== 'masa-madre' && (
          <div className="field">
            <span className="label">Prefermento</span>
            <div className="seg" role="group" aria-label="Prefermento">
              {(['directo', 'poolish', 'biga'] as Preferment[]).map((p) => (
                <button key={p} aria-pressed={inp.preferment === p} onClick={() => set({ preferment: p })}>
                  {p === 'directo' ? 'Directo' : p === 'poolish' ? 'Poolish' : 'Biga'}
                </button>
              ))}
            </div>
            {inp.preferment !== 'directo' && (
              <NumberField label="Harina en el prefermento" suffix="%" value={inp.prefermentPct} step={5} onChange={(n) => set({ prefermentPct: Math.min(100, n) })} />
            )}
          </div>
        )}
        <p className="small faint">{r('dough')}</p>
      </section>
    </>
  )
}
