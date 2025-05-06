import { useState } from 'react';

export default function RouteForm({ onGenerate }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distance, setDistance] = useState(5);

  const handleSubmit = e => {
    e.preventDefault();
    onGenerate({ start, end, distance });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={start}
        onChange={e => setStart(e.target.value)}
        placeholder="Start"
        className="w-full border rounded px-2 py-1"
      />
      <input
        type="text"
        value={end}
        onChange={e => setEnd(e.target.value)}
        placeholder="End"
        className="w-full border rounded px-2 py-1"
      />
      <input
        type="number"
        value={distance}
        onChange={e => setDistance(+e.target.value)}
        min={1}
        placeholder="Distance (km)"
        className="w-full border rounded px-2 py-1"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Generate Route
      </button>
    </form>
  );
}

