import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { videoList } from '../public/data/videoData';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Lazy load page components for better initial load performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const StudyLayout = lazy(() => import('./pages/StudyLayout'));
const StudyPage = lazy(() => import('./pages/StudyPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: 'var(--text-color, #333)'
  }}>
    読み込み中...
  </div>
);

export default function App() {
  const firstVideoId = videoList.length > 0 ? videoList[0].id : null;

  return (
    <ThemeProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/study" element={<StudyLayout />}>
                {firstVideoId && <Route index element={<Navigate to={firstVideoId} replace />} />}
                <Route path=":videoId" element={<StudyPage videoList={videoList} />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SettingsProvider>
    </ThemeProvider>
  );
}