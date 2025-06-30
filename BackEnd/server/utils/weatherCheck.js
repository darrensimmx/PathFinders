// BackEnd/server/utils/weatherCheck.js

// load the .env so WEATHERAPI_KEY is available
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

const axios = require('axios');

/**
 * Compute straight-line distance (meters) between two { lat, lng } points.
 */
function haversineDistance(pointA, pointB) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters

  const dLat = toRad(pointB.lat - pointA.lat);
  const dLng = toRad(pointB.lng - pointA.lng);
  const rLat1 = toRad(pointA.lat);
  const rLat2 = toRad(pointB.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Given an ordered array of coords (each { lat, lng }),
 * return those coords where cumulative distance crosses each 2000 m mark.
 */
function sampleEvery2km(routeCoords) {
  const samples = [];
  let nextThreshold = 2000;
  let accumulated = 0;

  for (let i = 1; i < routeCoords.length; i++) {
    accumulated += haversineDistance(routeCoords[i - 1], routeCoords[i]);
    if (accumulated >= nextThreshold) {
      samples.push(routeCoords[i]);
      nextThreshold += 2000;
    }
  }

  return samples;
}

/**
 * Returns true if the hour-forecast indicates bad weather:
 *  • chance_of_rain >= 50%
 *  • chance_of_snow >= 50%
 *  • wind_kph >= 30
 *  • condition.code between 200–233 (thunderstorm)
 */
function isBadWeather(hour) {
  const rain = hour.chance_of_rain || 0;
  const snow = hour.chance_of_snow || 0;
  const wind = hour.wind_kph || 0;
  const code = (hour.condition && hour.condition.code) || 0;

  return (
    rain >= 50 ||
    snow >= 50 ||
    wind >= 30 ||
    (code >= 200 && code <= 233)
  );
}

/**
 * For each sampled point ({ lat, lng }), fetch the next-day forecast,
 * take the next 6 upcoming hours, filter for bad weather, and
 * return an array of { lat, lng, badHours }.
 */
async function getWeatherWarnings(sampledPoints) {
  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) {
    throw new Error('WEATHERAPI_KEY is not set in environment');
  }

  const warnings = [];

  for (const pt of sampledPoints) {
    console.log(`[weatherCheck] calling WeatherAPI for ${pt.lat},${pt.lng}`);
    try {
      const response = await axios.get(
        'http://api.weatherapi.com/v1/forecast.json',
        {
          params: {
            key: apiKey,
            q: `${pt.lat},${pt.lng}`,
            days: 1,
            aqi: 'no',
            alerts: 'no'
          }
        }
      );

      const hours = response.data.forecast.forecastday[0].hour;

      // find the next full-hour timestamp
      const nowMs = Date.now();
      const nextHourTs = Math.ceil(nowMs / 3600000) * 3600000;

      // locate first forecast hour ≥ that boundary
      let startIdx = hours.findIndex(h => {
        const ts = new Date(h.time.replace(' ', 'T')).getTime();
        return ts >= nextHourTs;
      });
      if (startIdx < 0) startIdx = 0;

      // grab the next 6 hours from that index
      const upcoming = hours.slice(startIdx, startIdx + 6);

      // filter for bad weather
      const badHours = upcoming
        .filter(isBadWeather)
        .map(h => ({
          time: h.time,                   // e.g. "2025-06-06 15:00"
          condition: h.condition.text,    // e.g. "Light rain"
          chance_of_rain: h.chance_of_rain,
          chance_of_snow: h.chance_of_snow,
          wind_kph: h.wind_kph
        }));

      if (badHours.length > 0) {
        warnings.push({ lat: pt.lat, lng: pt.lng, badHours });
      }
    } catch (err) {
      console.warn(
        `[weatherCheck] WeatherAPI error at ${pt.lat},${pt.lng}:`,
        err.message
      );
    }
  }

  // summary log
  if (warnings.length === 0) {
    console.log('[weatherCheck] all clear: no bad weather detected');
  } else {
    console.log(
      `[weatherCheck] returning ${warnings.length} warning(s):`,
      warnings
    );
  }

  return warnings;
}

module.exports = {
  sampleEvery2km,
  getWeatherWarnings
};
