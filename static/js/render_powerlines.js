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
        var popupContent =
          "<h5 id='center_h5'>Area of study(Mutomo subcounty,Kitui County)</h5>";
        // + feature.properties.NAME_3
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
        var customPopupContent = `
                      <h5 id='center_h5' style='text-align: center;'>Powerline details</h5>
                      <hr />
                      <p id='val'> State of powerline: ${feature.properties.state}</p>
                      <p id='val'> Structural type: ${feature.properties.structural_type}</p>
                      <p id='val'> Date recorded: ${feature.properties.datetime}</p>
                      <p id='val'>Latitude of powerline: ${feature.properties.latitude}</p>
                      <p id='val'>Longitude of powerline: ${feature.properties.longitude}</p>
                      <p id='val'>Locational accuracy: ${feature.properties.accuracy} meters</p>
                      <p id='val'>Altitude ASL in meters: ${feature.properties.altitude} meters</p>
                      <img src='${feature.properties.photo_of_powerline}' width="250px" height="200px"/>
                      <hr/>
                      <h5 id='center_h5'>Transformer details</h5>
                      <div id="transformer-info">
                          <!-- This div will be populated dynamically based on has_transformer -->
                      </div>
                      <hr />
                      <h5 id='center_h5'>Power Cables details</h5>
                      <div id="cable-info">
                        <!-- This div will be populated dymamically based on has_broken_powercables -->
                      </div>
                      `;

        layer.bindPopup(customPopupContent);
        // Add an event listener for the 'popupopen' event
        layer.on("popupopen", function (event) {
          // Assuming `feature` is the GeoJSON feature associated with the layer
          if (feature.properties.has_transformer) {
            // Display transformer information
            var transformerContent = `
                  <p id='val'>Condition: ${feature.properties.condition_of_transformer}</p>
                  <img src="${feature.properties.photo_of_transformer}" alt="Transformer Photo" width="250px" height="200px">
              `;
            document.getElementById("transformer-info").innerHTML =
              transformerContent;
          } else {
            // Display "Not available" message
            document.getElementById("transformer-info").innerHTML =
              "<p>Not available</p>";
          }
          // Check if cable details are present
          if (feature.properties.has_broken_powercables) {
            // Display transformer information
            var cablesContent = `
              <p id='val'>No of faulty cables: ${feature.properties.count_of_broken_cables}</p>
              <img src="${feature.properties.photo_of_powercables}" alt="Powerline Cables Photo" width="250px" height="200px">
              `;
            document.getElementById("cable-info").innerHTML = cablesContent;
          } else {
            // Display "Not available" message
            document.getElementById("cable-info").innerHTML =
              "<p>Not available</p>";
          }
        });
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
        var popupContent = `
                      <h5 id='center_h5' style='text-align: center;'>Powerline Incidents details</h5>
                      <hr />
                      <p id='val'> Incident type: ${feature.properties.incident_type}</p>
                      <p id='val'> Severity: ${feature.properties.severity}</p>
                      <p id='val'> Time of occurrence: ${feature.properties.time_of_occurrence}</p>
                      <p id='val'> Date of occurrence: ${feature.properties.date_of_occurrence}</p>
                      <p id='val'>Latitude of incident: ${feature.properties.latitude}</p>
                      <p id='val'>Longitude of incident: ${feature.properties.longitude}</p>
                      <img src='${feature.properties.photo_of_incident}' width="250px" height="200px"/>`;

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
