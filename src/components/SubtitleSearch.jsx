import React, { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * 字幕内検索コンポーネント
 * @param {object} props
 * @param {Array} props.subtitles - 字幕データ配列
 * @param {function} props.onResultSelect - 検索結果選択時のコールバック
 */
const SubtitleSearch = ({ subtitles, onResultSelect }) => {
    const [query, setQuery] = useState('');
    const [currentResultIndex, setCurrentResultIndex] = useState(0);

    // 検索結果を計算
    const searchResults = useMemo(() => {
        if (!query.trim() || subtitles.length === 0) return [];
        const lowerQuery = query.toLowerCase();
        return subtitles
            .map((sub, index) => ({ ...sub, originalIndex: index }))
            .filter(sub => sub.text.toLowerCase().includes(lowerQuery));
    }, [query, subtitles]);

    // 検索結果が変わったらインデックスをリセット
    useEffect(() => {
        setCurrentResultIndex(0);
    }, [searchResults.length]);

    // 現在の検索結果にジャンプ
    useEffect(() => {
        if (searchResults.length > 0 && onResultSelect) {
            onResultSelect(searchResults[currentResultIndex]?.originalIndex);
        }
    }, [currentResultIndex, searchResults, onResultSelect]);

    const handlePrevious = useCallback(() => {
        setCurrentResultIndex(prev =>
            prev > 0 ? prev - 1 : searchResults.length - 1
        );
    }, [searchResults.length]);

    const handleNext = useCallback(() => {
        setCurrentResultIndex(prev =>
            prev < searchResults.length - 1 ? prev + 1 : 0
        );
    }, [searchResults.length]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                handlePrevious();
            } else {
                handleNext();
            }
        }
    }, [handleNext, handlePrevious]);

    const handleClear = useCallback(() => {
        setQuery('');
        setCurrentResultIndex(0);
    }, []);

    return (
        <div className="subtitle-search">
            <div className="search-input-wrapper">
                <input
                    type="text"
                    placeholder="字幕を検索..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="search-input"
                />
                {query && (
                    <button className="search-clear-btn" onClick={handleClear} title="クリア">
                        ✕
                    </button>
                )}
            </div>
            {query && (
                <div className="search-results-info">
                    <span className="search-count">
                        {searchResults.length > 0
                            ? `${currentResultIndex + 1} / ${searchResults.length}`
                            : '0件'}
                    </span>
                    <button
                        className="search-nav-btn"
                        onClick={handlePrevious}
                        disabled={searchResults.length === 0}
                        title="前へ (Shift+Enter)"
                    >
                        ▲
                    </button>
                    <button
                        className="search-nav-btn"
                        onClick={handleNext}
                        disabled={searchResults.length === 0}
                        title="次へ (Enter)"
                    >
                        ▼
                    </button>
                </div>
            )}
        </div>
    );
};

export default React.memo(SubtitleSearch);
