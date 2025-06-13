// routeGeneration Feature
// Backend/server/utils/weatherCheck.js

// Utilities for “every 2 km” sampling and WeatherAPI checks.

const axios = require('axios');

/**
 * Compute “as‐the‐crow‐flies” distance (in meters) between two { lat, lng } points.
 */
function haversineDistance(pointA, pointB) {
  const toRad = (degrees) => (degrees * Math.PI) / 180;

  const EARTH_RADIUS = 6371000; // meters
  const lat1 = pointA.lat;
  const lng1 = pointA.lng;
  const lat2 = pointB.lat;
  const lng2 = pointB.lng;

  const deltaLat = toRad(lat2 - lat1);
  const deltaLng = toRad(lng2 - lng1);

  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c; // meters
}

/**
 * Given an ordered array of coords (each { lat, lng }), return a new array
 * containing exactly those coords where the cumulative distance crosses each 2000 m mark.
 */
function sampleEvery2km(routeCoords) {
  const samples = [];
  let nextThreshold = 2000; // first sample at 2 km, then 4 km, 6 km, …

  let accumulated = 0;

  for (let i = 1; i < routeCoords.length; i++) {
    const prevPt = routeCoords[i - 1];
    const currPt = routeCoords[i];
    const segmentDist = haversineDistance(prevPt, currPt);
    accumulated += segmentDist;

    if (accumulated >= nextThreshold) {
      samples.push(currPt);
      nextThreshold += 2000;
    }
  }

  return samples; // array of { lat, lng }
}

/**
 * Return true if WeatherAPI’s “hour” object indicates “bad weather”:
 *   • chance_of_rain ≥ 50%   OR
 *   • chance_of_snow ≥ 50%   OR
 *   • wind_kph ≥ 30          OR
 *   • condition.code between 200–233 (thunderstorm)
 */
function isBadWeather(hourForecast) {
  const rainProb = hourForecast.chance_of_rain || 0;
  const snowProb = hourForecast.chance_of_snow || 0;
  const windSpeed = hourForecast.wind_kph || 0;
  const condCode = hourForecast.condition && hourForecast.condition.code;

  if (rainProb >= 50) return true;
  if (snowProb >= 50) return true;
  if (windSpeed >= 30) return true;
  if (condCode >= 200 && condCode <= 233) return true;
  return false;
}

/**
 * For each sampledPoint ({ lat, lng }), call WeatherAPI’s forecast.json for next 6 hours
 * and collect any hours matching isBadWeather(...). Returns an array of:
 *   [ { lat, lng, badHours: [ { time, condition, chance_of_rain, chance_of_snow, wind_kph } ] }, … ]
 */
async function getWeatherWarnings(sampledPoints) {
  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) {
    throw new Error('WEATHERAPI_KEY is not set in environment');
  }

  const warnings = [];

  for (let i = 0; i < sampledPoints.length; i++) {
    const { lat, lng } = sampledPoints[i];
    try {
      const url = 'http://api.weatherapi.com/v1/forecast.json';
      const params = {
        key: apiKey,
        q: `${lat},${lng}`,
        hours: 6,    // only need next 6 hours
        aqi: 'no',
        alerts: 'no'
      };
      const response = await axios.get(url, { params });
      const day0 = response.data.forecast.forecastday[0];
      const hourArray = day0.hour.slice(0, 6);

      const badHours = hourArray
        .filter(isBadWeather)
        .map((hour) => ({
          time: hour.time,                   // e.g. "2025-06-06 15:00"
          condition: hour.condition.text,    // e.g. "Light rain"
          chance_of_rain: hour.chance_of_rain,
          chance_of_snow: hour.chance_of_snow,
          wind_kph: hour.wind_kph
        }));

      if (badHours.length > 0) {
        warnings.push({ lat, lng, badHours });
      }
    } catch (err) {
      console.warn(`WeatherAPI error at ${lat},${lng}: ${err.message}`);
      // Skip this point if request fails
    }
  }

  return warnings;
}

module.exports = {
  sampleEvery2km,
  getWeatherWarnings
};
