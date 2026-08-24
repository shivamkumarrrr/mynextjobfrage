import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Datenschutz } from '@/pages/Legal/Datenschutz';
import '@/styles/landing.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Datenschutz />
  </StrictMode>
);
