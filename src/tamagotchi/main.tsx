import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { TamagotchiApp } from './TamagotchiApp';

createRoot(document.getElementById('tamagotchi-root')!).render(
  <StrictMode>
    <TamagotchiApp />
  </StrictMode>,
);
