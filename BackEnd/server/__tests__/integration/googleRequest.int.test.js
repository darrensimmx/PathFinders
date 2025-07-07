/******************************************************* INTEGRATION TEST*************************************************/ 
// Reason why this is here instead of same file is because we cannot mock axios, there is no way to seperate mocking or not in the same file

const { getWalkingRoute } = require('../../utils/googleRequest');

describe('[INTEGRATION] getWalkingRoute (real Google Maps)', () => {
  it('should return valid coords and distance from real API', async () => {
    const origin = { lat: 1.3521, lng: 103.8198 }; // Singapore
    const destination = { lat: 1.3540, lng: 103.8210 };

    const result = await getWalkingRoute(origin, destination);

    // Real output might vary slightly — be flexible
    expect(result).toHaveProperty('coords');
    expect(result).toHaveProperty('dist');
    expect(Array.isArray(result.coords)).toBe(true);
    expect(typeof result.dist).toBe('number');
    expect(result.dist).toBeGreaterThan(0);
  });
});


const { snapToWalkingPath } = require('../../utils/googleRequest');

describe('[INTEGRATION] snapToWalkingPath (real Google Maps)', () => {
  it('should return a snapped coordinate near a valid walking path', async () => {
    const lat = 1.3521;
    const lng = 103.8198;

    const result = await snapToWalkingPath(lat, lng);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('lat');
    expect(result).toHaveProperty('lng');
    expect(typeof result.lat).toBe('number');
    expect(typeof result.lng).toBe('number');
  });
});