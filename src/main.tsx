import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router.tsx'
import { registerSW } from 'virtual:pwa-register'
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt.tsx'

registerSW({
  immediate: true,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
    <PWAInstallPrompt />
  </StrictMode>,
);
