import React, { createContext, useContext, useState } from 'react';
import { Platform } from 'react-native';

// Define colors
export const colors = {
  primary: {
    50: '#eee6f4',
    100: '#d5c0e6',
    200: '#b995d6',
    300: '#9c69c5',
    400: '#8648b9',
    500: '#6f29ac',
    600: '#5d23a0',
    700: '#4b1c93',
    800: '#3b1487',
    900: '#29096e',
  },
  secondary: {
    50: '#ffeef2',
    100: '#ffd4de',
    200: '#ffb7c5',
    300: '#ff95ab',
    400: '#ff7c98',
    500: '#ff6285',
    600: '#ff4972',
    700: '#ff315f',
    800: '#ff184c',
    900: '#ff0039',
  },
  neutral: {
    50: '#f5f5f5',
    100: '#e9e9e9',
    200: '#d9d9d9',
    300: '#c4c4c4',
    400: '#9d9d9d',
    500: '#7b7b7b',
    600: '#555555',
    700: '#434343',
    800: '#262626',
    900: '#171717',
  },
  success: {
    500: '#10b981',
    700: '#047857',
  },
  warning: {
    500: '#f59e0b',
    700: '#b45309',
  },
  error: {
    500: '#ef4444',
    700: '#b91c1c',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Define spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Define typography
export const typography = {
  fontFamily: {
    english: {
      regular: 'Poppins-Regular',
      medium: 'Poppins-Medium',
      bold: 'Poppins-Bold',
    },
    japanese: {
      regular: 'NotoSansJP-Regular',
      medium: 'NotoSansJP-Medium',
      bold: 'NotoSansJP-Bold',
    },
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

// Define shadow
export const shadow = Platform.select({
  ios: {
    small: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    medium: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    large: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
  },
  android: {
    small: { elevation: 2 },
    medium: { elevation: 4 },
    large: { elevation: 8 },
  },
  web: {
    small: {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    },
    medium: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
    },
    large: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    },
  },
});

// Theme context
type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  theme: {
    colors: typeof colors;
    spacing: typeof spacing;
    typography: typeof typography;
    shadow: typeof shadow;
    background: string;
    text: string;
    card: string;
    cardAlt: string;
    border: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const theme = {
    colors,
    spacing,
    typography,
    shadow,
    background: isDark ? colors.neutral[900] : colors.white,
    text: isDark ? colors.white : colors.neutral[800],
    card: isDark ? colors.neutral[800] : colors.white,
    cardAlt: isDark ? colors.neutral[700] : colors.neutral[50],
    border: isDark ? colors.neutral[700] : colors.neutral[200],
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};