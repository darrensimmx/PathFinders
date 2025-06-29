// BackEnd/server/utils/weatherCheck.js

// load BackEnd/.env so WEATHERAPI_KEY is always available
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

const axios = require('axios');

/**
 * Compute straight‐line distance (m) between two { lat, lng } points.
 */
function haversineDistance(pointA, pointB) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371000; // meters

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
 * From an array of { lat, lng }, pick points every 2 km along the route.
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
 * Hour object is “bad” if rain ≥50%, snow ≥50%, wind ≥30 kph, or thunderstorm code.
 */
function isBadWeather(hour) {
  const rain = hour.chance_of_rain || 0;
  const snow = hour.chance_of_snow || 0;
  const wind = hour.wind_kph || 0;
  const code = (hour.condition && hour.condition.code) || 0;

  return rain >= 50 || snow >= 50 || wind >= 30 || (code >= 200 && code <= 233);
}

/**
 * For each sampled point, fetch next-day forecast, take 6 upcoming hours,
 * filter bad‐weather hours, and return an array of { lat, lng, badHours }.
 */
async function getWeatherWarnings(sampledPoints) {
  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) {
    throw new Error('WEATHERAPI_KEY is not set in environment');
  }

  const warnings = [];

  for (const pt of sampledPoints) {
    try {
      const res = await axios.get(
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

      const hours = res.data.forecast.forecastday[0].hour;
      const nowMs = Date.now();
      const nextHour = Math.ceil(nowMs / 3600000) * 3600000;

      let start = hours.findIndex(h => {
        const ts = new Date(h.time.replace(' ', 'T')).getTime();
        return ts >= nextHour;
      });
      if (start < 0) start = 0;

      const upcoming = hours.slice(start, start + 6);
      const badHours = upcoming.filter(isBadWeather).map(h => ({
        time: h.time,
        condition: h.condition.text,
        chance_of_rain: h.chance_of_rain,
        chance_of_snow: h.chance_of_snow,
        wind_kph: h.wind_kph
      }));

      if (badHours.length) {
        warnings.push({ lat: pt.lat, lng: pt.lng, badHours });
      }
    } catch (err) {
      console.warn(`WeatherAPI error at ${pt.lat},${pt.lng}: ${err.message}`);
    }
  }

  return warnings;
}

module.exports = {
  sampleEvery2km,
  getWeatherWarnings
};
