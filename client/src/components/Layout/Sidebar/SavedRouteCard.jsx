import React from 'react';
import { FaMapMarkedAlt, FaTrash } from 'react-icons/fa';

function SavedRouteCard({ route, onDelete }) {
  if (!route) return null;
  
  return (
    <div className="saved-route-card">
      <FaMapMarkedAlt size={40} /> 

      <div className="route-details">
        <p><strong>{route.name}</strong></p>
        <p>
          Start: [{route.startPoint.coordinates.join(', ')}]
        </p>
        <p>
          End: {route.endPoint ? `[${route.endPoint.coordinates.join(', ')}]` : 'N/A'}
        </p>
        <p>Distance: {route.distance} km</p>
        <p>Type: {route.type}</p>
      </div>

      <button className="delete-btn" onClick={onDelete}><FaTrash size={40}/></button>
    </div>
  );
}

export default SavedRouteCard;
