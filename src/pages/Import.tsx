import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardPaste, FileUp, KeyRound, Sparkles, Wand2 } from 'lucide-react'
import { useRoast, useToast } from '../components/ui'
import { importBackup, saveRecipe, useProfile, type Backup } from '../data/repo'
import type { Recipe } from '../data/types'
import { aiExtractRecipe, describeAiError } from '../lib/ai'
import { fetchRecipeFromUrl, findUrl, parseTextRecipe, type RecipeDraft } from '../lib/importers'
import { css } from '../lib/css'

export function ImportPage() {
  const profile = useProfile()
  const navigate = useNavigate()
  const toast = useToast()
  const r = useRoast()
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState<'ai' | 'free' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasKey = !!profile?.anthropicKey

  // Lo que llega desde el menú Compartir (Web Share Target).
  useEffect(() => {
    const raw = sessionStorage.getItem('cc-share')
    if (!raw) return
    sessionStorage.removeItem('cc-share')
    try {
      const s = JSON.parse(raw) as { title: string; text: string; url: string }
      setTitle(s.title)
      setText([s.text, s.url && !s.text.includes(s.url) ? s.url : ''].filter(Boolean).join('\n'))
    } catch {
      /* nada que importar */
    }
  }, [])

  const url = findUrl(text)
  const onlyUrl = !!url && text.trim() === url

  const openDraft = (draft: RecipeDraft) => {
    toast(r('importOk'))
    navigate('/recetas/nueva', { state: { draft } })
  }

  const runAi = async () => {
    if (!profile?.anthropicKey) return
    setBusy('ai')
    setError(null)
    try {
      const res = await aiExtractRecipe(profile.anthropicKey, { text: onlyUrl ? undefined : text, url, title: title || undefined })
      if (res.draft) openDraft(res.draft)
      else setError(res.reason ?? r('importFail'))
    } catch (e) {
      setError(describeAiError(e))
    } finally {
      setBusy(null)
    }
  }

  const runFree = async () => {
    setBusy('free')
    setError(null)
    try {
      if (url) {
        try {
          const d = await fetchRecipeFromUrl(url)
          if (d) return openDraft(d)
        } catch {
          /* CORS o web sin datos: seguimos con el texto */
        }
        if (onlyUrl) {
          setError(
            /tiktok|instagram|youtu|facebook/i.test(url)
              ? 'Las redes no dejan leer sus vídeos desde el navegador. Pega también la descripción del vídeo, o usa la IA.'
              : 'Esa web no deja leer la receta desde aquí. Copia el texto de la receta y pégalo, o usa la IA.',
          )
          return
        }
      }
      const d = parseTextRecipe(text.replace(url ?? '', ''), title)
      if (!d.ingredients.length) {
        setError('No he encontrado ingredientes con cantidades. Pega la lista con sus medidas (por ejemplo «500 g harina») o usa la IA.')
        return
      }
      openDraft({ ...d, sourceUrl: url })
    } finally {
      setBusy(null)
    }
  }

  const importFile = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as Partial<Backup> & { recipes?: Recipe[] }
      if (data.app !== 'counter-chef' || !Array.isArray(data.recipes)) throw new Error('formato')
      if (data.logs || data.friends) {
        const res = await importBackup(data as Backup)
        toast(`Copia restaurada: ${res.recipes} recetas y ${res.logs} entradas del diario.`)
        navigate('/recetas')
      } else if (data.recipes.length === 1) {
        const saved = await saveRecipe({ ...data.recipes[0], id: undefined, createdAt: undefined })
        toast(r('importOk'))
        navigate(`/recetas/${saved.id}`)
      } else {
        for (const rec of data.recipes) await saveRecipe({ ...rec, id: undefined, createdAt: undefined })
        toast(`${data.recipes.length} recetas importadas.`)
        navigate('/recetas')
      }
    } catch {
      setError('Ese archivo no es de Counter-Chef. Ni de nada que yo conozca.')
    }
  }

  return (
    <div className="stack" style={css({ '--gap': '16px' })}>
      <h1 className="h-page">Importar</h1>
      <p className="lede">Pega un enlace de una web de recetas, la descripción de un TikTok o Instagram, o una receta de tus notas.</p>

      <label className="field">
        <span className="label">Enlace o texto</span>
        <textarea
          className="textarea"
          style={{ minHeight: 180 }}
          placeholder={'https://…\n\no\n\nPizza rápida\nIngredientes:\n- 500 g harina\n- 300 ml agua…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="row wrap" style={css({ '--gap': '8px' })}>
        <button
          className="btn btn--sm"
          onClick={async () => {
            try {
              setText(await navigator.clipboard.readText())
            } catch {
              toast('El navegador no deja leer el portapapeles. Mantén pulsado y pega.')
            }
          }}
        >
          <ClipboardPaste size={15} aria-hidden /> Pegar
        </button>
        <label className="btn btn--sm">
          <FileUp size={15} aria-hidden /> Archivo .json
          <input
            className="sr-only"
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importFile(f)
            }}
          />
        </label>
      </div>
      <label className="field">
        <span className="label">Título (opcional)</span>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Si lo dejas vacío, lo adivino" />
      </label>

      {error && (
        <p role="alert" className="panel" style={{ borderColor: 'var(--bomba)', background: 'var(--bomba-soft)' }}>
          {error}
        </p>
      )}

      <div className="stack" style={css({ '--gap': '10px' })}>
        {hasKey ? (
          <button className="btn btn--primary btn--lg btn--block" disabled={!text.trim() || !!busy} onClick={runAi}>
            <Sparkles size={18} aria-hidden /> {busy === 'ai' ? 'Leyendo la receta…' : 'Importar con IA'}
          </button>
        ) : (
          <Link to="/perfil#ia" className="panel row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <KeyRound size={20} aria-hidden />
            <span className="grow small">
              <b>Activa la IA</b> para sacar recetas de vídeos y webs complicadas. Pon tu clave de Claude en Perfil.
            </span>
          </Link>
        )}
        <button className={hasKey ? 'btn btn--block' : 'btn btn--primary btn--lg btn--block'} disabled={!text.trim() || !!busy} onClick={runFree}>
          <Wand2 size={18} aria-hidden /> {busy === 'free' ? 'Analizando…' : hasKey ? 'Importar sin IA' : 'Importar'}
        </button>
      </div>

      <section className="section panel panel--flat stack" style={css({ '--gap': '10px' })}>
        <h2 className="h-sec">Desde TikTok, Instagram o Notas</h2>
        <p className="small">
          <b>Android:</b> instala la app (menú del navegador → «Instalar») y luego, en el vídeo o la nota, pulsa <b>Compartir → Counter-Chef</b>. Llega directo aquí.
        </p>
        <p className="small">
          <b>iPhone:</b> pulsa Compartir → «Copiar enlace» (y si puedes, copia también la descripción) y pégalo aquí. iOS todavía no deja a las webs aparecer en el menú Compartir.
        </p>
        <p className="small muted">Antes de guardar siempre podrás revisar y corregir lo importado.</p>
      </section>
    </div>
  )
}
