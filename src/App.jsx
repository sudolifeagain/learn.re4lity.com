import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudyLayout from './pages/StudyLayout';
import StudyPage from './pages/StudyPage';
import { videoList } from '../public/data/videoData';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext'; // <-- 追加

export default function App() {
  const firstVideoId = videoList.length > 0 ? videoList[0].id : null;

  return (
    <ThemeProvider>
      <SettingsProvider> {/* <-- 追加 */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/study" element={<StudyLayout />}>
              {firstVideoId && <Route index element={<Navigate to={firstVideoId} replace />} />}
              <Route path=":videoId" element={<StudyPage videoList={videoList} />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider> {/* <-- 追加 */}
    </ThemeProvider>
  );
}