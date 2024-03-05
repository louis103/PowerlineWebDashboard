// Initialize map object
var map = L.map("map").setView([-1.846384, 38.2084547], 11);

// Intialize tile layers
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Adding full screen functionality
map.addControl(
  new L.Control.Fullscreen({
    title: {
      false: "View Fullscreen",
      true: "Exit Fullscreen",
    },
  })
);

// Initialize the three datasets
prepare_data_add_to_map();

//Add the leaflet draw functionality
// FeatureGroup is to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
  },
});
map.addControl(drawControl);

// defining variables
var geoJsonToQuery;
let modal = new bootstrap.Modal(document.querySelector(".modal"));
// Model/Feature type
let model_name;
model_name = document.getElementById("selectModel");

// Analysis
let analysis_type;
analysis_type = document.getElementById("selectAnalysis");

map.on("draw:created", function (e) {
  var type = e.layerType,
    layer = e.layer;
  drawnItems.addLayer(layer);
  if (type === "polygon") {
    geoJsonToQuery = JSON.stringify(layer.toGeoJSON());
    modal.show();

    model_name_out = model_name.options[model_name.selectedIndex].value;
    analysis_type_out =
      analysis_type.options[analysis_type.selectedIndex].value;

    // Get the form details and submit
    document.getElementById("submitForm").addEventListener("click", () => {
      modal.hide(); // close the modal
      getAnalysisReadyData(geoJsonToQuery, model_name_out, analysis_type_out);
    });
  } else if (type === "circle") {
    geoJsonToQuery = JSON.stringify(layer.toGeoJSON());
    let modal = new bootstrap.Modal(document.querySelector(".modal"));
    modal.show();

    // Get the form details and submit
    let model_type =
      document.getElementById("selectModel").options[model_type.selectedIndex]
        .value;
    let analysisType =
      document.getElementById("selectAnalysis").options[
        analysisType.selectedIndex
      ].value;
    document.getElementById("submitForm").addEventListener("click", () => {
      modal.hide(); // close the modal
      getAnalysisReadyData(geoJsonToQuery, model_type, analysisType);
    });
  } else if (type === "rectangle") {
    geoJsonToQuery = JSON.stringify(layer.toGeoJSON());
    let modal = new bootstrap.Modal(document.querySelector(".modal"));
    modal.show();

    // Get the form details and submit
    let model_type =
      document.getElementById("selectModel").options[model_type.selectedIndex]
        .value;
    let analysisType =
      document.getElementById("selectAnalysis").options[
        analysisType.selectedIndex
      ].value;
    document.getElementById("submitForm").addEventListener("click", () => {
      modal.hide(); // close the modal
      getAnalysisReadyData(geoJsonToQuery, model_type, analysisType);
    });
  }
  var featureJson = JSON.stringify(layer.toGeoJSON());
  layer.bindPopup(`<p>${featureJson}</p>`);
});

// fetch features
function getAnalysisReadyData(geojson, model_name, analysis_type) {
  // Obtain the CSRF token from the Django template
  const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  fetch("http://127.0.0.1:8000/api/v1/analyze-powerlines/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken, // Include the CSRF token in the headers
    },
    body: JSON.stringify({ geojson, model_name, analysis_type }), // or 'intersection', 'completely_within'
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data); // Data containing powerlines based on the analysis
      // Handle the data as needed
      //alert("Data is back!! Hurray \n" + JSON.stringify(data));

      clearLayers(); // clear any data on the map first
      // now add the new received data
      addGeoJSONLayer(data);
      // show notification
      // Create an instance of Notyf
      var notyf = new Notyf({
        duration: 4000,
        position: {
          x: "right",
          y: "top",
        },
      });
      // Display a success notification
      const notification = notyf.success("Query was successful!");
      notyf.dismiss(notification);
    })
    .catch((error) => {
      console.error("Error performing spatial analysis:", error);
      // show notification
      // Create an instance of Notyf
      var notyf = new Notyf({
        duration: 4000,
        position: {
          x: "right",
          y: "top",
        },
      });
      // Display a success notification
      const notification = notyf.error("An error occurred: " + error);
      notyf.dismiss(notification);
    });

  // @TODO: Remove existing data and add the retrieved data to map
}
// Initialize empty layer groups
var powerlinesLayer;
var incidentsLayer;
var aoiLayer;

function prepare_data_add_to_map() {
  powerlinesLayer = L.layerGroup();
  incidentsLayer = L.layerGroup();
  aoiLayer = L.layerGroup();
  // Fetch, AOI,Powerlines and Incidents data and add to map.
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

  // Add layer groups to the map
  // var baseLayers = {
  //   Powerlines: powerlinesLayer,
  //    Incidents: incidentsLayer,
  //  };
  // Show powerlines and AOI layers by default
  powerlinesLayer.addTo(map);
  aoiLayer.addTo(map);
  incidentsLayer.addTo(map);

  // Create layer control outside the AJAX function
  // L.control.layers({ AOI: aoiLayer }, baseLayers).addTo(map);
}

// Function to clear existing layers
function clearLayers() {
  if (powerlinesLayer) {
    powerlinesLayer.clearLayers();
  }
  if (incidentsLayer) {
    incidentsLayer.clearLayers();
  }
}

// Function to add GeoJSON layer to the map
function addGeoJSONLayer(geojsonData) {
  L.geoJSON(geojsonData, {
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

  // Add powerlines layer to the map
  powerlinesLayer.addTo(map);
}
