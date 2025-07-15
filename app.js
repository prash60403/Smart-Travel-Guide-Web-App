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
      { name: "Ancient Fort", image: "fort.jpg" },
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
