import BackBtn from '../../Assets/BackBtn.png'
import Avatar from '../../Assets/Avatar.png'
import SidebarHeader from './SidebarHeader';

export default function ProfileSidebar({ setActiveView }) {
  return (
    <div className="profile-sidebar">
      
      <SidebarHeader 
        subtitle="Profile Page"
        onBack={() => setActiveView('navigation')}
      />

      <img src={Avatar} alt="Profile Picture" />
      <p>Name: Anne</p>
      <p>Email: anne@example.com</p>
      <p>TODO: let them edit and also reflects the login stuff</p>
    </div>
  );
}
