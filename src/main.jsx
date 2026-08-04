import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isLite } from './animation/device-queries'

/* Ditandai SEBELUM render, bukan di dalam useEffect. Efek berat yang sempat
   tergambar satu frame lalu dicabut justru lebih buruk daripada tidak pernah
   ada: yang terlihat pengunjung adalah kedipan. */
if (isLite()) document.documentElement.classList.add('is-lite')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
