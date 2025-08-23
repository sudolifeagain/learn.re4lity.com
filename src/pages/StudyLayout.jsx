import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { videoList } from '../../public/data/videoData';

const StudyLayout = () => {
  return (
    <div className="app-container">
      <Sidebar
        videoList={videoList}
      />
      {/* この部分にStudyPageが描画されます */}
      <Outlet />
    </div>
  );
};

export default StudyLayout;