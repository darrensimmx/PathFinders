import { useReducer } from 'react';
import { FaChevronLeft } from 'react-icons/fa';

export default function SidebarHeader({ subtitle, onBack, user }) {
  return (
    <div className="sidebar-header">
      <div>
        <strong>Welcome {user?.name}</strong><br />
        <span>{subtitle}</span>
      </div>
      <button className="back-btn" onClick={onBack}>
        {subtitle !== 'Menu' ? <FaChevronLeft /> : null}
      </button>
    </div>
  );
}