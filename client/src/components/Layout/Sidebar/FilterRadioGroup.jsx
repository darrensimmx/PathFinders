import React from 'react';

export default function FilterRadioGroup({ label, options, name, value, onChange }) {
  return (
    <div>
      <h4 className="font-medium mb-1">{label}</h4>
      {options.map(option => (
        <label key={option} className="block">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={e => onChange(e.target.value)}
            className="mr-2"
          />
          {option}
        </label>
      ))}
    </div>
  );
}
