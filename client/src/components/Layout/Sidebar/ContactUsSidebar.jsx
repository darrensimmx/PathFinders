import React from 'react';
import SidebarHeader from './SidebarHeader';
import { FaEnvelope } from 'react-icons/fa';

export default function ContactUsSidebar({ setActiveView, user, username }) {
  return (
    <div className="p-4 text-white flex flex-col h-full">
      <SidebarHeader 
        title="Contact Us"
        subtitle=""
        onBack={() => setActiveView('navigation')}
        username={user?.username || user?.name}
      />

      <div className="mt-4">
        <p className="text-sm">
          For technical help or blocked routes, or any feedback,
          please email us or reach out anytime!
        </p>
        <div className="mt-4 flex items-center space-x-2">
          <FaEnvelope />
          <a href="mailto:support@yourapp.com" className="underline">
            support@yourapp.com
          </a>
        </div>
          <p>TODO: INCOMPLETE WORK</p>
      </div>
    </div>
  );
}
