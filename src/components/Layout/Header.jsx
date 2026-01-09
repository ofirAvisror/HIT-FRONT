/**
 * Header.jsx - Application header component
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import GetAppIcon from '@mui/icons-material/GetApp';
import { format } from 'date-fns';
import US from 'country-flag-icons/react/3x2/US';
import IL from 'country-flag-icons/react/3x2/IL';
import ES from 'country-flag-icons/react/3x2/ES';

/**
 * Header component
 * @param {Object} props - Component props
 * @param {function} props.onMenuClick - Function to handle menu click
 * @param {number} [props.notificationCount=0] - Number of notifications
 */
export default function Header({ onMenuClick, notificationCount = 0 }) {
  const { mode, toggleMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [languageMenuAnchor, setLanguageMenuAnchor] = React.useState(null);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = React.useState(null);
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [isInstalled, setIsInstalled] = React.useState(false);

  const handleLanguageMenuOpen = function(event) {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = function() {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = function(language) {
    i18n.changeLanguage(language);
    handleLanguageMenuClose();
  };

  const handleNotificationsMenuOpen = function(event) {
    setNotificationsMenuAnchor(event.currentTarget);
  };

  const handleNotificationsMenuClose = function() {
    setNotificationsMenuAnchor(null);
  };

  const handleMarkAsRead = function(notificationId) {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = function() {
    markAllAsRead();
  };

  const handleClearNotification = function(notificationId) {
    clearNotification(notificationId);
  };

  // Check if app is already installed
  React.useEffect(function() {
    // Check if running as standalone (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);
    
    // Debug logging
    console.log('[PWA] Installation status:', {
      isStandalone,
      displayMode: window.matchMedia('(display-mode: standalone)').matches,
      navigatorStandalone: window.navigator.standalone,
      referrer: document.referrer,
      isProduction: process.env.NODE_ENV === 'production',
      hasServiceWorker: 'serviceWorker' in navigator
    });
  }, []);

  // Listen for beforeinstallprompt event
  React.useEffect(function() {
    const handleBeforeInstallPrompt = function(e) {
      console.log('[PWA] ✅ beforeinstallprompt event fired!');
      console.log('[PWA] Event details:', {
        platforms: e.platforms,
        userChoice: e.userChoice
      });
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };

    // Comprehensive PWA installability check
    const checkPWAInstallability = async function() {
      console.log('[PWA] 🔍 Starting comprehensive installability check...');
      
      const checks = {
        isHTTPS: window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        hasManifest: document.querySelector('link[rel="manifest"]') !== null,
        hasServiceWorker: 'serviceWorker' in navigator,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Check manifest
      console.log('[PWA] 📄 Checking manifest...');
      try {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
          const manifestUrl = manifestLink.href;
          console.log('[PWA] 📄 Manifest link found:', manifestUrl);
          
          const response = await fetch(manifestUrl);
          console.log('[PWA] 📄 Manifest fetch response:', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type')
          });
          
          if (response.ok) {
            const manifest = await response.json();
            console.log('[PWA] 📄 Manifest content:', manifest);
            
            checks.manifestValid = true;
            checks.manifestIcons = manifest.icons?.length || 0;
            checks.manifestName = manifest.name;
            checks.manifestShortName = manifest.short_name;
            checks.manifestStartUrl = manifest.start_url;
            checks.manifestDisplay = manifest.display;
            checks.manifestThemeColor = manifest.theme_color;
            
            // Validate icons
            if (manifest.icons && manifest.icons.length > 0) {
              console.log('[PWA] 🖼️ Validating icons...');
              checks.iconValidation = [];
              
              for (let i = 0; i < manifest.icons.length; i++) {
                const icon = manifest.icons[i];
                const iconInfo = {
                  index: i,
                  src: icon.src,
                  sizes: icon.sizes,
                  type: icon.type,
                  purpose: icon.purpose
                };
                
                try {
                  // Try to fetch the icon
                  const iconUrl = icon.src.startsWith('/') ? icon.src : new URL(icon.src, window.location.origin).pathname;
                  console.log(`[PWA] 🖼️ Checking icon ${i + 1}:`, iconUrl);
                  
                  const iconResponse = await fetch(iconUrl);
                  iconInfo.exists = iconResponse.ok;
                  iconInfo.status = iconResponse.status;
                  iconInfo.contentType = iconResponse.headers.get('content-type');
                  iconInfo.contentLength = iconResponse.headers.get('content-length');
                  
                  if (iconResponse.ok) {
                    // Try to create an image to check dimensions
                    const blob = await iconResponse.blob();
                    iconInfo.blobSize = blob.size;
                    
                    const img = new Image();
                    await new Promise((resolve, reject) => {
                      img.onload = resolve;
                      img.onerror = reject;
                      img.src = URL.createObjectURL(blob);
                    });
                    
                    iconInfo.actualWidth = img.width;
                    iconInfo.actualHeight = img.height;
                    iconInfo.expectedSizes = icon.sizes;
                    
                    // Check if sizes match
                    const expectedSize = icon.sizes.split('x')[0];
                    if (iconInfo.actualWidth !== parseInt(expectedSize) || iconInfo.actualHeight !== parseInt(expectedSize)) {
                      iconInfo.sizeMismatch = true;
                      console.warn(`[PWA] ⚠️ Icon size mismatch for ${icon.src}:`, {
                        expected: `${expectedSize}x${expectedSize}`,
                        actual: `${iconInfo.actualWidth}x${iconInfo.actualHeight}`
                      });
                    } else {
                      iconInfo.sizeMismatch = false;
                      console.log(`[PWA] ✅ Icon ${icon.src} size is correct`);
                    }
                    
                    URL.revokeObjectURL(img.src);
                  } else {
                    console.error(`[PWA] ❌ Icon ${icon.src} not found:`, iconResponse.status);
                  }
                } catch (iconError) {
                  iconInfo.error = iconError.message;
                  console.error(`[PWA] ❌ Error checking icon ${icon.src}:`, iconError);
                }
                
                checks.iconValidation.push(iconInfo);
              }
            } else {
              console.warn('[PWA] ⚠️ No icons found in manifest');
            }
          } else {
            checks.manifestValid = false;
            checks.manifestError = `HTTP ${response.status}`;
            console.error('[PWA] ❌ Manifest fetch failed:', response.status, response.statusText);
          }
        } else {
          checks.manifestValid = false;
          checks.manifestError = 'Manifest link not found in HTML';
          console.error('[PWA] ❌ Manifest link not found in document');
        }
      } catch (error) {
        checks.manifestError = error.message;
        console.error('[PWA] ❌ Error checking manifest:', error);
      }

      // Check service worker
      console.log('[PWA] 🔧 Checking Service Worker...');
      if (checks.hasServiceWorker) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          checks.serviceWorkerRegistered = !!registration;
          if (registration) {
            checks.serviceWorkerState = registration.active?.state || registration.installing?.state || registration.waiting?.state || 'unknown';
            checks.serviceWorkerScope = registration.scope;
            checks.serviceWorkerActive = !!registration.active;
            checks.serviceWorkerInstalling = !!registration.installing;
            checks.serviceWorkerWaiting = !!registration.waiting;
            
            console.log('[PWA] 🔧 Service Worker registration found:', {
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
              } : null
            });
          } else {
            console.warn('[PWA] ⚠️ No Service Worker registration found');
          }
          
          // Check controller
          checks.serviceWorkerController = !!navigator.serviceWorker.controller;
          if (navigator.serviceWorker.controller) {
            checks.serviceWorkerControllerState = navigator.serviceWorker.controller.state;
            checks.serviceWorkerControllerScriptURL = navigator.serviceWorker.controller.scriptURL;
            console.log('[PWA] 🎮 Service Worker controller:', {
              state: navigator.serviceWorker.controller.state,
              scriptURL: navigator.serviceWorker.controller.scriptURL
            });
          } else {
            console.warn('[PWA] ⚠️ No Service Worker controller');
          }
        } catch (error) {
          checks.serviceWorkerError = error.message;
          console.error('[PWA] ❌ Error checking Service Worker:', error);
        }
      } else {
        console.warn('[PWA] ⚠️ Service Worker API not supported');
      }

      // Check PWA installability criteria
      console.log('[PWA] 📊 PWA Installability Summary:');
      console.log('[PWA] Installability check:', checks);
      
      // Detailed analysis
      const issues = [];
      if (!checks.isHTTPS) {
        issues.push('Not running on HTTPS (required for PWA)');
      }
      if (!checks.manifestValid) {
        issues.push('Manifest is invalid or not accessible');
      }
      if (!checks.serviceWorkerRegistered) {
        issues.push('Service Worker is not registered');
      }
      if (checks.serviceWorkerRegistered && checks.serviceWorkerState !== 'activated' && checks.serviceWorkerState !== 'activating') {
        issues.push(`Service Worker state is not ready: ${checks.serviceWorkerState}`);
      }
      if (checks.iconValidation && checks.iconValidation.some(icon => icon.sizeMismatch)) {
        issues.push('Some icons have size mismatches');
      }
      if (checks.iconValidation && checks.iconValidation.some(icon => !icon.exists)) {
        issues.push('Some icons are missing');
      }
      
      if (issues.length > 0) {
        console.warn('[PWA] ⚠️ Issues found that may prevent installation:');
        issues.forEach(issue => console.warn(`  - ${issue}`));
      } else {
        console.log('[PWA] ✅ All basic requirements met!');
      }

      // Check if browser supports PWA installation
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isEdge = /Edg/.test(navigator.userAgent);
      const supportsPWA = isChrome || isEdge;
      
      if (!supportsPWA) {
        console.warn('[PWA] ⚠️ Browser may not support PWA installation. Chrome and Edge are recommended.');
      }

      if (!checks.isHTTPS) {
        console.error('[PWA] ❌ Not running on HTTPS - PWA installation requires HTTPS!');
      }

      if (!checks.manifestValid) {
        console.error('[PWA] ❌ Manifest is not valid or not accessible!');
      }

      if (!checks.serviceWorkerRegistered) {
        console.error('[PWA] ❌ Service Worker is not registered!');
      }

      if (checks.isStandalone) {
        console.log('[PWA] ℹ️ App is already installed (running in standalone mode)');
      }
    };

    // Run checks after a short delay to allow everything to load
    setTimeout(checkPWAInstallability, 1000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Log if event doesn't fire after a delay (for debugging)
    const timeout = setTimeout(function() {
      if (!deferredPrompt) {
        console.warn('[PWA] ⚠️ beforeinstallprompt event not fired after 5 seconds.');
        console.warn('[PWA] This is normal if:');
        console.warn('  - The app was already installed');
        console.warn('  - The user dismissed the install prompt before');
        console.warn('  - The browser requires more engagement (visit the site multiple times)');
        console.warn('  - The manifest or service worker has issues');
        console.warn('[PWA] The install button will still work and show instructions if needed.');
      }
    }, 5000);

    return function() {
      clearTimeout(timeout);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async function() {
    if (deferredPrompt) {
      // Show the install prompt using the deferred prompt
      try {
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User response to install prompt:', outcome);
        // Clear the deferredPrompt
        setDeferredPrompt(null);
      } catch (error) {
        console.error('[PWA] Error showing install prompt:', error);
      }
    } else {
      // Try alternative installation methods
      console.log('[PWA] deferredPrompt not available, trying alternative methods');
      
      // Check if app is installable
      if (window.matchMedia('(display-mode: standalone)').matches) {
        alert(t('header.alreadyInstalled') || 'האפליקציה כבר מותקנת');
        return;
      }

      // Try to trigger browser's install UI
      // For Chrome/Edge, we can show instructions
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isEdge = /Edg/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isFirefox = /Firefox/.test(navigator.userAgent);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      let instructions = '';
      
      if (isMobile) {
        if (isChrome || isEdge) {
          instructions = t('header.installInstructionsMobile') || 'להתקנה: לחץ על תפריט הדפדפן (⋮) ובחר "הוסף למסך הבית" או "התקן אפליקציה"';
        } else if (isSafari) {
          instructions = t('header.installInstructionsSafari') || 'להתקנה: לחץ על כפתור השיתוף (□↑) ובחר "הוסף למסך הבית"';
        } else {
          instructions = t('header.installInstructionsGeneric') || 'להתקנה: השתמש בתפריט הדפדפן כדי להוסיף את האפליקציה למסך הבית';
        }
      } else {
        if (isChrome || isEdge) {
          instructions = t('header.installInstructionsDesktop') || 'להתקנה: לחץ על סמל ההתקנה (⊕) בשורת הכתובת או בתפריט הדפדפן (⋮) > "התקן אפליקציה"';
        } else if (isFirefox) {
          instructions = t('header.installInstructionsFirefox') || 'להתקנה: לחץ על סמל ההתקנה בשורת הכתובת או בתפריט הדפדפן';
        } else {
          instructions = t('header.installInstructionsGeneric') || 'להתקנה: השתמש בתפריט הדפדפן כדי להתקין את האפליקציה';
        }
      }

      // Show instructions to user
      alert(instructions);
      
      // Also log for debugging
      console.log('[PWA] Installation instructions:', instructions);
      console.log('[PWA] Browser info:', {
        userAgent: navigator.userAgent,
        isChrome,
        isEdge,
        isSafari,
        isFirefox,
        isMobile,
        hasServiceWorker: 'serviceWorker' in navigator,
        isHTTPS: window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      });
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  // Show notifications sorted by newest first
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label={t('header.openDrawer')}
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <AccountBalanceWalletIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {t('common.costManager')}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* PWA Install Button - Always enabled */}
          {!isInstalled && (
            <Tooltip title={t('header.installApp')}>
              <IconButton 
                color="inherit"
                onClick={handleInstallClick}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <GetAppIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={notificationCount > 0 ? t('header.notifications', { count: notificationCount }) : t('header.noNotifications')}>
            <IconButton 
              color="inherit"
              onClick={handleNotificationsMenuOpen}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationsMenuAnchor}
            open={Boolean(notificationsMenuAnchor)}
            onClose={handleNotificationsMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                width: 400,
                maxHeight: 500,
                mt: 1.5,
              }
            }}
          >
            <Box sx={{ p: 2, pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {t('notifications.title')}
                </Typography>
                {unreadNotifications.length > 0 && (
                  <Button 
                    size="small" 
                    onClick={handleMarkAllAsRead}
                    sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                  >
                    {t('notifications.markAllAsRead')}
                  </Button>
                )}
              </Box>
            </Box>
            <Divider />
            
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {t('notifications.allCaughtUp')}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {sortedNotifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderLeft: notification.read ? 'none' : '3px solid',
                      borderColor: notification.type === 'budget_exceeded' ? 'error.main' : 'warning.main',
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {notification.read ? (
                        <CheckCircleIcon fontSize="small" color="success" />
                      ) : (
                        <NotificationsIcon fontSize="small" color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: notification.read ? 400 : 600,
                              flex: 1,
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Chip
                            label={notification.type === 'budget_exceeded' ? t('common.exceeded') : t('common.warning')}
                            size="small"
                            color={notification.type === 'budget_exceeded' ? 'error' : 'warning'}
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </Box>
                      }
                      secondary={format(notification.timestamp, 'PPp')}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearNotification(notification.id);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </MenuItem>
                ))}
              </Box>
            )}
          </Menu>

          <Tooltip title={t('header.switchTo', { mode: mode === 'light' ? 'dark' : 'light' })}>
            <IconButton 
              onClick={toggleMode} 
              color="inherit"
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={t('header.changeLanguage')}>
            <IconButton 
              onClick={handleLanguageMenuOpen} 
              color="inherit"
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <LanguageIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={languageMenuAnchor}
            open={Boolean(languageMenuAnchor)}
            onClose={handleLanguageMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem 
              onClick={() => handleLanguageChange('en')} 
              selected={i18n.language === 'en'}
              sx={{
                fontWeight: i18n.language === 'en' ? 600 : 400,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              <Box sx={{ mr: 1.5, display: 'inline-flex', alignItems: 'center' }}>
                <US style={{ width: 24, height: 18 }} />
              </Box>
              English
            </MenuItem>
            <MenuItem 
              onClick={() => handleLanguageChange('he')} 
              selected={i18n.language === 'he'}
              sx={{
                fontWeight: i18n.language === 'he' ? 600 : 400,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              <Box sx={{ mr: 1.5, display: 'inline-flex', alignItems: 'center' }}>
                <IL style={{ width: 24, height: 18 }} />
              </Box>
              Hebrew
            </MenuItem>
            <MenuItem 
              onClick={() => handleLanguageChange('es')} 
              selected={i18n.language === 'es'}
              sx={{
                fontWeight: i18n.language === 'es' ? 600 : 400,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              <Box sx={{ mr: 1.5, display: 'inline-flex', alignItems: 'center' }}>
                <ES style={{ width: 24, height: 18 }} />
              </Box>
              Español
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

