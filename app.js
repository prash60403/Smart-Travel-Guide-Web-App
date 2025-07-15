const container = document.getElementById('cards-container');
const statusDiv = document.getElementById('status');

// 1. Get network condition
let lowData = false;
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
if (connection) {
  lowData = connection.saveData || connection.effectiveType !== '4g';
  console.log('Network type:', connection.effectiveType);
}

// 2. Get user location
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    statusDiv.textContent = `You are here: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`;

    // Simulated nearby attractions
    const attractions = [
      { name: "Ancient Fort", image: "Rajasthan.jpg" },
      { name: "Waterfall Trail", image: "waterfall.jpg" },
      { name: "Local Market", image: "market.jpg" },
      { name: "Sunset Point", image: "sunset.jpg" },
    ];

    attractions.forEach((place, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${place.name}</h3>
        <img data-src="${lowData ? `low/${place.image}` : `high/${place.image}`}" width="100%" alt="${place.name}">
      `;
      container.appendChild(card);
    });

    initLazyLoader(); // Intersection Observer
  }, () => {
    statusDiv.textContent = "Unable to retrieve location.";
  });
} else {
  statusDiv.textContent = "Geolocation not supported.";
}

// 3. Lazy load using Intersection Observer
function initLazyLoader() {
  const cards = document.querySelectorAll('.card');
  const images = document.querySelectorAll('img[data-src]');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        const img = entry.target.querySelector('img');
        if (img && img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
}
document.getElementById('loading').style.display = 'none';

// Initialize Leaflet map
const map = L.map('map').setView([latitude, longitude], 13);

// Use OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add marker at user's location
L.marker([latitude, longitude])
  .addTo(map)
  .bindPopup('You are here!')
  .openPopup();

  const API_KEY = "0b626b9550f79cc7af6d4e9bf12dbf8b"; // Replace this

fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById('weather-card').innerHTML = `
      <h3>${data.name}</h3>
      <p>${data.weather[0].main} - ${data.weather[0].description}</p>
      <p>🌡️ ${data.main.temp}°C | 💨 Wind: ${data.wind.speed} m/s</p>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
    `;
  })
  .catch(err => {
    console.error("Weather fetch failed:", err);
    document.getElementById('weather-card').innerHTML = "<p>Weather unavailable</p>";
  });
