/**
 * StatCard.tsx - Statistics card component
 */

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
}

/**
 * StatCard component
 */
export default function StatCard({ title, value, change, icon, color = '#6366f1' }: StatCardProps): JSX.Element {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        boxShadow: 2,
        bgcolor: 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
              {value}
            </Typography>
          </Box>
          {icon && (
            <Box sx={{ color: color, opacity: 0.8 }}>
              {icon}
            </Box>
          )}
        </Box>
        
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            {isPositive ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: isPositive ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {Math.abs(change).toFixed(1)}% {isPositive ? 'increase' : 'decrease'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

