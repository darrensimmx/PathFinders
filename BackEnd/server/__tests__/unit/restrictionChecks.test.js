const turf = require('@turf/turf');
const fs = require('fs');
const path = require('path');

jest.mock('fs');
jest.mock('path');

const mockRestrictedZone = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [103.80, 1.28],
      [103.85, 1.28],
      [103.85, 1.31],
      [103.80, 1.31],
      [103.80, 1.28]
    ]]
  }
};

fs.readFileSync.mockReturnValue(
  JSON.stringify({
    type: 'FeatureCollection',
    features: [mockRestrictedZone]
  })
);

let isPointInRestrictedArea, isRouteInRestrictedArea;

beforeAll(() => {
  jest.isolateModules(() => {
    const restricted = require('../../utils/restrictionChecks');
    isPointInRestrictedArea = restricted.isPointInRestrictedArea;
    isRouteInRestrictedArea = restricted.isRouteInRestrictedArea;
  });
});

describe('isPointInRestrictedArea', () => {
  it('returns true for point inside restricted zone', () => {
    const result = isPointInRestrictedArea({ lat: 1.29, lng: 103.82 });
    expect(result).toBe(true);
  });

  it('returns false for point outside restricted zone', () => {
    const result = isPointInRestrictedArea({ lat: 1.35, lng: 103.90 });
    expect(result).toBe(false);
  });
});

describe('isRouteInRestrictedArea', () => {
  it('returns true if any point is in restricted zone', () => {
    const route = [
      [103.90, 1.35], // outside
      [103.82, 1.29]  // inside
    ];
    const result = isRouteInRestrictedArea(route);
    expect(result).toBe(true);
  });

  it('returns false if all points are outside restricted zone', () => {
    const route = [
      [103.90, 1.35],
      [103.91, 1.36]
    ];
    const result = isRouteInRestrictedArea(route);
    expect(result).toBe(false);
  });
});
