import NavigationSidebar from './Sidebar/NavigationSidebar'
import ProfileSidebar from './Sidebar/ProfileSidebar'
import SavedRoutesSidebar from './Sidebar/SavedRoutesSidebar'
import RouteGeneratorSidebar from './Sidebar/RouteGeneratorSidebar'
import ContactUsSidebar from './Sidebar/ContactUsSidebar'

function Sidebar({ isOpen, activeView, setActiveView, handleGenerate, routeMessage, routeDistance, loading, error, handleSaveRoute }) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
      {activeView === 'navigation' && <NavigationSidebar setActiveView={setActiveView} />}
      {activeView === 'profile' && <ProfileSidebar setActiveView={setActiveView} />}
      {activeView === 'savedRoutes' && <SavedRoutesSidebar setActiveView={setActiveView} />}
      {activeView === 'routeGenerator' && <RouteGeneratorSidebar 
          setActiveView={setActiveView} 
          handleGenerate={handleGenerate}
          routeMessage={routeMessage}
          routeDistance={routeDistance}
          loading={loading}
          error={error}
          onSave={handleSaveRoute}  
        />}
      {activeView === 'contact' && <ContactUsSidebar setActiveView={setActiveView} />}
    </aside>
  );
}

export default Sidebar;
