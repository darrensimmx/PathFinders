import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import { FaEnvelope } from 'react-icons/fa';
import html2canvas from 'html2canvas';

export default function ContactUsSidebar({ setActiveView, user, username }) {
  const [contactType, setContactType] = useState('general');
  const [routeName, setRouteName] = useState('');
  const [generalMsg, setGeneralMsg] = useState('');
  const [routePts, setRoutePts] = useState([]);
  const sendFeedback = async () => {
    try {
      if (contactType === 'route') {
        // Capture map screenshot, copy to clipboard, then open mailto so user can paste in email
        const mapEl = document.querySelector('.leaflet-container') || document.querySelector('.map-wrapper');
        const canvas = await html2canvas(mapEl);
        // Convert canvas to blob
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        // Copy image to clipboard for user to paste
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          alert('Screenshot copied to clipboard. You can paste it in your email.');
        } catch (e) {
          // fallback ignored
        }
        const pointsText = routePts.map((pt, idx) =>
          `Point ${idx + 1}: ${pt.lat.toFixed(5)}, ${pt.lng.toFixed(5)}`
        ).join('\n');
        const body = `Route: ${routeName}\nPoints:\n${pointsText}`;
        const mailto = `mailto:support@pathfinders.com?subject=${encodeURIComponent('Route Feedback')}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
      } else {
        const mailto = `mailto:support@pathfinders.com?subject=${encodeURIComponent('General Feedback')}&body=${encodeURIComponent(generalMsg)}`;
        window.location.href = mailto;
      }
    } catch (e) {
      console.error('Feedback error', e);
      alert('Failed to open email client.');
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
              value={routeName}
              onChange={e => setRouteName(e.target.value)}
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
          Send Feedback
        </button>
        <p className="text-xs text-gray-300">
          Note: Screenshots can be attached manually in your email.
        </p>
      </div>
    </div>
  );
}
