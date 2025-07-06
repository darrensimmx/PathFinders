/******************************************************* UNIT TEST*************************************************/ 
const turf = require('@turf/turf');
jest.mock('fs');
jest.mock('path');

const fs = require('fs');
const path = require('path');

const mockLandGeoJSON = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [103.80, 1.28],
        [103.85, 1.28],
        [103.85, 1.31],
        [103.80, 1.31],
        [103.80, 1.28]
      ]
    ]
  }
};

// Setup mock fs.readFileSync to return the mock GeoJSON
fs.readFileSync.mockImplementation(() =>
  JSON.stringify(mockLandGeoJSON)
);

// Re-require the module AFTER the mocks are set up
const {isOnLand} = require('../../utils/landChecks')

describe('isOnLand (with mock GeoJSON)', () => {
  it('should return true for a point inside the land polygon', () => {
    const result = isOnLand(1.29, 103.82, mockLandGeoJSON);
    expect(result).toBe(true);
  });

  it('should return false for a point outside the land polygon', () => {
    const result = isOnLand(1.35, 103.90, mockLandGeoJSON);
    expect(result).toBe(false);
  });

  it('should return true for a point on the polygon border', () => {
    const result = isOnLand(1.28, 103.80, mockLandGeoJSON);
    expect(result).toBe(true);
  });
});
