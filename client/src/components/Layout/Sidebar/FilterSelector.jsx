import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import FilterRadioGroup from './FilterRadioGroup';

export default function FilterSelector({
  selectedFilters,
  setSelectedFilters
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [terrain, setTerrain] = useState('');
  const [elevation, setElevation] = useState('');
  const [landmarkSearch, setLandmarkSearch] = useState('');

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleApply = () => {
    const newFilters = [];
    if (terrain) newFilters.push(`Terrain: ${terrain}`);
    if (elevation) newFilters.push(`Elevation: ${elevation}`);
    if (landmarkSearch) newFilters.push(`Landmark: ${landmarkSearch}`);

     setSelectedFilters(prev => {
      const merged = [...prev];
      newFilters.forEach(item => {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    });
    return merged;
  });
    //Clear form each time we submit
    setTerrain('');
    setElevation('');
    setLandmarkSearch('');
    setIsOpen(false);
  };

  const handleRemove = (item) => {
    setSelectedFilters(prev => {
      const idx = prev.indexOf(item);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
  });

};


  return (
    <div className="mt-4">
      {/* Toggle */}
      <button
        type="button"
        onClick={toggleOpen}
        className="
          w-full px-4 py-2
          bg-[#302b63] text-white font-semibold
          rounded flex justify-between items-center
        "
      >
        Filter Preference
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="bg-gray-100 text-gray-800 p-4 mt-2 rounded space-y-4">
          <FilterRadioGroup
            label="Terrain Type"
            options={['Pavement', 'Trail', 'Mixed']}
            name="terrain"
            value={terrain}
            onChange={setTerrain}
          />

          <FilterRadioGroup
            label="Elevation"
            options={['Low', 'Medium', 'High']}
            name="elevation"
            value={elevation}
            onChange={setElevation}
          />

          {/* Landmark */}
          <div>
            <h4 className="font-medium mb-1">Landmarks</h4>
            <input
              type="text"
              value={landmarkSearch}
              onChange={e => setLandmarkSearch(e.target.value)}
              placeholder="Search"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="w-full py-2 bg-[#302b63] text-white font-semibold rounded"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Applied Tags */}
      <div className="flex flex-wrap mt-2 gap-2">
        {selectedFilters.map(item => (
          <span
            key={item}
            className="bg-red-500 text-white px-3 py-1 rounded flex items-center"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="ml-2 font-bold"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
