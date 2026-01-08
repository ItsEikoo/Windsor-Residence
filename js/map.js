// === GLOBAL STATE ===
let filterStates = {
  university: true,
  review: true,
  government: true,
};
let selectedDorm = "Hiyori Suites";

// === Floating Preview Map ===
const previewMap = L.map('mapPreview').setView([14.6104, 121.0044], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(previewMap);

// Preview Layer Groups
let universityPreviewGroup = L.layerGroup().addTo(previewMap);
let reviewPreviewGroup = L.layerGroup().addTo(previewMap);
let governmentPreviewGroup = L.layerGroup().addTo(previewMap);
let previewDormMarkers = {};
let previewDormCircle = null;

// === Dormitories (shared) ===
const dorms = [
  { name: "Hiyori Suites", lat: 14.6104, lng: 121.0044 },
  { name: "Windsor Residences", lat: 14.6108, lng: 121.0031 },
  { name: "Hampton Residences", lat: 14.6109, lng: 121.0034 }
];

// Custom Dorm Icon (Font Awesome)
function getDormIcon() {
  return L.divIcon({
    className: "custom-dorm-marker",
    html: `<i class="fa-solid fa-location-dot"></i>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -30]
  });
}

// Store dorm markers for preview
dorms.forEach(d => {
  const marker = L.marker([d.lat, d.lng], { title: d.name, icon: getDormIcon() })
    .bindPopup(`<b>${d.name}</b><br>Dormitory`);
  previewDormMarkers[d.name] = { ...d, marker };
});

// === Points of Interest (shared) ===
const places = [
  { name: "National University - Manila", lat: 14.6077, lng: 121.0041, walk: "2 min", type: "university" },
  { name: "Multivector Review Center", lat: 14.6072, lng: 121.0036, walk: "3 min", type: "review" },
  { name: "University of Santo Tomas", lat: 14.6091, lng: 120.9899, walk: "10 min", type: "university" },
  { name: "San Beda University", lat: 14.6038, lng: 121.0002, walk: "12 min", type: "university" },
  { name: "Centro Escolar University", lat: 14.6029, lng: 120.9947, walk: "12 min", type: "university" },
  { name: "R. Papa / Loyola / P. Campa Centers", lat: 14.6086, lng: 121.0025, walk: "13 min", type: "review" },
  { name: "Far Eastern University", lat: 14.6042, lng: 121.0031, walk: "13 min", type: "university" },
  { name: "Professional Regulation Commission (PRC)", lat: 14.5898, lng: 121.0059, walk: "13 min", type: "government" }
];

// === POI Icons with Font Awesome + Tip ===
function getPOIIcon(type) {
  let iconHtml = "";
  let bgColor = "";

  if (type === "university") {
    iconHtml = `<i class="fa-solid fa-school"></i>`;
    bgColor = "blue";
  } else if (type === "review") {
    iconHtml = `<i class="fa-solid fa-book"></i>`;
    bgColor = "green";
  } else if (type === "government") {
    iconHtml = `<i class="fa-solid fa-landmark"></i>`;
    bgColor = "#ffd000";
  }

  return L.divIcon({
    className: `custom-poi-marker poi-${type}`,
    html: `<div class="marker-body" style="background:${bgColor}">${iconHtml}</div>
           <div class="marker-tip" style="border-top-color:${bgColor}"></div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -35]
  });
}

// Add POIs to preview
places.forEach(p => {
  const marker = L.marker([p.lat, p.lng], { icon: getPOIIcon(p.type) })
    .bindPopup(`<b>${p.name}</b><br>${p.type}`);

  if (p.type === "university") marker.addTo(universityPreviewGroup);
  else if (p.type === "review") marker.addTo(reviewPreviewGroup);
  else if (p.type === "government") marker.addTo(governmentPreviewGroup);
});

// === Modal Map Variables ===
let modalMap = null;
let dormMarkers = {};
let currentDormMarker = null;
let circle = null;
let universityGroup, reviewCenterGroup, governmentGroup;

// === Modal Open ===
document.getElementById("mapPreview").addEventListener("click", () => {
  document.getElementById("mapModal").style.display = "flex";

  if (!modalMap) {
    initModalMap();
  }

  setTimeout(() => {
    modalMap.invalidateSize();
  }, 200);
});

// === Modal Close ===
function closeMapModal() {
  document.getElementById("mapModal").style.display = "none";
  applyFilterStates();
}
document.getElementById("mapClose").addEventListener("click", closeMapModal);
document.getElementById("mapModal").addEventListener("click", function(event) {
  if (event.target === this) {
    closeMapModal();
  }
});

// === Initialize Modal Map ===
function initModalMap() {
  modalMap = L.map('map').setView([14.6104, 121.0044], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(modalMap);

  // Dorm markers
  dorms.forEach(d => {
    const marker = L.marker([d.lat, d.lng], { icon: getDormIcon() })
      .bindPopup(`<b>${d.name}</b><br>Dormitory`);
    dormMarkers[d.name] = { ...d, marker };
  });

  const dormSelect = document.getElementById('dormSelect');
  dormSelect.value = selectedDorm;
  dormSelect.addEventListener('change', function () {
    selectedDorm = this.value;
    updateDormSelection();
  });

  updateDormSelection();

  // Marker Groups
  universityGroup = L.layerGroup().addTo(modalMap);
  reviewCenterGroup = L.layerGroup().addTo(modalMap);
  governmentGroup = L.layerGroup().addTo(modalMap);

  // Add POIs to modal
  places.forEach(p => {
    const tag = getTag(p.type);

    const popupHTML = `
      <div class="custom-popup popup-${p.type}">
        <h4>${p.name}</h4>
        ${tag}
        <p><i class="fa-solid fa-person-walking"></i> <strong>Walk time:</strong> ${p.walk}</p>
      </div>
    `;

    const marker = L.marker([p.lat, p.lng], { icon: getPOIIcon(p.type) })
      .bindPopup(popupHTML);

    if (p.type === "university") marker.addTo(universityGroup);
    else if (p.type === "review") marker.addTo(reviewCenterGroup);
    else if (p.type === "government") marker.addTo(governmentGroup);
  });

  // Restore filter state
  document.getElementById("filterUniversities").checked = filterStates.university;
  document.getElementById("filterReviewCenters").checked = filterStates.review;
  document.getElementById("filterGovernment").checked = filterStates.government;

  applyFilterStates();

  // Filters
  document.getElementById("filterUniversities").addEventListener("change", function () {
    filterStates.university = this.checked;
    toggleLayer(universityGroup, this.checked, universityPreviewGroup);
  });
  document.getElementById("filterReviewCenters").addEventListener("change", function () {
    filterStates.review = this.checked;
    toggleLayer(reviewCenterGroup, this.checked, reviewPreviewGroup);
  });
  document.getElementById("filterGovernment").addEventListener("change", function () {
    filterStates.government = this.checked;
    toggleLayer(governmentGroup, this.checked, governmentPreviewGroup);
  });
}

// === Update Dorm Selection in BOTH maps ===
function updateDormSelection() {
  const selected = dormMarkers[selectedDorm];
  const previewMarker = previewDormMarkers[selectedDorm];
  if (!selected || !previewMarker) return;

  if (currentDormMarker) modalMap.removeLayer(currentDormMarker);
  if (circle) modalMap.removeLayer(circle);
  Object.values(previewDormMarkers).forEach(d => {
    if (d.marker) previewMap.removeLayer(d.marker);
  });
  if (previewDormCircle) previewMap.removeLayer(previewDormCircle);

  // Add dorm marker in modal
  currentDormMarker = selected.marker.addTo(modalMap);
  currentDormMarker.openPopup();

  // Add dorm circle in modal
  circle = L.circle([selected.lat, selected.lng], {
    radius: 2700,
    color: '#dc2626',
    fillColor: '#f87171c7',
    fillOpacity: 0.15,
    weight: 3,
    dashArray: '6, 6',
    interactive: false
  }).addTo(modalMap);

  // Add only selected dorm marker + circle in preview
  previewMarker.marker.addTo(previewMap);
  previewDormCircle = L.circle([selected.lat, selected.lng], {
    radius: 2700,
    color: '#dc2626',
    fillColor: '#f87171c7',
    fillOpacity: 0.15,
    weight: 2,
    dashArray: '6, 6',
    interactive: false
  }).addTo(previewMap);

  modalMap.setView([selected.lat, selected.lng], 16);
  previewMap.setView([selected.lat, selected.lng], 15);
}

// === Helpers ===
function getTag(type) {
  if (type === "university") return `<span class="tag tag-university"> 🎓 University</span>`;
  if (type === "review") return `<span class="tag tag-review"> 📖 Review Center</span>`;
  if (type === "government") return `<span class="tag tag-government"> 🏛 Government Office</span>`;
  return "";
}

function toggleLayer(layer, show, previewLayer) {
  if (show) {
    modalMap.addLayer(layer);
    previewMap.addLayer(previewLayer);
  } else {
    modalMap.removeLayer(layer);
    previewMap.removeLayer(previewLayer);
  }
}

function applyFilterStates() {
  toggleLayer(universityGroup, filterStates.university, universityPreviewGroup);
  toggleLayer(reviewCenterGroup, filterStates.review, reviewPreviewGroup);
  toggleLayer(governmentGroup, filterStates.government, governmentPreviewGroup);
}
