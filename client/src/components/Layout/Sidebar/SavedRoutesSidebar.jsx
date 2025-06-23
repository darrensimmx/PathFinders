import BackBtn from '../../Assets/BackBtn.png'
import SidebarHeader from './SidebarHeader';

export default function SavedRoutesSidebar({ setActiveView }) {
  return (
    <div className="savedRoutes-sidebar">
      
      <SidebarHeader 
        subtitle="Saved Routes"
        onBack={() => setActiveView('navigation')}
      />

      <p>TODO: fill with routes and backend logic</p>
    </div>
  );
}
