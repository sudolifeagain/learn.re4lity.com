import React, { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Player from '../components/Player';
import Notes from '../components/Notes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { SettingsContext } from '../contexts/SettingsContext';
import SettingsModal from '../components/SettingsModal';
import { useMemos } from '../hooks/useMemos';
import { timeToSeconds } from '../utils/time';

const StudyPage = ({ videoList }) => {
  const { videoId } = useParams();
  const videoData = videoList.find(v => v.id === videoId);
  const rowRefs = useRef({});
  
  const { shortcuts } = useContext(SettingsContext);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const getInitialLang = () => {
    const subtitlesForCurrentVideo = videoData?.subtitles || [];
    const hasJapanese = subtitlesForCurrentVideo.some(s => s.lang === 'ja');
    const hasEnglish = subtitlesForCurrentVideo.some(s => s.lang === 'en');
    if (hasJapanese) return 'ja';
    if (hasEnglish) return 'en';
    return subtitlesForCurrentVideo[0]?.lang;
  };
  const [selectedLang, setSelectedLang] = useState(getInitialLang);
  const [subtitles, setSubtitles] = useState([]);
  const [player, setPlayer] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [isJumpModeOn, setIsJumpModeOn] = useState(false);
  const [isSyncModeOn, setIsSyncModeOn] = useState(false); // (NEW)
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(null); // (NEW)
  const [recordingMemoIndex, setRecordingMemoIndex] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef(null);

  const {
    memos,
    handleMemoChange,
    handleAddBookmark,
    handleTimestampUpdate,
    handleExportMemos,
    handleImportMemos,
  } = useMemos(videoId, selectedLang, subtitles, player);

  const bookmarks = useMemo(() => {
    return Object.entries(memos)
      .filter(([, memo]) => memo.isBookmark)
      .map(([index, memo]) => ({ index: parseInt(index), ...memo }));
  }, [memos]);

  useEffect(() => {
    const subtitleInfo = videoData?.subtitles.find(s => s.lang === selectedLang);
    const subtitlePath = subtitleInfo?.path;
    const fetchSubtitles = async () => {
      if (!subtitlePath) { setSubtitles([]); return; }
      try {
        const response = await fetch(subtitlePath);
        if (!response.ok) { throw new Error(`字幕ファイルが見つかりません: ${subtitlePath}`); }
        const data = await response.json();
        setSubtitles(data);
      } catch (err) {
        console.error(err);
        if (selectedLang === 'ja' && videoData?.subtitles.some(s => s.lang === 'en')) {
          setSelectedLang('en');
        } else { setSubtitles([]); }
      }
    };
    fetchSubtitles();
  }, [videoId, selectedLang, videoData]);

  // (NEW) 同期モードのメインロジック
  useEffect(() => {
    if (!isSyncModeOn || playerState !== 1 /* Playing */ || subtitles.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      const currentTime = player.getCurrentTime();
      let newActiveIndex = -1;

      // 現在時刻に該当する字幕を探す
      for (let i = subtitles.length - 1; i >= 0; i--) {
        if (timeToSeconds(subtitles[i].time) <= currentTime) {
          newActiveIndex = i;
          break;
        }
      }

      if (newActiveIndex !== -1 && newActiveIndex !== activeSubtitleIndex) {
        setActiveSubtitleIndex(newActiveIndex);
      }
    }, 500); // 0.5秒ごとにチェック

    return () => clearInterval(interval);
  }, [isSyncModeOn, playerState, player, subtitles, activeSubtitleIndex]);

  // (NEW) アクティブな字幕が変更されたらスクロール
  useEffect(() => {
    if (activeSubtitleIndex !== null && rowRefs.current[activeSubtitleIndex]) {
      rowRefs.current[activeSubtitleIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeSubtitleIndex]);

  const handleSyncScroll = useCallback(() => {
    if (!player || subtitles.length === 0) return;
    const currentTime = player.getCurrentTime();
    let closestIndex = 0;
    let smallestDiff = Infinity;
    subtitles.forEach((subtitle, index) => {
      const diff = Math.abs(timeToSeconds(subtitle.time) - currentTime);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = index;
      }
    });
    const targetRow = rowRefs.current[closestIndex];
    if (targetRow) {
      targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [player, subtitles]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA') { return; }
      const checkShortcut = (shortcut) => {
        if (!shortcut || e.key.toLowerCase() !== shortcut.key) return false;
        const ctrlCmd = shortcut.ctrlKey || shortcut.metaKey;
        if (ctrlCmd && !(e.ctrlKey || e.metaKey)) return false;
        if (!ctrlCmd && (e.ctrlKey || e.metaKey)) return false;
        if (shortcut.altKey !== e.altKey) return false;
        if (shortcut.shiftKey !== e.shiftKey) return false;
        return true;
      };
      if (checkShortcut(shortcuts.jumpMode)) {
        e.preventDefault();
        setIsJumpModeOn(prev => !prev);
      }
      if (checkShortcut(shortcuts.addBookmark)) {
        e.preventDefault();
        handleAddBookmark();
      }
      if (checkShortcut(shortcuts.syncScroll)) {
        e.preventDefault();
        handleSyncScroll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [shortcuts, handleAddBookmark, handleSyncScroll]);

  const handlePlayerReady = (event) => setPlayer(event.target);

  const handlePlayerStateChange = (event) => {
    setPlayerState(event.data); // (NEW) プレイヤーの状態をstateに保存
    if (recordingMemoIndex !== null && event.data === window.YT.PlayerState.PAUSED) {
      handleTimestampUpdate(recordingMemoIndex);
      setRecordingMemoIndex(null);
    }
  };
  
  const handleJumpToTime = (timestamp) => {
    if (player && typeof timestamp === 'string') {
      const seconds = timeToSeconds(timestamp);
      player.seekTo(seconds, true);
      player.playVideo();
    }
  };

  const handleSubtitleTimestampClick = (e) => {
    if (isJumpModeOn) {
      const timestamp = e.currentTarget.dataset.timestamp;
      handleJumpToTime(timestamp);
    }
  };

  const handleJumpToBookmark = (bookmark) => {
    const targetRow = rowRefs.current[bookmark.index];
    if (targetRow) {
      targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    handleJumpToTime(bookmark.timestamp);
  };
    
  const handleImportClick = () => { fileInputRef.current.click(); };
  
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    handleImportMemos(file);
    event.target.value = null;
  };

  if (!videoData) {
    return <div className="study-page">動画が見つかりません。</div>;
  }

  return (
    <>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <div className="study-page">
        <header className="study-header">
          <h2>{videoData.title}</h2>
          <div className="header-controls">
            <ThemeSwitcher />
            <button className="btn" onClick={() => setIsSettingsModalOpen(true)}>⚙️ 設定</button>
            <button className="btn" onClick={() => setIsPreviewMode(p => !p)}>
              {isPreviewMode ? '編集' : 'プレビュー'}
            </button>
            <button className="btn" onClick={handleAddBookmark} title={shortcuts.addBookmark.display}>しおり</button>
            <div className="bookmark-dropdown">
              <button className="btn">しおり一覧 ({bookmarks.length})</button>
              <div className="bookmark-list">
                {bookmarks.length > 0 ? (
                  bookmarks.map(bm => (
                    <div key={bm.index} onClick={() => handleJumpToBookmark(bm)}>
                      <strong>{bm.timestamp}</strong>
                      <span>{bm.text.substring(0, 30) || '(コメントなし)'}</span>
                    </div>
                  ))
                ) : (
                  <div>しおりはありません</div>
                )}
              </div>
            </div>
            <button className={`btn ${isSyncModeOn ? 'active' : ''}`} onClick={() => setIsSyncModeOn(p => !p)}>
              {isSyncModeOn ? '同期中' : '同期モード'}
            </button>
            <button className="btn" onClick={handleSyncScroll} title={shortcuts.syncScroll.display}>🔄</button>
            <div className="data-buttons">
              <button className="btn" onClick={handleExportMemos}>エクスポート</button>
              <button className="btn" onClick={handleImportClick}>インポート</button>
              <input type="file" ref={fileInputRef} onChange={handleFileImport} accept="application/json" style={{ display: 'none' }} />
            </div>
            <label className="jump-mode-switch" title={shortcuts.jumpMode.display}>
              <input type="checkbox" checked={isJumpModeOn} onChange={() => setIsJumpModeOn(prev => !prev)} />
              ジャンプ
            </label>
            {videoData.subtitles.length > 1 && (
              <div className="language-selector">
                <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
                  {videoData.subtitles.map(sub => (
                    <option key={sub.lang} value={sub.lang}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>
        <main className="main-content">
          <div className="column">
            <Player
              youtubeId={videoData.youtubeId}
              onReady={handlePlayerReady}
              onStateChange={handlePlayerStateChange}
            />
          </div>
          <div className="column">
            {subtitles.map((subtitle, index) => (
              <div 
                key={subtitle.time + index} 
                ref={el => rowRefs.current[index] = el} 
                className={`content-row ${memos[index]?.isBookmark ? 'bookmarked' : ''} ${activeSubtitleIndex === index ? 'active' : ''}`}
              >
                <div className="subtitle-cell">
                  <div
                    className={`subtitle-time ${isJumpModeOn ? 'jumpable' : ''}`}
                    onClick={handleSubtitleTimestampClick}
                    data-timestamp={subtitle.time}
                    title={isJumpModeOn ? 'クリックしてこの時間にジャンプ' : ''}
                  >
                    {subtitle.time}
                  </div>
                  <div>{subtitle.text}</div>
                </div>
                <div className="note-cell">
                  {isPreviewMode ? (
                    <div className="note-display">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {memos[index]?.text || ''}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <Notes
                      memo={memos[index]}
                      defaultTimestamp={subtitle.time}
                      isJumpModeOn={isJumpModeOn}
                      isRecording={recordingMemoIndex === index}
                      onMemoChange={(newValue) => handleMemoChange(index, newValue)}
                      onStartEdit={() => setRecordingMemoIndex(index)}
                      onJump={handleJumpToTime}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default StudyPage;