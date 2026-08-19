import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import { ContentProvider } from './context/ContentContext'
import './index.css'

// L'administration n'est chargée que si l'on visite /admin :
// le bundle du portfolio public reste léger.
const AdminApp = lazy(() => import('./admin/AdminApp'))

const container = document.getElementById('root')
if (!container) throw new Error("Élément #root introuvable dans index.html")

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ContentProvider>
              <App />
            </ContentProvider>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="min-h-screen bg-night-950" />}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
