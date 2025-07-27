export async function geocodePlace(placeName) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/geocode?q=${encodeURIComponent(placeName)}`);
  const data = await res.json();
  if (data.error) return null;

  return {
    lat: data.lat,
    lng: data.lng,
  };
}
