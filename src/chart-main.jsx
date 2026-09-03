import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChartOverviewPage from './chart/ChartOverviewPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChartOverviewPage />
  </StrictMode>,
)
