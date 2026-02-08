import { createContext, useContext } from 'react';

/**
 * Single App Color Scheme
 * 
 * To change the app colors, simply modify the values below.
 * All screens throughout the app will automatically use these colors.
 * 
 * Color Guide:
 * - primary: Main brand color used for headers, buttons
 * - secondary: Secondary brand color used for accents
 * - accent: Highlight color for emphasis
 * - gradient: Array of colors for gradient backgrounds [start, end]
 */

const appTheme = {
  // Primary colors - Change these to customize your app's look
  primary: '#a55438',      // Purple - Main brand color
  secondary: '#8f4bd3',    // Deep purple - Secondary brand color
  accent: '#8b5cf6',       // Light purple - Accent color
  gradient: ['#ea9b66', '#764ba2'], // Gradient colors
  
  // Common colors - Keep these consistent for UI elements
  white: '#ffffff',
  background: '#ffffff',
  cardBackground: '#ffffff',
  lightGray: '#f5f5f5',
  mediumGray: '#9ca3af',
  darkGray: '#374151',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  black: '#000000',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  gold: '#fbbf24',
  silver: '#9ca3af',
  bronze: '#d97706',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors: appTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
