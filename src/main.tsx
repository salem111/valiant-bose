// Ensure window.fetch has a setter to avoid "Cannot set property fetch of #<Window> which has only a getter"
try {
  let activeFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    get() {
      return activeFetch;
    },
    set(fn) {
      activeFetch = fn;
    },
  });
} catch (e) {
  // Ignored if already defined or restricted
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { I18nProvider } from './lib/i18n.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
