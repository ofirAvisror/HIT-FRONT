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
  MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';

/**
 * Header component
 * @param {Object} props - Component props
 * @param {function} props.onMenuClick - Function to handle menu click
 * @param {number} [props.notificationCount=0] - Number of notifications
 */
export default function Header({ onMenuClick, notificationCount = 0 }) {
  const { mode, toggleMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [languageMenuAnchor, setLanguageMenuAnchor] = React.useState(null);

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

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
          <Tooltip title={notificationCount > 0 ? t('header.notifications', { count: notificationCount }) : t('header.noNotifications')}>
            <IconButton color="inherit">
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={t('header.switchTo', { mode: mode === 'light' ? 'dark' : 'light' })}>
            <IconButton onClick={toggleMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
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
              }}
            >
              🇺🇸 English
            </MenuItem>
            <MenuItem 
              onClick={() => handleLanguageChange('he')} 
              selected={i18n.language === 'he'}
              sx={{
                fontWeight: i18n.language === 'he' ? 600 : 400,
              }}
            >
              🇮🇱 עברית
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

