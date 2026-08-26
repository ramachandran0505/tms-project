import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

export const themes = [
    {
        id: 'purple',
        name: 'Electric Purple',
        color: '#6C47FF',
        hover: '#5835E5',
        gradient: 'linear-gradient(135deg, #6C47FF 0%, #4F46E5 100%)'
    },
    {
        id: 'blue',
        name: 'Ocean Blue',
        color: '#2563EB',
        hover: '#1D4ED8',
        gradient: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)'
    },
    {
        id: 'emerald',
        name: 'Emerald Green',
        color: '#059669',
        hover: '#047857',
        gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
    },
    {
        id: 'amber',
        name: 'Sunset Amber',
        color: '#D97706',
        hover: '#B45309',
        gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
    },
    {
        id: 'rose',
        name: 'Cyber Rose',
        color: '#E11D48',
        hover: '#BE123C',
        gradient: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)'
    }
];

export const ThemeProvider = ({ children }) => {
    const [themeMode, setThemeMode] = useState(() => {
        const saved = localStorage.getItem('theme-mode');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [currentThemeId, setCurrentThemeId] = useState(() => {
        return localStorage.getItem('app-theme') || 'purple';
    });

    const applyTheme = useCallback((themeId = currentThemeId, mode = themeMode) => {
        const activeTheme = themes.find(t => t.id === themeId) || themes[0];
        const isDark = mode === 'dark';
        const root = document.documentElement;

        // Mode Attributes
        root.setAttribute('data-theme', mode);
        document.body.setAttribute('data-theme', mode);

        // Accent Colors
        root.style.setProperty('--primary', activeTheme.color);
        root.style.setProperty('--primary-hover', activeTheme.hover);
        root.style.setProperty('--primary-gradient', activeTheme.gradient);
        root.style.setProperty('--theme-color', activeTheme.color);
        root.style.setProperty('--theme-hover', activeTheme.hover);
        root.style.setProperty('--theme-gradient', activeTheme.gradient);

        // Mode Variables
        if (isDark) {
            root.style.setProperty('--bg-page', '#0B0D13');
            root.style.setProperty('--card-bg', '#131722');
            root.style.setProperty('--sidebar-bg', '#0F121C');
            root.style.setProperty('--text-main', '#F8FAFC');
            root.style.setProperty('--text-secondary', '#94A3B8');
            root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--border-soft', 'rgba(255, 255, 255, 0.08)');
            root.style.setProperty('--nav-bg', 'rgba(15, 18, 28, 0.92)');
            root.style.setProperty('--nav-bg-scrolled', 'rgba(11, 13, 19, 0.98)');
            root.style.setProperty('--nav-border', 'rgba(255, 255, 255, 0.09)');
            root.style.setProperty('--table-header-bg', '#181C2B');
            root.style.setProperty('--table-hover-bg', '#1E2336');
            root.style.setProperty('--input-bg', '#161A26');
            root.style.setProperty('--input-border', 'rgba(255, 255, 255, 0.14)');
            root.style.setProperty('--item-hover', 'rgba(255, 255, 255, 0.06)');
        } else {
            root.style.setProperty('--bg-page', '#F7F7FB');
            root.style.setProperty('--card-bg', '#FFFFFF');
            root.style.setProperty('--sidebar-bg', '#FFFFFF');
            root.style.setProperty('--text-main', '#171717');
            root.style.setProperty('--text-secondary', '#71717A');
            root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.08)');
            root.style.setProperty('--border-soft', 'rgba(0, 0, 0, 0.06)');
            root.style.setProperty('--nav-bg', 'rgba(255, 255, 255, 0.88)');
            root.style.setProperty('--nav-bg-scrolled', 'rgba(255, 255, 255, 0.96)');
            root.style.setProperty('--nav-border', 'rgba(0, 0, 0, 0.07)');
            root.style.setProperty('--table-header-bg', '#FAFAFA');
            root.style.setProperty('--table-hover-bg', '#F8FAFC');
            root.style.setProperty('--input-bg', '#FFFFFF');
            root.style.setProperty('--input-border', 'rgba(0, 0, 0, 0.12)');
            root.style.setProperty('--item-hover', '#F4F4F5');
        }

        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        };

        root.style.setProperty('--theme-color-rgb', hexToRgb(activeTheme.color));
        localStorage.setItem('app-theme', themeId);
        localStorage.setItem('theme-mode', mode);
        setCurrentThemeId(themeId);
        setThemeMode(mode);
    }, [currentThemeId, themeMode]);

    const toggleThemeMode = () => {
        const nextMode = themeMode === 'dark' ? 'light' : 'dark';
        applyTheme(currentThemeId, nextMode);
    };

    const changeThemeMode = (mode) => {
        applyTheme(currentThemeId, mode);
    };

    const changeThemeColor = (colorId) => {
        applyTheme(colorId, themeMode);
    };

    useEffect(() => {
        applyTheme(currentThemeId, themeMode);
    }, [applyTheme, currentThemeId, themeMode]);

    return (
        <ThemeContext.Provider value={{
            themeMode,
            toggleThemeMode,
            changeThemeMode,
            currentThemeId,
            changeThemeColor,
            applyTheme,
            themes,
            isDark: themeMode === 'dark'
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
