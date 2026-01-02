/**
 * Settings.tsx - Component for application settings
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import toast from 'react-hot-toast';
// import SettingsIcon from '@mui/icons-material/Settings';
// import SaveIcon from '@mui/icons-material/Save';

/**
 * Settings component
 * Allows users to configure the exchange rate URL
 */
export default function Settings(): JSX.Element {
  const [exchangeRateUrl, setExchangeRateUrl] = useState<string>('./exchange-rates.json');

  /**
   * Loads the current exchange rate URL from localStorage on mount
   */
  useEffect(function() {
    const savedUrl = localStorage.getItem('exchangeRateUrl');
    if (savedUrl) {
      setExchangeRateUrl(savedUrl);
    }
  }, []);

  /**
   * Handles saving the exchange rate URL
   */
  const handleSave = function(): void {
    localStorage.setItem('exchangeRateUrl', exchangeRateUrl);
    toast.success('Settings saved successfully!');
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 700, 
        mx: 'auto', 
        borderRadius: 3,
        boxShadow: 4,
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {/* <SettingsIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} /> */}
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            ⚙️ Settings
          </Typography>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            label="Exchange Rate URL"
            value={exchangeRateUrl}
            onChange={(e) => setExchangeRateUrl(e.target.value)}
            fullWidth
            margin="normal"
            helperText="URL to fetch currency exchange rates. Should return JSON with USD, GBP, EURO, and ILS rates."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            // startIcon={<SaveIcon />}
            fullWidth
            size="large"
            sx={{ 
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Save Settings
          </Button>
        </Paper>
      </CardContent>
    </Card>
  );
}

