import React, { useState, useRef } from 'react';
import SidebarHeader from './SidebarHeader';
import RouteForm from '../../Route/RouteForm';
import FilterSelector from './FilterSelector';
import RouteMessagePanel from '../../Route/RouteMessagePanel';
import { FaCommentDots } from 'react-icons/fa';

export default function RouteGeneratorSidebar({
  handleGenerate,
  setActiveView,
  routeMessage,
  routeDistance,
  loading,
  error,
  success,
  onSave,
  currentGeneratedRoute,
  samplesEvery2km,
  weatherWarnings,
  user
}) {
  const [filters, setFilters] = useState([]);
  const availableFilters = ['Elevation 15%', 'GBTB', 'No Traffic Light'];
  const formRef = useRef();

    const onFormSubmit = (formData) => {
      // Separate waypoint tags from other filters
      const waypointTags = filters.filter(tag => tag.startsWith('Waypoint: '));
      const waypoints = waypointTags.map(tag => tag.replace('Waypoint: ', ''));
      const normalFilters = filters.filter(tag => !tag.startsWith('Waypoint: '));
      console.log("Generating with:", formData, { waypoints, filters: normalFilters });
      // Pass waypoints inside formData for backend geocoding, and normal filters separately
      handleGenerate({ ...formData, waypoints }, normalFilters);
    };

  return (
    <div className="p-4 text-white flex flex-col h-full w-full">
      <SidebarHeader
        subtitle="Route Generator"
        onBack={() => setActiveView('navigation')}
        user={user}
        username={user?.username || user?.name}
      />

      <RouteForm onGenerate={onFormSubmit} ref={formRef} />

      <FilterSelector
        availableFilters={availableFilters}
        selectedFilters={filters}
        setSelectedFilters={setFilters}
      />
      {/* Generate Route button moved below FilterSelector */}
      <button
        type="button"
        onClick={() => formRef.current?.requestSubmit()}
        className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Generate Route
      </button>

      <div className="mt-6">
        <RouteMessagePanel
          message={routeMessage}
          distance={routeDistance}
          loading={loading}
          error={error}
          success={success}
          onSave={() => onSave(currentGeneratedRoute)}
          currentGeneratedRoute={currentGeneratedRoute}
        />
      </div>

      <div className="mt-auto pt-4 border-t border-gray-600">
        <div className="flex items-center mb-1">
          <FaCommentDots className="mr-2" />
          <strong>Contact Us</strong>
        </div>
        <p className="text-sm text-gray-300">
          For technical help or blocked routes, feedbacks are always welcome!
        </p>
      </div>
    </div>
  );
}
