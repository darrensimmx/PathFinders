// components/MainApp.jsx

import React, { useState } from 'react';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import RouteMap from '../RouteMap';
import './Layout/Layout.css'
// import WeatherWarning if needed

export default function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarView, setActiveSidebarView] = useState('routeGenerator');

  // Optional: any other shared state like generated route or saved routes

  return (
    <>
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="app-container">
        <Sidebar 
          isOpen={isSidebarOpen}
          activeView={activeSidebarView}
          setActiveView={setActiveSidebarView}
        />
        <RouteMap sidebarOpen={isSidebarOpen}/>
      </div>
    </>
  );
}
