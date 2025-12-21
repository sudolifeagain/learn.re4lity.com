import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
    const { accentColor, setAccentColor, isDarkMode, toggleDarkMode } = useContext(ThemeContext);

    return (
        <div className="theme-switcher">
            <button
                className="dark-mode-toggle"
                onClick={toggleDarkMode}
                title={isDarkMode ? 'ライトモードに切替' : 'ダークモードに切替'}
            >
                {isDarkMode ? '☀️' : '🌙'}
            </button>
            <label htmlFor="theme-color-picker">テーマカラー:</label>
            <input
                type="color"
                id="theme-color-picker"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
            />
        </div>
    );
};

export default React.memo(ThemeSwitcher);
