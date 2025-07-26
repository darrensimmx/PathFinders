import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import { FaEnvelope } from 'react-icons/fa';

export default function ContactUsSidebar({ setActiveView, user, username }) {
  const [contactType, setContactType] = useState('general');
  const [generalMsg, setGeneralMsg] = useState('');
  const [routePts, setRoutePts] = useState([]);
  const sendFeedback = () => {
    const email = 'support@pathfinders.com';
    if (contactType === 'general') {
      window.location.href = `mailto:${email}?subject=General Feedback&body=${encodeURIComponent(generalMsg)}`;
    } else {
      const body = routePts.map(pt => `${pt.lat},${pt.lng}`).join('\n');
      window.location.href = `mailto:${email}?subject=Route Feedback&body=${encodeURIComponent(body)}`;
    }
  };
  return (
    <div className="p-4 text-white flex flex-col h-full">
      <SidebarHeader
        title="Contact Us"
        subtitle=""
        onBack={() => setActiveView('navigation')}
        username={user?.username || user?.name}
      />
      <div className="mt-4 space-y-4">
        <p className="text-sm">
          Encountered a blocked path? Or want to help us improve? Share your thoughts below and we’ll follow up shortly.
        </p>
        <div>
          <label className="block text-sm font-medium mb-1">Feedback Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                value="route"
                checked={contactType === 'route'}
                onChange={() => setContactType('route')}
                className="form-radio"
              />
              <span className="text-sm">Route Feedback</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                value="general"
                checked={contactType === 'general'}
                onChange={() => setContactType('general')}
                className="form-radio"
              />
              <span className="text-sm">General Feedback</span>
            </label>
          </div>
        </div>
        {contactType === 'route' && (
          <div>
            <label className="block text-sm font-medium mb-1">Route Name / Location</label>
            <input
              type="text"
              value={generalMsg}
              onChange={e => setGeneralMsg(e.target.value)}
              placeholder=""
              className="w-full p-2 bg-gray-800 text-white rounded"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={4}
            value={generalMsg}
            onChange={e => setGeneralMsg(e.target.value)}
            placeholder=""
            className="w-full p-2 bg-gray-800 text-white rounded"
          />
        </div>
        <button
          type="button"
          onClick={sendFeedback}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Send Feedback via Email
        </button>
        <p className="text-xs text-gray-300">
          Note: Screenshots can be attached manually in your email.
        </p>
      </div>
    </div>
  );
}
