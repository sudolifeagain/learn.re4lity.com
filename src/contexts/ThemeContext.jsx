import React, { createContext, useState, useEffect, useMemo } from 'react';

// HEXカラーをHSLに変換するヘルパー関数
const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const cmax = Math.max(r, g, b), cmin = Math.min(r, g, b);
  let h = 0, s = 0, l = (cmax + cmin) / 2;
  if (cmax !== cmin) {
    const d = cmax - cmin;
    s = l > 0.5 ? d / (2 - cmax - cmin) : d / (cmax + cmin);
    switch (cmax) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

// ダークモード設定をlocalStorageから読み込む
const loadDarkMode = () => {
  try {
    const saved = localStorage.getItem('isDarkMode');
    if (saved !== null) return JSON.parse(saved);
    // システム設定を確認
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  } catch {
    return true;
  }
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [accentColor, setAccentColor] = useState('#008080');
  const [isDarkMode, setIsDarkMode] = useState(loadDarkMode);

  // ダークモードをlocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    } catch (e) {
      console.error('Failed to save dark mode setting', e);
    }
  }, [isDarkMode]);

  useEffect(() => {
    const [h] = hexToHsl(accentColor);
    const root = document.documentElement;

    if (isDarkMode) {
      // ダークモード
      root.style.setProperty('--accent-color', accentColor);
      root.style.setProperty('--base-color', `hsl(${h}, 25%, 12%)`);
      root.style.setProperty('--bg-component-color', `hsl(${h}, 25%, 18%)`);
      root.style.setProperty('--border-color', `hsl(${h}, 15%, 30%)`);
      root.style.setProperty('--bg-hover-color', `hsl(${h}, 25%, 25%)`);
      root.style.setProperty('--text-color', '#FFFFFF');
      root.style.setProperty('--text-secondary-color', '#CCCCCC');
    } else {
      // ライトモード
      root.style.setProperty('--accent-color', accentColor);
      root.style.setProperty('--base-color', `hsl(${h}, 15%, 95%)`);
      root.style.setProperty('--bg-component-color', `hsl(${h}, 20%, 100%)`);
      root.style.setProperty('--border-color', `hsl(${h}, 15%, 80%)`);
      root.style.setProperty('--bg-hover-color', `hsl(${h}, 20%, 90%)`);
      root.style.setProperty('--text-color', '#1a1a1a');
      root.style.setProperty('--text-secondary-color', '#555555');
    }
  }, [accentColor, isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const value = useMemo(() => ({
    accentColor,
    setAccentColor,
    isDarkMode,
    toggleDarkMode
  }), [accentColor, isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
