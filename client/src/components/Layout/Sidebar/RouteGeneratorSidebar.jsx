// client/src/components/Layout/Sidebar/RouteGeneratorSidebar.jsx

import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import RouteForm from '../../Route/RouteForm';
import FilterSelector from './FilterSelector';
import WeatherWarningSidebar from './WeatherWarningSidebar';
import RouteMessagePanel from '../../Route/RouteMessagePanel';
import { FaCommentDots } from 'react-icons/fa';

export default function RouteGeneratorSidebar({
  handleGenerate,
  setActiveView,
  routeMessage,
  routeDistance,
  loading,
  error,
  onSave,
  currentGeneratedRoute,
  samplesEvery2km,
  weatherWarnings,
  user
}) {
  const [filters, setFilters] = useState([]);
  const availableFilters = ['Elevation 15%', 'GBTB', 'No Traffic Light'];

  const onFormSubmit = (formData) => {
    handleGenerate(formData, filters);
  };

  return (
    <div className="p-4 text-white flex flex-col h-full w-full">
      <SidebarHeader
        subtitle="Route Generator"
        onBack={() => setActiveView('navigation')}
        user={user}
      />

      <RouteForm onGenerate={onFormSubmit} />

      <FilterSelector
        availableFilters={availableFilters}
        selectedFilters={filters}
        setSelectedFilters={setFilters}
      />

      <div className="mt-4">
        <WeatherWarningSidebar
          samplesEvery2km={samplesEvery2km}
          weatherWarnings={weatherWarnings}
        />
      </div>

      <div className="mt-6">
        <RouteMessagePanel
          message={routeMessage}
          distance={routeDistance}
          loading={loading}
          error={error}
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
