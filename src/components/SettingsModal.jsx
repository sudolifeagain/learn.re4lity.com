import React, { useState, useContext, useEffect } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

// ショートカットオブジェクトから表示用の文字列を生成するヘルパー関数
const createDisplayString = (shortcut) => {
  const parts = [];
  // MacではCmd、WindowsではCtrlを優先的に表示
  if (shortcut.metaKey) parts.push('Cmd');
  else if (shortcut.ctrlKey) parts.push('Ctrl');
  
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
};

const SettingsModal = ({ isOpen, onClose }) => {
  const { shortcuts, updateShortcut, resetShortcuts } = useContext(SettingsContext);
  const [recordingAction, setRecordingAction] = useState(null);

  // 記録モード中にキー入力を監視する
  useEffect(() => {
    if (!recordingAction) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      // 修飾キーのみの入力は無視
      if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
        return;
      }

      const newShortcut = {
        key: e.key.toLowerCase(),
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
      };
      // 表示用の文字列も一緒に保存
      newShortcut.display = createDisplayString(newShortcut);

      updateShortcut(recordingAction, newShortcut);
      setRecordingAction(null); // 記録モードを終了
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [recordingAction, updateShortcut]);

  if (!isOpen) return null;

  const shortcutActions = [
    { id: 'jumpMode', name: 'ジャンプモード切替' },
    { id: 'addBookmark', name: 'しおりを追加/削除' },
    { id: 'syncScroll', name: '現在位置に同期' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>キーボードショートカット設定</h2>
        <div className="shortcut-list">
          {shortcutActions.map(({ id, name }) => (
            <div key={id} className="shortcut-item">
              <span>{name}</span>
              <button
                className="shortcut-key"
                onClick={() => setRecordingAction(id)}
              >
                {recordingAction === id ? 'キーを入力...' : shortcuts[id].display}
              </button>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={resetShortcuts}>デフォルトに戻す</button>
          <button className="btn" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;