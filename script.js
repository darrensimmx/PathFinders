const API_KEY = "YOUR_OPENROUTESERVICE_API_KEY"; // Replace with your API key

// Initialize the Leaflet map
let map = L.map('map').setView([51.505, -0.09], 13); // Default to London
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function generateRoute() {
    let postalCode = document.getElementById("postalCode").value;
    let distance = document.getElementById("distance").value;

    if (!postalCode || !distance) {
        alert("Please enter both postal code and distance.");
        return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${postalCode}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert("Invalid postal code.");
                return;
            }
            
            let lat = data[0].lat;
            let lon = data[0].lon;
            
            getRunningRoute(lat, lon, distance);
        })
        .catch(error => console.error("Error fetching geolocation:", error));
}

function getRunningRoute(lat, lon, distance) {
    let radius = (distance * 1000) / 2; // Convert km to meters and divide by 2 for a loop

    let url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${API_KEY}&start=${lon},${lat}&end=${lon},${lat}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            let route = data.routes[0].geometry.coordinates;

            let latLngs = route.map(coord => [coord[1], coord[0]]);
            
            L.polyline(latLngs, { color: 'blue' }).addTo(map);
            map.setView([lat, lon], 14);
        })
        .catch(error => console.error("Error fetching route:", error));
}
