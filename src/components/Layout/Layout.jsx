/**
 * Layout.jsx - Main layout component with Header and Sidebar
 */

import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar, { drawerWidth } from './Sidebar';

/**
 * Layout component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.currentView - Current active view
 * @param {function} props.onViewChange - Function to change view
 * @param {number} [props.notificationCount=0] - Number of notifications
 */
export default function Layout({ 
  children, 
  currentView, 
  onViewChange,
  notificationCount = 0 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleMenuClick = function() {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = function() {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={handleMenuClick} notificationCount={notificationCount} />
      
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        currentView={currentView}
        onViewChange={onViewChange}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

