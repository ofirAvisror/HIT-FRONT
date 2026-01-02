/**
 * Layout.tsx - Main layout component with Header and Sidebar
 */

import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar, { drawerWidth } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  notificationCount?: number;
}

/**
 * Layout component
 */
export default function Layout({ 
  children, 
  currentView, 
  onViewChange,
  notificationCount = 0 
}: LayoutProps): JSX.Element {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleMenuClick = function(): void {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = function(): void {
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

