import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QuizApp } from '@/pages/Quiz/QuizApp';
import '@/styles/quiz.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QuizApp />
  </StrictMode>
);
