import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@frontend/src/App.tsx';
import { ClerkProvider } from '@clerk/clerk-react';
import '@frontend/src/globals.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
