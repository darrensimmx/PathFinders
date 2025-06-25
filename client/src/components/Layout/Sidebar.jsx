// client/src/components/Layout/Sidebar.jsx

import React from 'react';
import NavigationSidebar     from './Sidebar/NavigationSidebar';
import ProfileSidebar        from './Sidebar/ProfileSidebar';
import SavedRoutesSidebar    from './Sidebar/SavedRoutesSidebar';
import RouteGeneratorSidebar from './Sidebar/RouteGeneratorSidebar';
import ContactUsSidebar      from './Sidebar/ContactUsSidebar';

function Sidebar({
  isOpen,
  activeView,
  setActiveView,
  handleGenerate,
  routeMessage,
  routeDistance,
  loading,
  error,
  handleSaveRoute,
  routes,
  onClearAll,
  onDeleteRoute,
  currentGeneratedRoute,
  samplesEvery2km,
  weatherWarnings
}) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
      {activeView === 'navigation' && <NavigationSidebar setActiveView={setActiveView} />}
      {activeView === 'profile'    && <ProfileSidebar setActiveView={setActiveView} />}
      {activeView === 'savedRoutes' && (
        <SavedRoutesSidebar
          setActiveView={setActiveView}
          onClearAll={onClearAll}
          routes={routes}
          onDeleteRoute={onDeleteRoute}
          onSave={() => handleSaveRoute(currentGeneratedRoute)}
          currentGeneratedRoute={currentGeneratedRoute}
        />
      )}

      {activeView === 'routeGenerator' && (
        <RouteGeneratorSidebar
          setActiveView={setActiveView}
          handleGenerate={handleGenerate}
          routeMessage={routeMessage}
          routeDistance={routeDistance}
          loading={loading}
          error={error}
          onSave={() => handleSaveRoute(currentGeneratedRoute)}
          currentGeneratedRoute={currentGeneratedRoute}
          samplesEvery2km={samplesEvery2km}        // pass in samples
          weatherWarnings={weatherWarnings}        // pass in warnings
        />
      )}

      {activeView === 'contact' && <ContactUsSidebar setActiveView={setActiveView} />}
    </aside>
  );
}

export default Sidebar;
