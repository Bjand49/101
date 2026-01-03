import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import MainPage from './pages/main.tsx'
import GamePage from './pages/game.tsx'
import TestGamePage from './pages/testgame.tsx'
import { LoadingOverlay } from './components/LoadingOverlay'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LoadingOverlay />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/test" element={<TestGamePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
