// BackEnd/server/tests/weatherCheck.test.js

const axios = require('axios');
jest.mock('axios');

const {
  sampleEvery2km,
  getWeatherWarnings
} = require('../utils/weatherCheck');

describe('sampleEvery2km', () => {
  it('picks points every 2 km along a straight line', () => {
    // create a polyline of 5 segments, each ~1km apart
    const coords = [];
    for (let i = 0; i <= 5; i++) {
      coords.push({ lat: i * 0.009, lng: 0 });
    }
    // total distance ~5km, so samples at ~2km and ~4km
    const samples = sampleEvery2km(coords);

    // expect roughly 2 sample points
    expect(samples.length).toBe(2);
    // they should be near coords[2] and coords[4]
    expect(samples[0]).toMatchObject(coords[2]);
    expect(samples[1]).toMatchObject(coords[4]);
  });
});

describe('getWeatherWarnings', () => {
  const goodHour = {
    time:           '1970-01-01 00:00',
    chance_of_rain: 0,
    chance_of_snow: 0,
    wind_kph:       0,
    condition:      { code: 1000, text: 'Clear' }
  };
  const badHour = {
    time:           '1970-01-01 01:00',
    chance_of_rain: 80,
    chance_of_snow: 0,
    wind_kph:       40,
    condition:      { code: 1003, text: 'Patchy rain' }
  };

  beforeAll(() => {
    process.env.WEATHERAPI_KEY = 'dummy-key';
    // force Date.now() = 0 so nextHourTs = 0, slice starts at idx 0
    jest.spyOn(Date, 'now').mockReturnValue(0);
  });

  afterAll(() => {
    delete process.env.WEATHERAPI_KEY;
    Date.now.mockRestore();
  });

  it('throws if WEATHERAPI_KEY is missing', async () => {
    delete process.env.WEATHERAPI_KEY;
    await expect(getWeatherWarnings([{ lat: 0, lng: 0 }]))
      .rejects
      .toThrow('WEATHERAPI_KEY is not set in environment');
    process.env.WEATHERAPI_KEY = 'dummy-key';
  });

  it('returns no warnings if all hours are good', async () => {
    // mock a single-point forecast with 6 good hours
    axios.get.mockResolvedValue({
      data: { forecast: { forecastday: [ { hour: Array(10).fill(goodHour) } ] } }
    });

    const warnings = await getWeatherWarnings([{ lat: 1, lng: 2 }]);
    expect(warnings).toEqual([]);
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.weatherapi.com/v1/forecast.json',
      expect.objectContaining({
        params: expect.objectContaining({ key: 'dummy-key', q: '1,2' })
      })
    );
  });

  it('returns warnings for hours matching bad weather', async () => {
    // mix good & bad hours
    const hours = [goodHour, badHour, goodHour, badHour, goodHour, goodHour, goodHour];
    axios.get.mockResolvedValue({
      data: { forecast: { forecastday: [ { hour: hours } ] } }
    });

    const pts = [{ lat: 3.3, lng: 4.4 }];
    const warnings = await getWeatherWarnings(pts);

    // should have one warning entry for our single point
    expect(warnings).toHaveLength(1);
    const w0 = warnings[0];
    expect(w0).toHaveProperty('lat', 3.3);
    expect(w0).toHaveProperty('lng', 4.4);
    // badHours should include only the 2 entries with rain/wind
    expect(w0.badHours).toHaveLength(2);
    expect(w0.badHours[0]).toMatchObject({ time: '1970-01-01 01:00', condition: 'Patchy rain' });
  });
});
