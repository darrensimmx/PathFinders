const axios = require('axios');
const snapToWalkingPath = require('../utils/googleRequest'); // adjust path

jest.mock('axios');

describe('snapToWalkingPath', () => {
  const lat = 1.3521;
  const lng = 103.8198;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return snapped coordinates when valid walking route is found', async () => {
    const mockStartLocation = { lat: 1.3522, lng: 103.8200 };
    axios.get.mockResolvedValue({
      data: {
        routes: [
          {
            legs: [
              {
                steps: [
                  { start_location: mockStartLocation }
                ]
              }
            ]
          }
        ]
      }
    });

    const result = await snapToWalkingPath(lat, lng);
    expect(result).toEqual(mockStartLocation);
  });

  it('should return null when no steps are returned', async () => {
    axios.get.mockResolvedValue({
      data: {
        routes: [
          {
            legs: [
              {
                steps: []
              }
            ]
          }
        ]
      }
    });

    const result = await snapToWalkingPath(lat, lng);
    expect(result).toBeNull();
  });

  it('should return null when response structure is missing', async () => {
    axios.get.mockResolvedValue({ data: {} });

    const result = await snapToWalkingPath(lat, lng);
    expect(result).toBeNull();
  });

  it('should return null and log error when axios throws', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('API failure'));

    const result = await snapToWalkingPath(lat, lng);
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `snapToWalkingPath error for (${lat}, ${lng}):`,
      'API failure'
    );
    consoleErrorSpy.mockRestore();
  });
});
