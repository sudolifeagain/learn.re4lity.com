import React from 'react';
import YouTube from 'react-youtube';

/**
 * react-youtubeライブラリを使用したYouTubeプレイヤーコンポーネント
 * @param {object} props
 * @param {string} props.youtubeId - 表示するYouTube動画のID
 * @param {function} props.onReady - プレイヤーの準備が完了したときに呼ばれる
 * @param {function} props.onStateChange - プレイヤーの状態が変化したときに呼ばれる
 */
const Player = ({ youtubeId, onReady, onStateChange }) => {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  };

  return (
    <div className="player-container">
      <YouTube
        videoId={youtubeId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default React.memo(Player);