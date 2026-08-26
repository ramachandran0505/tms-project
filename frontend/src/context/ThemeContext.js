import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

export const themes = [
    {
        id: 'purple',
        name: 'Purple',
        color: '#6C47FF',
        hover: '#5835E5',
        gradient: 'linear-gradient(135deg, #6C47FF 0%, #4F46E5 100%)',
        bg: '#F7F7FB',
        card: '#FFFFFF',
        sidebar: '#FFFFFF'
    }
];

export const ThemeProvider = ({ children }) => {
    const [currentThemeId, setCurrentThemeId] = useState('purple');

    const applyTheme = useCallback((themeId = 'purple') => {
        const theme = themes[0];

        const root = document.documentElement;
        root.style.setProperty('--primary', theme.color);
        root.style.setProperty('--primary-hover', theme.hover);
        root.style.setProperty('--primary-gradient', theme.gradient);
        root.style.setProperty('--theme-color', theme.color);
        root.style.setProperty('--theme-hover', theme.hover);
        root.style.setProperty('--theme-gradient', theme.gradient);
        root.style.setProperty('--bg-page', theme.bg);
        root.style.setProperty('--card-bg', theme.card);
        root.style.setProperty('--sidebar-bg', theme.sidebar);

        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        };

        root.style.setProperty('--theme-color-rgb', hexToRgb(theme.color));
        root.style.setProperty('--bg-page-rgb', hexToRgb(theme.bg));
        root.style.setProperty('--sidebar-bg-rgb', hexToRgb(theme.sidebar));
        localStorage.setItem('app-theme', 'purple');
        setCurrentThemeId('purple');
    }, []);

    useEffect(() => {
        applyTheme('purple');
    }, [applyTheme]);

    return (
        <ThemeContext.Provider value={{ currentThemeId, applyTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};
