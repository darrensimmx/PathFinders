export async function geocode(location) {
    const apiKey = '71258f892f8443028318585b67df61c2';
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}&limit=1`;
  
    const res = await fetch(url);
    const data = await res.json();
  
    if (!data.results.length) throw new Error("No results found for " + location);
  
    const { lat, lng } = data.results[0].geometry;
    return { lat, lng };
  }
  