import { TiThMenu } from "react-icons/ti";
import PathFinderIcon from '../Assets/PathFinder_icon.png';
import { RiLogoutBoxFill } from "react-icons/ri"
import React from 'react';

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
        {<TiThMenu size={30}/>}
      </button>
      <div className='logo'>
        <img src={PathFinderIcon} alt="PathFinder Logo" />
      </div>
      <button className="logout" onClick={handleLogout}>
        {<RiLogoutBoxFill size={30}/>}
      </button>
    </header>
  );
}

export default Header;