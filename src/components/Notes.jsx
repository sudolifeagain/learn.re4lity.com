import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Notes = ({ 
  memo, 
  defaultTimestamp, 
  isJumpModeOn, 
  isRecording, 
  onMemoChange, 
  onStartEdit, 
  onJump,
}) => {
  const [localText, setLocalText] = useState(memo?.text || '');
  const originalText = memo?.text || '';
  const timestamp = memo?.timestamp || defaultTimestamp;
  const isBookmarked = memo?.isBookmark || false;

  useEffect(() => {
    setLocalText(originalText);
  }, [originalText]);
  
  const handleTimestampClick = () => {
    if (isJumpModeOn) {
      onJump(timestamp);
    }
  };

  const handleBlur = () => {
    if (localText !== originalText) {
      onMemoChange(localText);
    }
  };

  return (
    <div className="note-container">
      <div className="note-header">
        <div
          className={`note-timestamp ${isJumpModeOn ? 'jumpable' : ''}`}
          onClick={handleTimestampClick}
          title={isJumpModeOn ? 'クリックしてこの時間にジャンプ' : ''}
        >
          {isBookmarked && <span className="bookmark-icon">🔖 </span>}
          {timestamp}
        </div>
        <button
          className={`timestamp-edit-btn ${isRecording ? 'recording' : ''}`}
          onClick={onStartEdit}
          title="タイムスタンプを編集"
        >
          {isRecording ? '記録中...' : '編集'}
        </button>
      </div>
      
      <div className="note-editor">
        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Markdownでメモを入力..."
        />
      </div>
    </div>
  );
};

export default React.memo(Notes);
