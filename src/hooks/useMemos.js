import { useState, useEffect, useCallback, useRef } from 'react';
import { timeToSeconds, formatTime } from '../utils/time';

export const useMemos = (videoId, selectedLang, subtitles, player) => {
  const [memos, setMemos] = useState({});
  const subtitlesRef = useRef(subtitles);
  subtitlesRef.current = subtitles;
  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    if (!videoId || !selectedLang) return;
    const key = `memos_${videoId}_${selectedLang}`;
    const savedMemos = localStorage.getItem(key);
    setMemos(savedMemos ? JSON.parse(savedMemos) : {});
  }, [videoId, selectedLang]);

  useEffect(() => {
    if (!videoId || !selectedLang) return;
    const key = `memos_${videoId}_${selectedLang}`;
    localStorage.setItem(key, JSON.stringify(memos));
  }, [memos, videoId, selectedLang]);

  const handleMemoChange = useCallback((index, text) => {
    setMemos(prev => {
      const currentMemo = prev[index] || {};
      const newMemo = {
        ...currentMemo,
        text: text,
        timestamp: currentMemo.timestamp || subtitlesRef.current[index]?.time || "00:00:00"
      };
      return { ...prev, [index]: newMemo };
    });
  }, []);

  const findClosestSubtitleIndex = useCallback(() => {
    if (!playerRef.current || subtitlesRef.current.length === 0) return -1;
    const currentTime = playerRef.current.getCurrentTime();
    let closestIndex = 0;
    let smallestDiff = Infinity;
    subtitlesRef.current.forEach((subtitle, index) => {
      const diff = Math.abs(timeToSeconds(subtitle.time) - currentTime);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = index;
      }
    });
    return closestIndex;
  }, []);

  const handleAddBookmark = useCallback(() => {
    const closestIndex = findClosestSubtitleIndex();
    if (closestIndex === -1) return;
    setMemos(prev => {
      const currentMemo = prev[closestIndex] || {};
      const newMemo = {
        ...currentMemo,
        timestamp: currentMemo.timestamp || subtitlesRef.current[closestIndex].time,
        text: currentMemo.text || '',
        isBookmark: !currentMemo.isBookmark
      };
      return { ...prev, [closestIndex]: newMemo };
    });
  }, [findClosestSubtitleIndex]);

  const handleTimestampUpdate = useCallback((index) => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime();
    const formattedTime = formatTime(currentTime);
    setMemos(prev => ({
      ...prev,
      [index]: { ...prev[index], timestamp: formattedTime }
    }));
  }, []);

  const handleExportMemos = useCallback(() => {
    if (!videoId || !selectedLang) return;
    const memosArray = Object.values(memos).filter(memo => (memo.text && memo.text.trim() !== '') || memo.isBookmark);
    const exportData = { videoId, language: selectedLang, memos: memosArray };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoId}_${selectedLang}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [memos, videoId, selectedLang]);

  const handleImportMemos = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.videoId !== videoId || data.language !== selectedLang) {
          alert("インポートエラー: ファイルの動画IDまたは言語が現在表示中のものと一致しません。");
          return;
        }
        const importedMemos = {};
        data.memos.forEach(memo => {
          let bestMatchIndex = -1;
          let smallestDiff = Infinity;
          subtitlesRef.current.forEach((sub, index) => {
            const diff = Math.abs(timeToSeconds(sub.time) - timeToSeconds(memo.timestamp));
            if (diff < smallestDiff) {
              smallestDiff = diff;
              bestMatchIndex = index;
            }
          });
          if (bestMatchIndex !== -1 && smallestDiff < 1 && !importedMemos[bestMatchIndex]) {
            importedMemos[bestMatchIndex] = memo;
          }
        });
        setMemos(importedMemos);
        alert("メモをインポートしました。");
      } catch (error) {
        alert("インポートエラー: JSONファイルの解析に失敗しました。");
        console.error("File import error:", error);
      }
    };
    reader.readAsText(file);
  }, [videoId, selectedLang]);

  return {
    memos,
    handleMemoChange,
    handleAddBookmark,
    handleTimestampUpdate,
    handleExportMemos,
    handleImportMemos,
  };
};
