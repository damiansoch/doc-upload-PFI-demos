import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import OverviewPage from './overview/OverviewPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OverviewPage />
  </StrictMode>,
)
