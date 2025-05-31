// Initialize Lucide icons
lucide.createIcons();

// Data
const rewardsData = [
  {
    id: 1,
    name: 'Garrafa Reutilizável',
    description: 'Garrafa ecológica de material reciclado',
    points: 300,
    imageUrl: 'https://images.pexels.com/photos/1516983/pexels-photo-1516983.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 2,
    name: 'Ecobag',
    description: 'Sacola sustentável para compras',
    points: 200,
    imageUrl: 'https://images.pexels.com/photos/5499889/pexels-photo-5499889.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 3,
    name: 'Kit Talheres',
    description: 'Conjunto de talheres de bambu',
    points: 400,
    imageUrl: 'https://images.pexels.com/photos/5765/wood-light-hand-wooden.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

const activityData = [
  {
    id: 1,
    type: 'earned',
    points: 150,
    description: 'Reciclagem de garrafas PET',
    date: 'Hoje'
  },
  {
    id: 2,
    type: 'spent',
    points: 200,
    description: 'Ecobag Sustentável',
    date: 'Ontem'
  },
  {
    id: 3,
    type: 'earned',
    points: 100,
    description: 'Reciclagem de papelão',
    date: '3 dias atrás'
  }
];

// DOM Elements
const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');
const rewardsGrid = document.getElementById('rewards-grid');
const activityList = document.getElementById('activity-list');
const currentYearSpan = document.getElementById('current-year');

// Header scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Mobile menu toggle
menuButton.addEventListener('click', () => {
  mobileNav.classList.toggle('active');
  const icon = menuButton.querySelector('.icon');
  if (mobileNav.classList.contains('active')) {
    icon.setAttribute('data-lucide', 'x');
  } else {
    icon.setAttribute('data-lucide', 'menu');
  }
  lucide.createIcons();
});

// Render rewards
function renderRewards() {
  rewardsGrid.innerHTML = rewardsData.map((reward, index) => `
    <div class="reward-card fade-in" style="animation-delay: ${index * 100}ms">
      <div class="reward-image">
        <img src="${reward.imageUrl}" alt="${reward.name}">
        <div class="reward-points">
          <i class="icon" data-lucide="gift"></i>
          ${reward.points} pts
        </div>
      </div>
      <div class="reward-content">
        <h3 class="reward-title">${reward.name}</h3>
        <p class="reward-description">${reward.description}</p>
        <button class="btn btn-primary redeem-btn" data-reward-id="${reward.id}">
          Resgatar
        </button>
      </div>
    </div>
  `).join('');

  // Reinitialize icons in new content
  lucide.createIcons();

  // Add redeem button handlers
  document.querySelectorAll('.redeem-btn').forEach(button => {
    button.addEventListener('click', handleRedeem);
  });
}

// Render activities
function renderActivities() {
  activityList.innerHTML = activityData.map((activity, index) => `
    <div class="activity-item ${activity.type} fade-in" style="animation-delay: ${index * 100}ms">
      <div class="activity-icon">
        <i class="icon" data-lucide="${activity.type === 'earned' ? 'arrow-up-right' : 'arrow-down-right'}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-header">
          <h3 class="activity-title">
            ${activity.type === 'earned' ? 'Pontos Ganhos' : 'Pontos Trocados'}
          </h3>
          <span class="activity-points">
            ${activity.type === 'earned' ? '+' : '-'}${activity.points} pts
          </span>
        </div>
        <p class="activity-description">${activity.description}</p>
        <div class="activity-date">
          <i class="icon" data-lucide="calendar"></i>
          <span>${activity.date}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Reinitialize icons in new content
  lucide.createIcons();
}

// Handle reward redemption
function handleRedeem(event) {
  const button = event.currentTarget;
  const rewardId = button.dataset.rewardId;
  
  // Disable button and show loading state
  button.disabled = true;
  button.innerHTML = `
    <div class="loading-spinner"></div>
    <span>Processando...</span>
  `;

  // Simulate API call
  setTimeout(() => {
    button.innerHTML = `
      <i class="icon" data-lucide="check"></i>
      <span>Resgatado!</span>
    `;
    button.classList.add('success');
    lucide.createIcons();

    // Reset button after 2 seconds
    setTimeout(() => {
      
      button.innerHTML = 'Resgatar';
      button.disabled = false;
      button.classList.remove('success');
    }, 2000);
  }, 1500);
}

// Initialize
function init() {
  renderRewards();
  renderActivities();
  currentYearSpan.textContent = new Date().getFullYear();
}

// Start the app
init();