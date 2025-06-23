function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
      <p>This is a Sidebar!</p>
    </aside>
  );
}

export default Sidebar;
