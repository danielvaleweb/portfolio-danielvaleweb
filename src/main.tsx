import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initRecFavicon } from './utils/recFavicon.ts';

// Inicializa o indicador animado de REC no favicon da aba do navegador
initRecFavicon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
