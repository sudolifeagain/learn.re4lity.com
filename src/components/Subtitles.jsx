import React from 'react';

/**
 * 字幕を表示するコンポーネント (Presentational)
 * @param {object} props
 * @param {Array} props.subtitles - 表示する字幕の配列
 * @param {boolean} props.loading - 読み込み中かどうか
 * @param {string|null} props.error - エラーメッセージ
 */
const Subtitles = ({ subtitles, loading, error }) => {
  if (loading) return <div>字幕を読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div>
      <h3>字幕</h3>
      <ul className="subtitles-list">
        {subtitles.map((subtitle, index) => (
          <li key={index} className="subtitle-item">
            <div className="subtitle-time">{subtitle.time}</div>
            <div>{subtitle.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Subtitles;
