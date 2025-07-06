// BackEnd/server/tests/weatherCheck.test.js

// load the .env so WEATHERAPI_KEY is available
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const axios = require('axios');
jest.mock('axios');

const {
  sampleEvery2km,
  getWeatherWarnings
} = require('../../utils/weatherCheck');

// remember original key so we can restore it after unit tests
const originalKey = process.env.WEATHERAPI_KEY;

describe('sampleEvery2km', () => {
  it('samples points at ~2km and ~4km on a 5km straight line', () => {
    const coords = [];
    for (let i = 0; i <= 5; i++) {
      coords.push({ lat: i * 0.009, lng: 0 });
    }
    const samples = sampleEvery2km(coords);
    expect(samples.length).toBe(2);
    expect(samples[0]).toMatchObject(coords[2]);
    expect(samples[1]).toMatchObject(coords[4]);
  });
});

describe('getWeatherWarnings (unit)', () => {
  const clearHour = {
    time: '1970-01-01 00:00',
    chance_of_rain: 0,
    chance_of_snow: 0,
    wind_kph: 0,
    condition: { code: 1000, text: 'Clear' }
  };
  const stormHour = {
    time: '1970-01-01 01:00',
    chance_of_rain: 80,
    chance_of_snow: 0,
    wind_kph: 40,
    condition: { code: 1003, text: 'Patchy rain' }
  };

  beforeAll(() => {
    // if there was no real key, use dummy for unit tests
    if (!originalKey) {
      process.env.WEATHERAPI_KEY = 'dummy-key';
    }
    jest.spyOn(Date, 'now').mockReturnValue(0);
  });

  afterAll(() => {
    // restore whatever was originally in process.env
    if (originalKey) {
      process.env.WEATHERAPI_KEY = originalKey;
    } else {
      delete process.env.WEATHERAPI_KEY;
    }
    Date.now.mockRestore();
  });

  it('errors when no API key present', async () => {
    delete process.env.WEATHERAPI_KEY;
    await expect(getWeatherWarnings([{ lat: 0, lng: 0 }]))
      .rejects
      .toThrow('WEATHERAPI_KEY is not set in environment');
    // put dummy back for the rest
    process.env.WEATHERAPI_KEY = 'dummy-key';
  });

  it('returns [] when all hours clear', async () => {
    axios.get.mockResolvedValue({
      data: { forecast: { forecastday: [ { hour: Array(10).fill(clearHour) } ] } }
    });
    const warnings = await getWeatherWarnings([{ lat: 1, lng: 2 }]);
    expect(warnings).toEqual([]);
  });

  it('filters and returns only bad‐weather hours', async () => {
    const hours = [clearHour, stormHour, clearHour, stormHour, clearHour];
    axios.get.mockResolvedValue({
      data: { forecast: { forecastday: [ { hour: hours } ] } }
    });
    const warnings = await getWeatherWarnings([{ lat: 3.3, lng: 4.4 }]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].badHours).toHaveLength(2);
  });
});

// decide whether to run functional tests
const hasRealKey = Boolean(originalKey);
const describeFunc = hasRealKey ? describe : describe.skip;

describeFunc('getWeatherWarnings (functional)', () => {
  let realGetWeatherWarnings;

  beforeAll(() => {
    jest.unmock('axios');
    jest.resetModules();
    realGetWeatherWarnings = require('../../utils/weatherCheck').getWeatherWarnings;
  });

  it('fetches live data and returns structured warnings', async () => {
    const warnings = await realGetWeatherWarnings([{ lat: 1.3521, lng: 103.8198 }]);
    expect(Array.isArray(warnings)).toBe(true);
    warnings.forEach(w => {
      expect(typeof w.lat).toBe('number');
      expect(typeof w.lng).toBe('number');
      expect(Array.isArray(w.badHours)).toBe(true);
    });
  });
});
