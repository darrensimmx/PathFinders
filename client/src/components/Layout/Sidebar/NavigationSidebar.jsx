import React from 'react';
import SidebarHeader from "./SidebarHeader";
import SidebarItem from "./SidebarItem";
import { FaUser, FaSave, FaPlayCircle, FaComments } from 'react-icons/fa'

export default function NavigationSidebar({ setActiveView, user }) {
  return (
    <div className="navigation-sidebar">
      <SidebarHeader 
        subtitle="Menu"
        user={user}
        // onBack={() => setActiveView('routeGenerator')}
        username={user?.username || user?.name}
      />

      <hr />

      <SidebarItem
        icon={<FaUser className="nav-icon"/>}
        title="Profile"
        subtitle="Click icon to view profile"
        onClick={() => setActiveView('profile')}
      />

      <SidebarItem
        icon={<FaSave className="nav-icon"/>}
        title="Route History"
        subtitle="Click icon to view/edit saved routes"
        onClick={() => setActiveView('savedRoutes')}
      />

      <SidebarItem
        icon={<FaPlayCircle className="nav-icon"/>}
        title="Route Generator"
        subtitle="Click icon to select filters and generate routes"
        onClick={() => setActiveView('routeGenerator')}
      />

      <SidebarItem
        icon={<FaComments className="nav-icon"/>}
        title="Contact Us"
        subtitle="To connect us for any technical difficulties, or any routes that are blocked off. Feedbacks are always welcomed!"
        onClick={() => setActiveView('contact')}
      />
      

    </div>
  );
}
