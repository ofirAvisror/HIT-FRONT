/**
 * Sidebar.jsx - Sidebar navigation component
 */

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useMediaQuery,
  useTheme as useMUITheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FilterListIcon from '@mui/icons-material/FilterList';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 280;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'add-cost', label: 'Add Cost', icon: <AddCircleOutlineIcon /> },
  { id: 'report', label: 'Report', icon: <AssessmentIcon /> },
  { id: 'pie-chart', label: 'Pie Chart', icon: <PieChartIcon /> },
  { id: 'bar-chart', label: 'Bar Chart', icon: <BarChartIcon /> },
  { id: 'categories', label: 'Categories', icon: <CategoryIcon /> },
  { id: 'budget', label: 'Budget', icon: <AccountBalanceIcon /> },
  { id: 'filters', label: 'Filters', icon: <FilterListIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

/**
 * Sidebar component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether sidebar is open
 * @param {function} props.onClose - Function to close sidebar
 * @param {string} props.currentView - Current active view
 * @param {function} props.onViewChange - Function to change view
 */
export default function Sidebar({ open, onClose, currentView, onViewChange }) {
  const muiTheme = useMUITheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const handleItemClick = function(itemId) {
    onViewChange(itemId);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <Box>
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          💰 Cost Manager
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Manage your expenses
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={currentView === item.id}
              onClick={() => handleItemClick(item.id)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: currentView === item.id ? 'primary.contrastText' : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: currentView === item.id ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export { drawerWidth };

