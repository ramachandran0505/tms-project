import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

export const themes = [
    {
        id: 'purple',
        name: 'Royal Purple',
        color: '#a855f7',
        hover: '#9333ea',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        bg: '#1a1625',
        card: '#241e33',
        sidebar: '#2d2541'
    },
    {
        id: 'blue',
        name: 'Cyber Blue',
        color: '#3b82f6',
        hover: '#2563eb',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        bg: '#0f172a',
        card: '#1e293b',
        sidebar: '#334155'
    },
    {
        id: 'gold',
        name: 'Amber Gold',
        color: '#f59e0b',
        hover: '#d97706',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        bg: '#2c1f1b',
        card: '#3a2a24',
        sidebar: '#4a362e'
    }
];

export const ThemeProvider = ({ children }) => {
    const [currentThemeId, setCurrentThemeId] = useState(() => {
        return localStorage.getItem('app-theme') || 'gold';
    });

    const applyTheme = useCallback((themeId) => {
        const theme = themes.find(t => t.id === themeId) || themes[0];

        const root = document.documentElement;
        root.style.setProperty('--theme-color', theme.color);
        root.style.setProperty('--theme-hover', theme.hover);
        root.style.setProperty('--theme-gradient', theme.gradient);
        root.style.setProperty('--bg-page', theme.bg);
        root.style.setProperty('--card-bg', theme.card);
        root.style.setProperty('--sidebar-bg', theme.sidebar);

        // Helper for RGB
        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        };

        root.style.setProperty('--theme-color-rgb', hexToRgb(theme.color));
        root.style.setProperty('--bg-page-rgb', hexToRgb(theme.bg));
        root.style.setProperty('--sidebar-bg-rgb', hexToRgb(theme.sidebar));
        localStorage.setItem('app-theme', themeId);
        setCurrentThemeId(themeId);
    }, []);

    useEffect(() => {
        applyTheme(currentThemeId);
    }, [currentThemeId, applyTheme]);

    return (
        <ThemeContext.Provider value={{ currentThemeId, applyTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};
