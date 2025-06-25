// BackEnd/server/utils/weatherCheck.js

const axios = require('axios');

/**
 * Compute “as‐the‐crow‐flies” distance (in meters) between two { lat, lng } points.
 */
function haversineDistance(pointA, pointB) {
  const toRad = degrees => (degrees * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters

  const dLat = toRad(pointB.lat - pointA.lat);
  const dLng = toRad(pointB.lng - pointA.lng);
  const rLat1 = toRad(pointA.lat);
  const rLat2 = toRad(pointB.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/*
  Given an ordered array of coords (each { lat, lng }), return a new array
  containing exactly those coords where the cumulative distance crosses each 2000 m mark.
 */
function sampleEvery2km(routeCoords) {
  const samples = [];
  let nextThreshold = 2000; // first sample at 2 km, then 4 km, …

  let accumulated = 0;
  for (let i = 1; i < routeCoords.length; i++) {
    const prevPt = routeCoords[i - 1];
    const currPt = routeCoords[i];
    accumulated += haversineDistance(prevPt, currPt);

    if (accumulated >= nextThreshold) {
      samples.push(currPt);
      nextThreshold += 2000;
    }
  }

  return samples; // array of { lat, lng }
}

/*
  Return true if WeatherAPI’s “hour” object indicates “bad weather”:
   chance_of_rain >= 50%   OR
   chance_of_snow >= 50%   OR
   wind_kph >= 30          OR
   condition.code between 200–233 (thunderstorm)
 */
function isBadWeather(hourForecast) {
  const rainProb = hourForecast.chance_of_rain || 0;
  const snowProb = hourForecast.chance_of_snow || 0;
  const windSpeed = hourForecast.wind_kph || 0;
  const condCode = (hourForecast.condition && hourForecast.condition.code) || 0;

  return (
    rainProb >= 50 ||
    snowProb >= 50 ||
    windSpeed >= 30 ||
    (condCode >= 200 && condCode <= 233)
  );
}

/*
  For each sampledPoint ({ lat, lng }), call WeatherAPI’s forecast.json for the next 6 hours
  and collect any hours matching isBadWeather(...).
  Returns an array of:
    [ { lat, lng, badHours: [ { time, condition, chance_of_rain, chance_of_snow, wind_kph } ] }, … ]
 */
async function getWeatherWarnings(sampledPoints) {
  console.log('getWeatherWarnings called with ' + sampledPoints.length + ' points');

  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) {
    throw new Error('WEATHERAPI_KEY is not set in environment');
  }

  const warnings = [];

  for (const pt of sampledPoints) {
    try {
      console.log(
        'Fetching weather for point:',
        pt.lat,
        pt.lng
      );

      const response = await axios.get(
        'http://api.weatherapi.com/v1/forecast.json',
        {
          params: {
            key: apiKey,
            q: pt.lat + ',' + pt.lng,
            days: 1,
            aqi: 'no',
            alerts: 'no',
          },
        }
      );

      const hours = response.data.forecast.forecastday[0].hour;

      // Compute the timestamp (ms) of the next full hour boundary
      const nowMs = Date.now();
      const nextHourTs = Math.ceil(nowMs / 3600000) * 3600000;

      // Find the first forecast hour >= that boundary
      let idxStart = hours.findIndex(h => {
        // Convert "YYYY-MM-DD hh:mm" to ISO for parsing
        const ts = new Date(h.time.replace(' ', 'T')).getTime();
        return ts >= nextHourTs;
      });
      if (idxStart < 0) {
        idxStart = 0;
      }

      // Grab the next 6 slots from that index
      const WINDOW = 6;
      const upcoming = hours.slice(idxStart, idxStart + WINDOW);

      const badHours = upcoming
        .filter(isBadWeather)
        .map(hour => ({
          time: hour.time,                  // e.g. "2025-06-06 15:00"
          condition: hour.condition.text,   // e.g. "Light rain"
          chance_of_rain: hour.chance_of_rain,
          chance_of_snow: hour.chance_of_snow,
          wind_kph: hour.wind_kph,
        }));

      console.log(
        'Bad hours for',
        pt.lat,
        pt.lng,
        ':',
        badHours.length
      );

      if (badHours.length > 0) {
        warnings.push({ lat: pt.lat, lng: pt.lng, badHours });
      }
    } catch (err) {
      console.warn(
        'WeatherAPI error at',
        pt.lat,
        pt.lng,
        ':',
        err.message
      );
    }
  }

  console.log('getWeatherWarnings returning ' + warnings.length + ' warnings');
  return warnings;
}

module.exports = {
  sampleEvery2km,
  getWeatherWarnings,
};
// Exported functions: