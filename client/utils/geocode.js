export async function geocode(location) {
  const apiKey = '71258f892f8443028318585b67df61c2';

  if (typeof location !== 'string') {
    throw new Error(`Invalid location input: expected string but got ${typeof location}`);
  }

  const trimmed = location.trim();
  const fallback = /^\d{6}$/.test(trimmed)
    ? `${trimmed}, Singapore`
    : `${trimmed} Singapore`;

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(fallback)}&key=${apiKey}&limit=1&countrycode=sg`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding API failed');

  const data = await res.json();
  if (!data.results.length) throw new Error("No results found for " + location);

  const { lat, lng } = data.results[0].geometry;
  return { lat, lng };
}
