// Map initialization
if (document.getElementById('location-map')) {
    const map = L.map('location-map', {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
        attributionControl: false
    }).setView([23.0225, 72.5714], 3); // Ahmedabad

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    const customIcon = L.divIcon({
        className: 'custom-ping-marker',
        html: '<div class="map-ping-container"><div class="map-ping-dot"></div><div class="map-ping-animation"></div></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    L.marker([23.0225, 72.5714], {icon: customIcon}).addTo(map);
}

// Back to Top functionality
document.addEventListener("DOMContentLoaded", () => {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Theme Toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check local storage for theme
    const currentTheme = localStorage.getItem('theme') || 'dark-black';
    if (currentTheme === 'midnight-blue') {
        document.documentElement.setAttribute('data-theme', 'midnight-blue');
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'midnight-blue') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark-black');
            } else {
                document.documentElement.setAttribute('data-theme', 'midnight-blue');
                localStorage.setItem('theme', 'midnight-blue');
            }
        });
    }
});