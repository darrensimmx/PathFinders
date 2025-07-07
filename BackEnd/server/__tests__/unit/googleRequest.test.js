const axios = require('axios');
const {snapToWalkingPath, getWalkingRoute} = require('../../utils/googleRequest'); 
const polyline = require('@mapbox/polyline');

jest.mock('axios'); //Tells Jest to replace the real axios w a mocked version

/******************************************************* UNIT TEST*************************************************/ 
describe('snapToWalkingPath', () => {
  const lat = 1.3521;
  const lng = 103.8198;

  //resets the mocked functions to a clean state after each test to ensure no leftover side effects btw tests
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return snapped coordinates when valid walking route is found', async () => {
    const mockStartLocation = { lat: 1.3522, lng: 103.8200 };
    axios.get.mockResolvedValue({ //mocks the returned value of axios.get
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

describe('getWalkingRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  })

  //Returns coordinate for valid route
  it('should return coordinates and distances for valid route', async () => {
    const origin = { lat: 1.3521, lng: 103.8198};
    const destination = { lat: 1.3525, lng: 103.8202};

    const mockPolyline = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
    const decodedPolyline = [
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453]
    ];
    const expectedCoords = decodedPolyline.map(([lat, lng]) => [lng, lat]);

    jest.mock('@mapbox/polyline', () => ({
      decode: () => decodedPolyline
    }));

    axios.get.mockResolvedValue({
      data: {
        routes: [
          {
            overview_polyline: { points: mockPolyline },
            legs: [
              { distance: { value: 500 } },
              { distance: { value: 800 } }
            ]
          }
        ]
      }
    });

    const result = await getWalkingRoute(origin, destination);
    expect(result).toEqual({
      coords: expectedCoords,
      dist: 1300
    });
  })
  //Returns null for no route
  it('should return null if no route returned', async () => {
    const origin = { lat: 1, lng: 1 };
    const destination = { lat: 2, lng: 2 };

    axios.get.mockResolvedValue({
      data: { routes: [] }
    });

    const result = await getWalkingRoute(origin, destination);
    expect(result).toBeNull();
  });

  //Return null & logs error if API call fails
  it('should return null and log error when API call fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('Request failed'));

    const result = await getWalkingRoute({ lat: 1, lng: 1 }, { lat: 2, lng: 2 });
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('getWalkingRoute error:', 'Request failed');
    consoleSpy.mockRestore();
  });
  //handle optional waypoints 
  it('should handle optional waypoints', async () => {
  const origin = { lat: 1.3521, lng: 103.8198 };
  const destination = { lat: 1.3540, lng: 103.8210 };
  const waypoints = [
    { lat: 1.3530, lng: 103.8200 },
    { lat: 1.3535, lng: 103.8205 }
  ];

  // Fake polyline decoding
  const decodedPolyline = [
    [1.3521, 103.8198],
    [1.3530, 103.8200],
    [1.3540, 103.8210]
  ];
  jest.spyOn(polyline, 'decode').mockImplementation(() => decodedPolyline);

  // Mock polyline.decode
  jest.mock('@mapbox/polyline', () => ({
    decode: () => decodedPolyline
  }));

  // Mock API response
  axios.get.mockResolvedValue({
    data: {
      routes: [
        {
          overview_polyline: { points: 'mocked_polyline_string' },
          legs: [{ distance: { value: 1000 } }]
        }
      ]
    }
  });

  // Import function under test
  const { getWalkingRoute } = require('../../utils/googleRequest'); // adjust if needed

  const result = await getWalkingRoute(origin, destination, waypoints);

  expect(axios.get).toHaveBeenCalledWith(
    'https://maps.googleapis.com/maps/api/directions/json',
    expect.objectContaining({
      params: expect.objectContaining({
        origin: '1.3521,103.8198',
        destination: '1.354,103.821',
        waypoints: '1.353,103.82|1.3535,103.8205',  // <-- This is the key part being tested
        mode: 'walking',
        key: expect.any(String)
      })
    })
  );

  expect(result).toEqual({
    coords: decodedPolyline.map(([lat, lng]) => [lng, lat]),
    dist: 1000
  });
});
})


