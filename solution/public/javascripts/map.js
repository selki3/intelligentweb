/**
 * Extracts longitude and latitude values from the text files present on the web page.
 * Parses these values to float type for correct numerical computation.
 * Initialises a Leaflet map centered at the extracted latitude and longitude coordinates.
 * Adds an OpenStreetMap tile layer to the map.
 * Finally, places a marker at the initial coordinates on the map.
 *
 * @param {string} 'longitude' - ID of the text field containing the longitude value.
 * @param {string} 'latitude' - ID of the text field containing the latitude value.
 * @param {string} 'mapid' - ID of the div element where the map will be rendered.
 * @param {number} zoom level - The initial zoom level for the map view.
 * @param {string} OpenStreetMap URL template - URL template to fetch tiles from the OpenStreetMap server.
 * @param {number} maxZoom - Specifies the maximum zoom level for the tile layer.
 */
// Extract longitude and latitude values from the text content of HTML elements
var longitude = parseFloat(document.getElementById('longitude').innerText);
var latitude = parseFloat(document.getElementById('latitude').innerText);

// Initialise a Leaflet map centered at the extracted longitude and latitude
var mymap = L.map('mapid').setView([longitude, latitude], 13);

// Add an OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(mymap);

// Create and add a marker to the map at the specified longitude and latitude
var marker = L.marker([longitude, latitude]).addTo(mymap);
