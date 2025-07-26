import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function FilterSelector({ selectedFilters, setSelectedFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [waypoints, setWaypoints] = useState([]);
  const [waypointInput, setWaypointInput] = useState('');

  const toggleOpen = () => setIsOpen(prev => !prev);

  const handleAddWaypoint = () => {
    if (waypointInput.trim()) {
      const newWp = waypointInput.trim();
      setWaypoints(prev => [...prev, newWp]);
      setWaypointInput('');
      setSelectedFilters(prev => [...prev, `Waypoint: ${newWp}`]);
    }
  };

  const handleRemoveWaypoint = idx => {
    const removed = waypoints[idx];
    setWaypoints(prev => prev.filter((_, i) => i !== idx));
    setSelectedFilters(prev => prev.filter(item => item !== `Waypoint: ${removed}`));
  };

  const handleRemoveTag = tag => {
    if (tag.startsWith('Waypoint: ')) {
      const wp = tag.replace('Waypoint: ', '');
      setWaypoints(prev => prev.filter(w => w !== wp));
    }
    setSelectedFilters(prev => prev.filter(item => item !== tag));
  };

  return (
    <div className="mt-4 relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full px-4 py-2 bg-gray-800 text-white font-semibold rounded flex justify-between items-center"
      >
        Filter Preference
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {isOpen && (
        <div className="w-full mt-1 bg-gray-300 bg-opacity-75 p-4 rounded shadow-lg">
          <h4 className="font-medium mb-2">Waypoints (optional)</h4>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={waypointInput}
              onChange={e => setWaypointInput(e.target.value)}
              placeholder="Enter waypoint address"
              className="w-3/4 px-3 py-2 border rounded bg-white text-black"
            />
            <button
              type="button"
              onClick={handleAddWaypoint}
              className="ml-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white"
            >
              Add
            </button>
          </div>
          {waypoints.length > 0 && (
            <ul className="list-disc list-inside text-sm max-h-32 overflow-auto">
              {waypoints.map((wp, idx) => (
                <li key={idx} className="flex justify-between items-center mb-1">
                  <span>{wp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWaypoint(idx)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
