import React, { createContext, useState, useEffect, useMemo } from 'react';

// デフォルトのショートカット設定
const defaultShortcuts = {
  jumpMode: { key: 'j', ctrlKey: true, metaKey: true, display: 'Ctrl/Cmd + J' },
  addBookmark: { key: 'b', ctrlKey: true, metaKey: true, display: 'Ctrl/Cmd + B' },
  syncScroll: { key: 's', ctrlKey: true, metaKey: true, display: 'Ctrl/Cmd + S' },
};

// ローカルストレージからショートカットを読み込む関数
const loadShortcuts = () => {
  try {
    const saved = localStorage.getItem('keyboardShortcuts');
    if (saved) {
      // 保存された設定とデフォルト設定をマージして、新しいショートカットが追加されても対応できるようにする
      return { ...defaultShortcuts, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error("Failed to load shortcuts from localStorage", error);
  }
  return defaultShortcuts;
};

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [shortcuts, setShortcuts] = useState(loadShortcuts);

  // shortcutsが変更されたらローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem('keyboardShortcuts', JSON.stringify(shortcuts));
    } catch (error) {
      console.error("Failed to save shortcuts to localStorage", error);
    }
  }, [shortcuts]);

  // 特定のアクションのショートカットを更新する関数
  const updateShortcut = (action, newShortcut) => {
    setShortcuts(prev => ({
      ...prev,
      [action]: newShortcut,
    }));
  };

  // すべてのショートカットをデフォルトに戻す関数
  const resetShortcuts = () => {
    setShortcuts(defaultShortcuts);
  };

  const value = useMemo(() => ({ shortcuts, updateShortcut, resetShortcuts }), [shortcuts]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
