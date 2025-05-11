require('dotenv').config();
const fetch = require('node-fetch');


async function getORSRoute(startCoords, endCoords) {
    const apiKey = process.env.ORS_API_KEY
    const url = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson'; // this ensures route given by APi is foot walkable

    const body = {
        coordinates: [startCoords, endCoords]
    };

    console.log("Sending to ORS:", JSON.stringify(body, null, 2));
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`ORS error: ${response.status}`);
    }

    const data = await response.json()
    return data;
}

module.exports = getORSRoute