import BackBtn from '../../Assets/BackBtn.png'
import Avatar from '../../Assets/Avatar.png'
import SidebarHeader from './SidebarHeader';
import { useState, useEffect } from 'react';

export default function ProfileSidebar({ setActiveView, user }) {
  return (
    <div className="profile-sidebar">
      
      <SidebarHeader 
        subtitle="Profile Page"
        onBack={() => setActiveView('navigation')}
        user={user}
      />

      <img src={Avatar} alt="Profile Picture" />
      {user ? (
      <>
        <p><strong>Name: </strong> {user.name}</p>
        <p><strong>Email: </strong> {user.email}</p>
      </>) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
