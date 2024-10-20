// Initialize the map
var map = L.map('map').setView([29.0, -90.0], 5);  // Gulf of Mexico centered

// Load and display map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to search for a hurricane by name
function searchHurricane() {
    const hurricaneName = document.getElementById('hurricaneName').value;

    // Clear previous markers and paths
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // Fetch all data points for the given hurricane name
    fetch(`/api/hurricanes?name=${hurricaneName}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Group data points by year
                const hurricanesByYear = {};
                data.forEach(hurricane => {
                    const year = hurricane.year;
                    if (!hurricanesByYear[year]) {
                        hurricanesByYear[year] = [];
                    }
                    hurricanesByYear[year].push(hurricane);
                });

                // For each year, draw a unique path with a different color
                Object.keys(hurricanesByYear).forEach(year => {
                    const hurricaneData = hurricanesByYear[year];

                    // Generate a unique color for each year
                    const pathColor = getRandomColor();

                    // Create an array of lat/lng points for the path
                    const latLngs = hurricaneData.map(hurricane => [parseFloat(hurricane.lat), parseFloat(hurricane.long)]);

                    // Add the polyline (path) to the map
                    L.polyline(latLngs, { color: pathColor, weight: 3 }).addTo(map);

                    // Add markers with popups for each point
                    hurricaneData.forEach(hurricane => {
                        const lat = parseFloat(hurricane.lat);
                        const lng = parseFloat(hurricane.long);
                        const name = hurricane.name;
                        const windSpeed = hurricane.wind || 'N/A';  // Use the 'wind' field from the CSV
                        const month = hurricane.month;
                        const day = hurricane.day;
                        const hour = hurricane.hour;

                        if (lat && lng) {
                            L.marker([lat, lng]).addTo(map)
                                .bindPopup(`
                                    <b>${name}</b><br>
                                    Date: ${year}-${month}-${day} ${hour}:00<br>
                                    Wind Speed: ${windSpeed} mph
                                `);
                        }
                    });
                });
            } else {
                alert("Hurricane not found.");
            }
        })
        .catch(error => console.error('Error fetching hurricane data:', error));
}
