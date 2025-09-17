import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import './lib/http'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

// Remove splash once React is mounted to avoid white flashes on refresh
const splash = document.getElementById('app-splash');
if (splash) {
  // Fade out for a smoother transition
  splash.style.transition = 'opacity .25s ease';
  splash.style.opacity = '0';
  window.setTimeout(() => splash.parentElement?.removeChild(splash), 300);
}
