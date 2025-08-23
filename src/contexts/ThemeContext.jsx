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

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [accentColor, setAccentColor] = useState('#008080'); // デフォルトカラー (Teal)

    useEffect(() => {
        const [h] = hexToHsl(accentColor);
        
        // 選択されたアクセントカラーの色相(H)を基準に、他の色を生成
        const baseColor = `hsl(${h}, 25%, 25%)`;
        const bgComponentColor = `hsl(${h}, 25%, 20%)`;
        const borderColor = `hsl(${h}, 15%, 35%)`;
        const bgHoverColor = `hsl(${h}, 25%, 30%)`;

        const root = document.documentElement;
        root.style.setProperty('--accent-color', accentColor);
        root.style.setProperty('--base-color', baseColor);
        root.style.setProperty('--bg-component-color', bgComponentColor);
        root.style.setProperty('--border-color', borderColor);
        root.style.setProperty('--bg-hover-color', bgHoverColor);

    }, [accentColor]);

    const value = useMemo(() => ({ accentColor, setAccentColor }), [accentColor]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
