/**
 * ThemeContext.tsx - Context for managing theme (light/dark mode)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, Theme } from '@mui/material/styles';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleMode: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component
 * Manages light/dark mode theme
 */
export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(function() {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleMode = function(): void {
    setMode(function(prevMode) {
      return prevMode === 'light' ? 'dark' : 'light';
    });
  };

  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ec4899',
        light: '#f472b6',
        dark: '#db2777',
      },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
        secondary: mode === 'dark' ? '#cbd5e1' : '#64748b',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            minHeight: 64,
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, theme }}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

