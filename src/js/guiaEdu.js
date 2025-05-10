// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
    });
}

// Window resize handler to reset nav display
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        if (nav) nav.style.display = 'block';
    } else {
        if (nav) nav.style.display = 'none';
    }
});

// Quiz functionality
const options = document.querySelectorAll('.option');
if (options.length) {
    options.forEach(option => {
        option.addEventListener('click', () => {
            // Clear previous selections
            options.forEach(opt => {
                opt.style.backgroundColor = '';
                opt.querySelector('input').checked = false;
            });
            
            // Select current option
            option.style.backgroundColor = '#e2f8ef';
            option.querySelector('input').checked = true;
        });
    });
}

// Search functionality
const searchInput = document.querySelector('.search-container input');
const searchBtn = document.querySelector('.search-btn');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

function performSearch(query) {
    if (!query) return;
    
    // In a real application, this would search the database
    // For this demo, we'll just log the search query
    console.log('Searching for:', query);
    alert(`Buscando por: ${query}`);
    
    // Clear the search input
    if (searchInput) searchInput.value = '';
}

// Create placeholder logo
function createPlaceholderLogo() {
    const logoImgs = document.querySelectorAll('.logo img');
    
    logoImgs.forEach(img => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = 40;
        canvas.height = 40;
        
        // Draw recycling symbol
        ctx.fillStyle = '#0D9F6F';
        ctx.beginPath();
        ctx.arc(20, 20, 18, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(15, 10);
        ctx.lineTo(25, 10);
        ctx.lineTo(20, 20);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(10, 25);
        ctx.lineTo(15, 15);
        ctx.lineTo(25, 25);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(30, 15);
        ctx.lineTo(25, 25);
        ctx.lineTo(15, 25);
        ctx.closePath();
        ctx.fill();
        
        // Set the image source to the canvas data URL
        img.src = canvas.toDataURL();
    });
}

// Create placeholder hero image
function createPlaceholderHeroImage() {
    const heroImg = document.querySelector('.hero-image img');
    
    if (heroImg) {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = 500;
        canvas.height = 400;
        
        // Draw background
        ctx.fillStyle = '#e2f8ef';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw recycling bins
        drawRecyclingBin(ctx, 100, 250, '#0D9F6F');
        drawRecyclingBin(ctx, 200, 250, '#3B82F6');
        drawRecyclingBin(ctx, 300, 250, '#F59E0B');
        
        // Draw recycling symbol
        ctx.fillStyle = '#0D9F6F';
        ctx.beginPath();
        ctx.arc(250, 150, 50, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(230, 120);
        ctx.lineTo(270, 120);
        ctx.lineTo(250, 150);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(210, 180);
        ctx.lineTo(230, 150);
        ctx.lineTo(270, 180);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(290, 150);
        ctx.lineTo(270, 180);
        ctx.lineTo(230, 180);
        ctx.closePath();
        ctx.fill();
        
        // Set the image source to the canvas data URL
        heroImg.src = canvas.toDataURL();
    }
}

function drawRecyclingBin(ctx, x, y, color) {
    // Bin body
    ctx.fillStyle = color;
    ctx.fillRect(x - 30, y - 60, 60, 80);
    
    // Bin lid
    ctx.fillStyle = darkenColor(color, 20);
    ctx.beginPath();
    ctx.moveTo(x - 35, y - 60);
    ctx.lineTo(x + 35, y - 60);
    ctx.lineTo(x + 30, y - 70);
    ctx.lineTo(x - 30, y - 70);
    ctx.closePath();
    ctx.fill();
    
    // Recycling symbol on bin
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y - 30, 10, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = color;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♻️', x, y - 30);
}

// Helper function to darken a color
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (
        0x1000000 +
        (R < 0 ? 0 : R) * 0x10000 +
        (G < 0 ? 0 : G) * 0x100 +
        (B < 0 ? 0 : B)
    ).toString(16).slice(1);
}

// Initialize placeholder images when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createPlaceholderLogo();
    createPlaceholderHeroImage();
});