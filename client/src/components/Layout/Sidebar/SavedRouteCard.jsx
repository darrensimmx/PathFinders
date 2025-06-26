import React from 'react';
import { FaTrash } from 'react-icons/fa';
import MiniMap from '../../Route/MiniMap';
import './SavedRouteCard.css'

function SavedRouteCard({ route, onDelete, onClick }) {
  if (!route) return null;
  
  return (
    <div className="route-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="route-card-header">
        <span className="route-title">{route.name}</span>
        <button className="delete-btn" onClick={(e) => {
          e.stopPropagation(); // prevent triggering onClick
          onDelete();
        }}><FaTrash/></button>
      </div>

      <div className="route-card-body">
        <MiniMap coordinates={route.coordinates} />
        <div className="route-info">
          <p><strong>Start:</strong> [{route.startPoint?.coordinates?.join(', ')}]</p>
          <p><strong>End:</strong> [{route.endPoint?.coordinates?.join(', ')}]</p>
          <p><strong>Distance:</strong> {route.distance} km</p>
          <p><strong>Type:</strong> {route.name?.includes('Loop') ? 'Loop' : 'Point-to-Point'}</p>
        </div>
      </div>
    </div>
  );

}

export default SavedRouteCard;
