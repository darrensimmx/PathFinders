/******************************************************* UNIT TEST*************************************************/ 

const {metreToDeg, rectangleCorners, haversineDistance} = require('../../utils/geoUtils')

describe('metreToDeg', () => {
  it('should return the correct degree conversion near equator', () => {
    const { dLat, dLng } = metreToDeg(1000, 0); // 1000m at 0° latitude
    expect(dLat).toBeCloseTo(0.00904, 5); 
    expect(dLng).toBeCloseTo(0.008975, 5);
  })

  it('should return smaller dLng at higher latitudes (due to Earth curvature)', () => {
    const resultEquator = metreToDeg(1000, 0);    // ~0.008975
    const resultMidLat  = metreToDeg(1000, 45);   // ~0.01269
    const resultPole    = metreToDeg(1000, 90);   // ~0

    expect(resultEquator.dLng).toBeLessThan(resultMidLat.dLng); 
    expect(resultMidLat.dLng).toBeGreaterThan(resultPole.dLng);
  });
})

describe('rectangleCorners', () => {
  it('should return correct rectangle points for basic north-east offset', () => {
    const origin = { lat: 1.0, lng: 103.0 };
    const corners = rectangleCorners(origin, 0.01, 0.02, 1, 1);

    expect(corners).toEqual([
      { lat: 1.0, lng: 103.0 },            // A
      { lat: 1.01, lng: 103.0 },           // B = A + vertical
      { lat: 1.01, lng: 103.02 },          // C = B + horizontal
      { lat: 1.0, lng: 103.02 }            // D = A + horizontal
    ]);
  });

  it('should handle negative signs for south-west offset', () => {
    const origin = { lat: 1.0, lng: 103.0 };
    const corners = rectangleCorners(origin, 0.01, 0.02, -1, -1);

    expect(corners).toEqual([
      { lat: 1.0, lng: 103.0 },
      { lat: 0.99, lng: 103.0 },
      { lat: 0.99, lng: 102.98 },
      { lat: 1.0, lng: 102.98 }
    ]);
  });
})



describe('haversineDistance', () => {
  it('should return 0 for identical points', () => {
    const point = { lat: 1.0, lng: 103.0 };
    const dist = haversineDistance(point, point);
    expect(dist).toBeCloseTo(0);
  });

  it('should calculate correct distance between two known points', () => {
    const a = { lat: 1.3521, lng: 103.8198 };  // Singapore
    const b = { lat: 1.2903, lng: 103.8519 };  // Marina Bay

    const dist = haversineDistance(a, b);
    expect(dist).toBeGreaterThan(6000); // should be ~7-8 km
    expect(dist).toBeLessThan(9000);
  });

  it('should be symmetric: dist(a, b) == dist(b, a)', () => {
    const a = { lat: 10.0, lng: 20.0 };
    const b = { lat: 15.0, lng: 25.0 };
    const d1 = haversineDistance(a, b);
    const d2 = haversineDistance(b, a);
    expect(d1).toBeCloseTo(d2);
  });
});