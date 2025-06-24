import NavigationSidebar from './Sidebar/NavigationSidebar'
import ProfileSidebar from './Sidebar/ProfileSidebar'
import SavedRoutesSidebar from './Sidebar/SavedRoutesSidebar'
import RouteGeneratorSidebar from './Sidebar/RouteGeneratorSidebar'
import ContactUsSidebar from './Sidebar/ContactUsSidebar'

//TODO: Use React Context to prevent Prop Drilling
function Sidebar({ isOpen, activeView, setActiveView, handleGenerate, routeMessage, routeDistance, loading, error, handleSaveRoute, routes, onClearAll, onDeleteRoute, currentGeneratedRoute }) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
      {activeView === 'navigation' && <NavigationSidebar setActiveView={setActiveView} />}
      {activeView === 'profile' && <ProfileSidebar setActiveView={setActiveView} />}
      {activeView === 'savedRoutes' && <SavedRoutesSidebar setActiveView={setActiveView}
        onClearAll={onClearAll}
        routes={routes}
        onDeleteRoute={onDeleteRoute}
        onSave={() => handleSaveRoute(currentGeneratedRoute)}
        currentGeneratedRoute={currentGeneratedRoute}
      />}


      {activeView === 'routeGenerator' && <RouteGeneratorSidebar
        setActiveView={setActiveView}
        handleGenerate={handleGenerate}
        routeMessage={routeMessage}
        routeDistance={routeDistance}
        loading={loading}
        error={error}
        onSave={() => handleSaveRoute(currentGeneratedRoute)}
        currentGeneratedRoute={currentGeneratedRoute}
      />}
      {activeView === 'contact' && <ContactUsSidebar setActiveView={setActiveView} />}
    </aside>
  );
}

export default Sidebar;
