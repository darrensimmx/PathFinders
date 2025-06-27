export default function SidebarItem({ icon, title, subtitle, onClick }) {
  return (
    <div className="nav-item" onClick={onClick}>
      <div className="nav-icon">{icon}</div>
      <div className="nav-text">
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}