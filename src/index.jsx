/**
 * index.jsx - Entry point for the React application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA support
// Register in production build, but also allow in development for testing
if ('serviceWorker' in navigator) {
  // Register immediately, don't wait for load event
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(function(registration) {
      console.log('[PWA] Service Worker registered successfully:', registration.scope);
      console.log('[PWA] Service Worker state:', registration.active?.state || 'installing');
      
      // Check if service worker is already active
      if (registration.active) {
        console.log('[PWA] Service Worker is active');
      }
      
      // Check for updates
      registration.addEventListener('updatefound', function() {
        console.log('[PWA] Update found, new service worker installing...');
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', function() {
            console.log('[PWA] New service worker state:', newWorker.state);
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[PWA] New service worker available. Please refresh the page.');
              // Optionally show a notification to the user
              if (window.confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      // Periodic update check (every hour)
      setInterval(function() {
        registration.update();
      }, 3600000);
    })
    .catch(function(error) {
      console.error('[PWA] Service Worker registration failed:', error);
      console.error('[PWA] Error details:', {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        protocol: window.location.protocol
      });
    });
  
  // Handle service worker updates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
} else {
  console.warn('[PWA] Service Workers are not supported in this browser');
}



