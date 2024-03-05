// Initialize map object
var map = L.map("map").setView([-1.846384, 38.2084547], 11);

// Intialize tile layers
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Initialize empty layer groups
var powerlinesLayer = L.layerGroup();
var incidentsLayer = L.layerGroup();
var aoiLayer = L.layerGroup();

// Add the area of study GeoJSON and style it
// Fetch AOI GeoJSON from the static folder
$.ajax({
  url: AOI_STATIC_URL,
  type: "GET",
  dataType: "json",
  success: function (aoiData) {
    L.geoJSON(aoiData, {
      style: {
        color: "red",
        weight: 3,
        fillOpacity: 0,
      },
      onEachFeature: function (feature, layer) {
        var popupContent = "<h3>NAME: " + feature.properties.NAME_3 + "</h3>";
        layer.bindPopup(popupContent);
      },
    }).addTo(aoiLayer);
  },
  error: function (aoiError) {
    console.error("Error fetching AOI GeoJSON data:", aoiError);
  },
});

// fetch powerlines GeoJSON from API and add to map
$.ajax({
  url: "/api/v1/powerlines/list/", // Replace with your actual endpoint
  type: "GET",
  dataType: "json",
  success: function (data) {
    // Add GeoJSON layer to the map
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        // Customize marker for powerlines
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: POWERLINE_ICON_URL, // Replace with the path to your powerline icon
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12],
          }),
        });
      },
      onEachFeature: function (feature, layer) {
        // Create an interactive popup for each feature
        var popupContent =
          "<h3> State of powerline: " + feature.properties.state + "</h3>";
        layer.bindPopup(popupContent);
      },
    }).addTo(powerlinesLayer);
  },
  error: function (error) {
    console.error("Error fetching GeoJSON data:", error);
  },
});
// fetch powerline incidents GeoJSON from API and add to map
$.ajax({
  url: "/api/v1/powerline-incidents/list/", // Replace with your actual endpoint
  type: "GET",
  dataType: "json",
  success: function (data) {
    // Add GeoJSON layer to the map
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        // Customize marker for incidents
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: INCIDENT_ICON_URL, // Replace with the path to your danger icon
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12],
          }),
        });
      },
      onEachFeature: function (feature, layer) {
        // Create an interactive popup for each feature
        var popupContent =
          "<h3> Incident type: " + feature.properties.incident_type + "</h3>";
        layer.bindPopup(popupContent);
      },
    }).addTo(incidentsLayer);
  },
  error: function (error) {
    console.error("Error fetching GeoJSON data:", error);
  },
});
// Add leaflet layer switcher
// Add layer groups to the map
var baseLayers = {
  Powerlines: powerlinesLayer,
  Incidents: incidentsLayer,
};
// Show powerlines and AOI layers by default
powerlinesLayer.addTo(map);
aoiLayer.addTo(map);

// Create layer control outside the AJAX function
L.control.layers({ AOI: aoiLayer }, baseLayers).addTo(map);

// Adding full screen functionality
map.addControl(
  new L.Control.Fullscreen({
    title: {
      false: "View Fullscreen",
      true: "Exit Fullscreen",
    },
  })
);
