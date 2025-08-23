import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ videoList }) => {
  return (
    <nav className="sidebar">
      <h1>学習動画リスト</h1>
      <ul>
        {videoList.map(video => (
          <li key={video.id}>
            <NavLink
              to={`/study/${video.id}`}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {video.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;