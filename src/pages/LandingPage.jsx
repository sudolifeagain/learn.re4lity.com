import React from 'react';
import { Link } from 'react-router-dom';
import { videoList } from '../../public/data/videoData';
import ThemeSwitcher from '../components/ThemeSwitcher';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>YouTube拡張学習ノート</h1>
        <p>動画で効率的に学ぶためのノートアプリ</p>
        <ThemeSwitcher />
      </header>
      <main className="course-list">
        <h2>学習コース一覧</h2>
        <div className="course-grid">
          {videoList.map(video => (
            <Link to={`/study/${video.id}`} key={video.id} className="course-card">
              <h3>{video.title}</h3>
              <p>学習を開始する →</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;