import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
    const { accentColor, setAccentColor } = useContext(ThemeContext);

    return (
        <div className="theme-switcher">
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

export default ThemeSwitcher;
