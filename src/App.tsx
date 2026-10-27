import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { ToastProvider } from './components/ui'
import { useProfile } from './data/repo'
import { Home } from './pages/Home'
import { Recipes } from './pages/Recipes'
import { RecipeDetail } from './pages/RecipeDetail'
import { RecipeEdit } from './pages/RecipeEdit'
import { CookMode } from './pages/CookMode'
import { Tools } from './pages/Tools'
import { DoughCalc } from './pages/DoughCalc'
import { Converter } from './pages/Converter'
import { Diary } from './pages/Diary'
import { ImportPage } from './pages/Import'
import { Crew } from './pages/Crew'
import { ProfilePage } from './pages/Profile'
import { SharedRecipePage, SharedChallengePage, SharedResponsePage } from './pages/Shared'
import { NotFound } from './pages/NotFound'

function ThemeSync() {
  const profile = useProfile()
  useEffect(() => {
    const t = profile?.theme ?? 'auto'
    if (t === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', t)
  }, [profile?.theme])
  return null
}

export function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <ThemeSync />
        <Routes>
          <Route path="/recetas/:id/cocinar" element={<CookMode />} />
          <Route
            path="*"
            element={
              <Shell>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/recetas" element={<Recipes />} />
                  <Route path="/recetas/nueva" element={<RecipeEdit />} />
                  <Route path="/recetas/:id" element={<RecipeDetail />} />
                  <Route path="/recetas/:id/editar" element={<RecipeEdit />} />
                  <Route path="/herramientas" element={<Tools />} />
                  <Route path="/herramientas/masa" element={<DoughCalc />} />
                  <Route path="/herramientas/convertir" element={<Converter />} />
                  <Route path="/diario" element={<Diary />} />
                  <Route path="/importar" element={<ImportPage />} />
                  <Route path="/pandilla" element={<Crew />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/r/:data" element={<SharedRecipePage />} />
                  <Route path="/reto/:data" element={<SharedChallengePage />} />
                  <Route path="/respuesta/:data" element={<SharedResponsePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Shell>
            }
          />
        </Routes>
      </ToastProvider>
    </HashRouter>
  )
}
