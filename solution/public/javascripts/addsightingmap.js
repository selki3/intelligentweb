/**
 * Initialises a Leaflet map and adds a tile layer from OpenStreetMap.
 * Also declares a variable for a map marker.
 *
 * @param {string} 'mapid' - The id of the div element where the map will be rendered.
 */

var mymap = L.map('mapid');

// Add a tile layer to the map, this layer gets tiles from OpenStreetMap server
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 19,
}).addTo(mymap);

// Declare a variable that will hold the map marker
var marker;


/**
 * Sets the view of the map and place the marker on it.
 * If a marker doesn't exist, it is created and placed on the map, otherwise the marker's position is updated.
 *
 * @param {number} latitude - Latitude to set the map view and marker.
 * @param {number} longitude - Longitude to set the map view and marker.
 */
function setMapViewAndMarker(latitude, longitude) {
    // Set the view of the map to the specified latitude and longitude with zoom level 13
    mymap.setView([latitude, longitude], 13);

    // If a marker doesn't exist, create and place it on the map, otherwise update the marker's position
    if (!marker) {
        marker = L.marker([latitude, longitude]).addTo(mymap);
    } else {
        marker.setLatLng([latitude, longitude]);
    }

    // Update the values of the latitude and longitude input fields
    document.getElementById('latitude').value = latitude;
    document.getElementById('longitude').value = longitude;
}
/**
 * Checks if geolocation is supported by the browser. If so, the user's current location is used as the map center, otherwise default coordinates are used.
 */
// Default to Sheffield, UK
setMapViewAndMarker(53.3811, -1.4701);
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
        setMapViewAndMarker(position.coords.latitude, position.coords.longitude);
    }, function() {
        // Default to Sheffield, UK if the user denies geolocation access
    });
}

/**
 * Adds an event listener for click events on the map. When a location on the map is clicked, the map view and marker are set to the clicked location.
 */
mymap.on('click', function(e) {
    setMapViewAndMarker(e.latlng.lat, e.latlng.lng);
});

/**
 * Adds an event listener for click events on a button. When the button is clicked, the map view and marker are set to the user's current location if geolocation is available.
 */
document.getElementById('location-button').addEventListener('click', function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            setMapViewAndMarker(position.coords.latitude, position.coords.longitude);
        }, function() {
            // Default to Sheffield, UK if the user denies geolocation access
            setMapViewAndMarker(53.3811, -1.4701);
        });
    } else {
        // Default to Sheffield, UK if the browser doesn't support geolocation
        setMapViewAndMarker(53.3811, -1.4701);
    }
});

/**
 * Adds event listeners for 'input' events on the latitude and longitude fields. When their values change, the map view and marker are updated accordingly.
 */
document.getElementById('latitude').addEventListener('input', function() {
    if (this.value && document.getElementById('longitude').value) {
        setMapViewAndMarker(parseFloat(this.value), parseFloat(document.getElementById('longitude').value));
    }
});

document.getElementById('longitude').addEventListener('input', function() {
    if (this.value && document.getElementById('latitude').value) {
        setMapViewAndMarker(parseFloat(document.getElementById('latitude').value), parseFloat(this.value));
    }
});
