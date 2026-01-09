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
console.log('[PWA] 🔍 Starting PWA initialization...');
console.log('[PWA] Environment:', {
  protocol: window.location.protocol,
  hostname: window.location.hostname,
  href: window.location.href,
  isProduction: process.env.NODE_ENV === 'production',
  userAgent: navigator.userAgent
});

if ('serviceWorker' in navigator) {
  console.log('[PWA] ✅ Service Worker API is supported');
  
  // Check existing registrations first
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('[PWA] 📋 Existing Service Worker registrations:', registrations.length);
    registrations.forEach(function(reg, index) {
      console.log(`[PWA] Registration ${index + 1}:`, {
        scope: reg.scope,
        active: reg.active ? {
          state: reg.active.state,
          scriptURL: reg.active.scriptURL
        } : null,
        installing: reg.installing ? {
          state: reg.installing.state,
          scriptURL: reg.installing.scriptURL
        } : null,
        waiting: reg.waiting ? {
          state: reg.waiting.state,
          scriptURL: reg.waiting.scriptURL
        } : null
      });
    });
  }).catch(function(error) {
    console.error('[PWA] ❌ Error getting existing registrations:', error);
  });

  // Check current controller
  if (navigator.serviceWorker.controller) {
    console.log('[PWA] 🎮 Service Worker controller is active:', {
      scriptURL: navigator.serviceWorker.controller.scriptURL,
      state: navigator.serviceWorker.controller.state
    });
  } else {
    console.log('[PWA] ⚠️ No Service Worker controller found');
  }

  // Register immediately, don't wait for load event
  console.log('[PWA] 📝 Attempting to register Service Worker at /sw.js...');
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(function(registration) {
      console.log('[PWA] ✅ Service Worker registered successfully!');
      console.log('[PWA] Registration details:', {
        scope: registration.scope,
        active: registration.active ? {
          state: registration.active.state,
          scriptURL: registration.active.scriptURL
        } : null,
        installing: registration.installing ? {
          state: registration.installing.state,
          scriptURL: registration.installing.scriptURL
        } : null,
        waiting: registration.waiting ? {
          state: registration.waiting.state,
          scriptURL: registration.waiting.scriptURL
        } : null,
        updateViaCache: registration.updateViaCache
      });
      
      // Track state changes
      if (registration.installing) {
        console.log('[PWA] 🔄 Service Worker is installing...');
        registration.installing.addEventListener('statechange', function() {
          console.log('[PWA] 🔄 Service Worker state changed:', {
            state: registration.installing.state,
            scriptURL: registration.installing.scriptURL
          });
        });
      }
      
      if (registration.waiting) {
        console.log('[PWA] ⏳ Service Worker is waiting to activate');
      }
      
      // Check if service worker is already active
      if (registration.active) {
        console.log('[PWA] ✅ Service Worker is active and ready');
      }
      
      // Check for updates
      registration.addEventListener('updatefound', function() {
        console.log('[PWA] 🔄 Update found, new service worker installing...');
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', function() {
            console.log('[PWA] 🔄 New service worker state:', {
              state: newWorker.state,
              scriptURL: newWorker.scriptURL
            });
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[PWA] ⚠️ New service worker available. Please refresh the page.');
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
        console.log('[PWA] 🔄 Checking for Service Worker updates...');
        registration.update().catch(function(error) {
          console.error('[PWA] ❌ Error checking for updates:', error);
        });
      }, 3600000);
    })
    .catch(function(error) {
      console.error('[PWA] ❌ Service Worker registration failed!');
      console.error('[PWA] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        protocol: window.location.protocol,
        swPath: '/sw.js'
      });
      
      // Try to fetch the service worker file to see if it exists
      fetch('/sw.js')
        .then(function(response) {
          console.log('[PWA] 🔍 Service Worker file check:', {
            exists: response.ok,
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type')
          });
        })
        .catch(function(fetchError) {
          console.error('[PWA] ❌ Cannot fetch Service Worker file:', fetchError);
        });
    });
  
  // Handle service worker updates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    console.log('[PWA] 🎮 Service Worker controller changed');
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] 🔄 Reloading page due to controller change...');
      window.location.reload();
    }
  });

  // Listen for service worker messages
  navigator.serviceWorker.addEventListener('message', function(event) {
    console.log('[PWA] 📨 Message from Service Worker:', event.data);
  });

  // Listen for errors
  navigator.serviceWorker.addEventListener('error', function(event) {
    console.error('[PWA] ❌ Service Worker error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
} else {
  console.warn('[PWA] ⚠️ Service Workers are not supported in this browser');
  console.warn('[PWA] Browser info:', {
    userAgent: navigator.userAgent,
    vendor: navigator.vendor,
    platform: navigator.platform
  });
}



