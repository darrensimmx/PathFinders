import React from 'react';
import SavedRouteCard from './SavedRouteCard';
import SidebarHeader from './SidebarHeader';
import MiniMap from '../../Route/MiniMap';

function SavedRoutesSidebar({ setActiveView, routes, onClearAll, onDeleteRoute, onSave, currentGeneratedRoute, user, onSelectRoute }) {

  const handleClearAll = () => {
  const confirmClear = window.confirm("Are you sure you want to clear all saved routes?");
  if (confirmClear) {
      onClearAll();
    }
  };

  return (
    <div className='saved-routes-content'>
      <SidebarHeader 
        subtitle="Saved Routes"
        onBack={() => setActiveView('navigation')}
        user={user}
        username={user?.username || user?.name}
      />
      <h4>Saved Routes (Up to 5!)</h4>

      <div className="routes-list">
        {routes.length === 0 ? (
          <p>No saved routes yet.</p>
        ) : (
          routes.slice(0, 5).map((route, idx) => (
            <SavedRouteCard
              key={route._id || idx}
              route={route}
              onDelete={() => onDeleteRoute(route._id)}
              onClick={() => onSelectRoute(route)} // <- PASS CLICK EVENT
            />
          ))
        )}
      </div>

      {routes.length > 0 && (
        <button className="clear-btn" onClick={handleClearAll}>
          Clear All
        </button>
      )}
    </div>
  );
}

export default SavedRoutesSidebar;
