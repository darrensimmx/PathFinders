import { FaChevronLeft } from 'react-icons/fa';

export default function SidebarHeader({ subtitle, onBack }) {
  return (
    <div className="sidebar-header">
      <div>
        <strong>Welcome User</strong><br />
        <span>{subtitle}</span>
      </div>
      <button className="back-btn" onClick={onBack}>
        {subtitle !== 'Menu' ? <FaChevronLeft /> : null}
      </button>
    </div>
  );
}