import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Impressum } from '@/pages/Legal/Impressum';
import '@/styles/landing.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Impressum />
  </StrictMode>
);
