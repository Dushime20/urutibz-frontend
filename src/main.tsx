import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import './lib/http'

// System scaling detection and adjustment
const detectAndAdjustScaling = () => {
  const devicePixelRatio = window.devicePixelRatio;
  
  // Detect Windows scaling based on device pixel ratio and screen dimensions
  let scalingFactor = 1;
  let scalingLevel = 'normal';
  
  if (devicePixelRatio >= 1.25) {
    scalingFactor = 0.8; // Compensate for 125% scaling
    scalingLevel = '125%';
  } else if (devicePixelRatio >= 1.5) {
    scalingFactor = 0.67; // Compensate for 150% scaling
    scalingLevel = '150%';
  } else if (devicePixelRatio >= 2) {
    scalingFactor = 0.5; // Compensate for 200% scaling
    scalingLevel = '200%';
  }
  
  // Apply scaling adjustments
  if (scalingFactor !== 1) {
    document.documentElement.style.setProperty('--scaling-factor', scalingFactor.toString());
    document.documentElement.style.setProperty('--scaling-level', scalingLevel);
    document.documentElement.classList.add('scaled-ui');
    
    // Adjust base font size
    const baseFontSize = 16 * scalingFactor;
    document.documentElement.style.fontSize = `${baseFontSize}px`;
    
    console.log(`🖥️ System scaling detected: ${scalingLevel} (${devicePixelRatio}x)`);
    console.log(`📏 Applied scaling factor: ${scalingFactor}`);
  }
};

// Run scaling detection after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectAndAdjustScaling);
} else {
  detectAndAdjustScaling();
}

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
