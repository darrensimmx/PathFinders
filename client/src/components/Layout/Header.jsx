import MenuIcon from '../Assets/Menu.png';
import PathFinderIcon from '../Assets/PathFinder_icon.png';
import LogOutIcon from '../Assets/LogOutBtn.png';

import { useNavigate } from 'react-router-dom';

function Header({ toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth if needed
    // Redirect to login page ("/")
    navigate('/');
  };

  return (
    <header className="header">
      <button className="hamburger" onClick={toggleSidebar}>
        <img src={MenuIcon} alt="Menu" />
      </button>
      <div className='logo'>
        <img src={PathFinderIcon} alt="PathFinder Logo" />
      </div>
      <button className="logout" onClick={handleLogout}>
        <img src={LogOutIcon} alt="Logout" /> 
      </button>
    </header>
  );
}

export default Header;