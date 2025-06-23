export default function SidebarItem({ icon, title, subtitle, onClick }) {
  return (
    <div className="nav-item" onClick={onClick}>
      {icon}
      <div className="nav-text">
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}