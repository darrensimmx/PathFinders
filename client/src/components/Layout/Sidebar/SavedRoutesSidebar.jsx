import React from 'react';
import SavedRouteCard from './SavedRouteCard';
import SidebarHeader from './SidebarHeader';

function SavedRoutesSidebar({ setActiveView, routes, onClearAll, onDeleteRoute, onSave, currentGeneratedRoute, user }) {

  const handleClearAll = () => {
  const confirmClear = window.confirm("Are you sure you want to clear all saved routes?");
  if (confirmClear) {
      onClearAll();
    }
  };

  return (
    <aside className="sidebar">
      <SidebarHeader 
        subtitle="Saved Routes"
        onBack={() => setActiveView('navigation')}
        user={user}
      />

      <div className="routes-list">
        {routes.length === 0 ? (
          <p>No saved routes yet.</p>
        ) : (
          routes.slice(0, 5).map((route, idx) => (
            <>
            {console.log('Rendering route:', route)}
            <SavedRouteCard
              key={route._id || idx}
              route={route}
              onDelete={() => onDeleteRoute(route._id)}
            />
            </>
          ))
        )}
      </div>

      {routes.length > 0 && (
        <button className="clear-btn" onClick={handleClearAll}>
          Clear All
        </button>
      )}
    </aside>
  );
}

export default SavedRoutesSidebar;
