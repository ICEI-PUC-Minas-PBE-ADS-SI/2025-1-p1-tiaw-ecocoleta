/**
 * DOARCOMAMOR - SISTEMA INTERATIVO DE DOAÇÕES
 * JavaScript completo para interface de doação responsiva
 * Autor: Sistema de Doações
 * Data: 2025
 */

// ============================================================================
// CONFIGURAÇÕES GLOBAIS E VARIÁVEIS
// ============================================================================

const CONFIG = {
  // Configurações de animação
  ANIMATION_DURATION: 300,
  SCROLL_THRESHOLD: 100,
  CONFETTI_DURATION: 3000,
  
  // Configurações de doação
  MIN_DONATION: 5,
  MAX_DONATION: 10000,
  
  // Metas e estatísticas
  TARGET_AMOUNT: 200000,
  CURRENT_AMOUNT: 125750,
  DONORS_COUNT: 1243,
  PROJECTS_COUNT: 18,
  
  // Sons (URLs podem ser configuradas)
  SOUNDS: {
    success: '/success-sound.mp3',
    click: '/click-sound.mp3'
  }
};

// Estado global da aplicação
const AppState = {
  currentTab: 'monthly',
  selectedCause: 'hunger',
  selectedAmount: '25',
  formStep: 1,
  soundEnabled: false,
  isScrolled: false,
  donationCount: 0,
  totalDonated: 0,
  userLevel: 'bronze',
  userPoints: 0,
  selectedPaymentMethod: 'credit',
  savedPaymentData: null,
  userEmail: '',
  userName: ''
};

// Cache de elementos DOM para performance
const Elements = {};

// ============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Iniciando DoarComAmor...');
  
  // Cache elementos DOM
  cacheElements();
  
  // Inicializar componentes
  initScrollProgress();
  initHeader();
  initHeroAnimations();
  initImpactMeter();
  initTabs();
  initDonationCards();  initDonationForm();
  initPaymentSystem();
  initTimeline();
  initBadgeSystem();
  initFloatingCTA();
  initSoundSystem();
  initScrollAnimations();
  initConfettiSystem();
  
  // Eventos globais
  setupGlobalEvents();
  
  console.log('✅ DoarComAmor inicializado com sucesso!');
});

// ============================================================================
// CACHE DE ELEMENTOS DOM
// ============================================================================

function cacheElements() {
  Elements.header = document.getElementById('main-header');
  Elements.scrollProgress = document.getElementById('scroll-progress');
  Elements.heroSection = document.getElementById('hero');
  Elements.impactMeter = document.querySelector('.impact-meter');
  Elements.progressFill = document.querySelector('.progress-fill');
  Elements.amountDisplay = document.querySelector('.amount-display');
  Elements.statNumbers = document.querySelectorAll('.stat-number');
  Elements.tabButtons = document.querySelectorAll('.tab-button');
  Elements.tabContents = document.querySelectorAll('.tab-content');
  Elements.donationCards = document.querySelectorAll('.donation-card');
  Elements.donationForm = document.querySelector('.donation-form');
  Elements.formSteps = document.querySelectorAll('.form-step');
  Elements.causeOptions = document.querySelectorAll('.cause-option');
  Elements.amountOptions = document.querySelectorAll('.amount-option');
  Elements.customAmountInput = document.querySelector('.custom-amount input');
  Elements.continueBtn = document.querySelector('.btn-continue');
  Elements.submitBtn = document.querySelector('.btn-submit');
  Elements.backBtn = document.querySelector('.btn-back');
  Elements.timelineItems = document.querySelectorAll('.timeline-item');
  Elements.badgeTabs = document.querySelectorAll('.badge-tab');  Elements.badgePanels = document.querySelectorAll('.badge-panel');
  Elements.floatingCTA = document.querySelector('.floating-cta');
  Elements.soundToggle = document.getElementById('toggle-sound');
  Elements.confettiContainer = document.getElementById('confetti-container');
  
  // Elementos de método de pagamento
  Elements.paymentMethods = document.querySelectorAll('.payment-method');
  Elements.paymentContainer = document.querySelector('.payment-container');
  Elements.savedPaymentInfo = document.querySelector('.saved-payment-info');
  Elements.useSavedPayment = document.querySelector('#use-saved-payment');
}

// ============================================================================
// SISTEMA DE SCROLL E PROGRESS BAR
// ============================================================================

function initScrollProgress() {
  let ticking = false;
  
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / docHeight;
    
    // Atualizar barra de progresso
    if (Elements.scrollProgress) {
      Elements.scrollProgress.style.transform = `scaleX(${scrollPercent})`;
      
      if (scrollTop > CONFIG.SCROLL_THRESHOLD) {
        Elements.scrollProgress.classList.add('visible');
      } else {
        Elements.scrollProgress.classList.remove('visible');
      }
    }
    
    ticking = false;
  }
  
  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
}

// ============================================================================
// HEADER INTERATIVO
// ============================================================================

function initHeader() {
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  function updateHeader() {
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
      Elements.header.classList.add('scrolled');
      AppState.isScrolled = true;
    } else {
      Elements.header.classList.remove('scrolled');
      AppState.isScrolled = false;
    }
    
    // Mostrar/ocultar floating CTA baseado no scroll
    updateFloatingCTA();
    
    lastScrollY = scrollY;
    ticking = false;
  }
  
  function requestHeaderUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
  
  // Navegação suave
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = Elements.header.offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================================================
// ANIMAÇÕES DO HERO
// ============================================================================

function initHeroAnimations() {
  const heroTitle = document.querySelector('#hero h1');
  const heroDescription = document.querySelector('#hero p');
  const heroActions = document.querySelector('.hero-actions');
  
  // Animação sequencial dos elementos do hero
  setTimeout(() => {
    if (heroTitle) heroTitle.style.animation = 'fadeInUp 1s ease-out forwards';
  }, 200);
  
  setTimeout(() => {
    if (heroDescription) heroDescription.style.animation = 'fadeInUp 1s ease-out forwards';
  }, 400);
  
  setTimeout(() => {
    if (heroActions) heroActions.style.animation = 'fadeInUp 1s ease-out forwards';
  }, 600);
  
  // Efeito de digitação no título (opcional)
  typewriterEffect();
}

function typewriterEffect() {
  const titleElement = document.querySelector('#hero h1');
  if (!titleElement) return;
  
  const originalText = titleElement.textContent;
  titleElement.textContent = '';
  titleElement.style.opacity = '1';
  
  let i = 0;
  function typeChar() {
    if (i < originalText.length) {
      titleElement.textContent += originalText.charAt(i);
      i++;
      setTimeout(typeChar, 50);
    }
  }
  
  setTimeout(typeChar, 1000);
}

// ============================================================================
// MEDIDOR DE IMPACTO ANIMADO
// ============================================================================

function initImpactMeter() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateImpactNumbers();
        animateProgressBar();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  if (Elements.impactMeter) {
    observer.observe(Elements.impactMeter);
  }
}

function animateImpactNumbers() {
  // Animar valor total arrecadado
  if (Elements.amountDisplay) {
    animateNumber(Elements.amountDisplay, 0, CONFIG.CURRENT_AMOUNT, 2000, (value) => {
      return formatCurrency(value);
    });
  }
  
  // Animar estatísticas
  Elements.statNumbers.forEach((element, index) => {
    const targetValue = index === 0 ? CONFIG.DONORS_COUNT : CONFIG.PROJECTS_COUNT;
    setTimeout(() => {
      animateNumber(element, 0, targetValue, 1500);
    }, index * 200);
  });
}

function animateProgressBar() {
  if (!Elements.progressFill) return;
  
  const percentage = Math.min((CONFIG.CURRENT_AMOUNT / CONFIG.TARGET_AMOUNT) * 100, 100);
  
  setTimeout(() => {
    Elements.progressFill.style.width = `${percentage}%`;
    
    // Animar marcos de progresso
    const milestones = document.querySelectorAll('.milestone');
    milestones.forEach((milestone, index) => {
      const milestoneValue = (index + 1) * 25;
      if (percentage >= milestoneValue) {
        setTimeout(() => {
          milestone.classList.add('achieved');
        }, (index + 1) * 300);
      }
    });
  }, 500);
}

function animateNumber(element, start, end, duration, formatter = null) {
  const startTime = performance.now();
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(start + (end - start) * easeOut);
    
    if (formatter) {
      element.textContent = formatter(currentValue);
    } else {
      element.textContent = currentValue.toLocaleString('pt-BR');
    }
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// ============================================================================
// SISTEMA DE TABS
// ============================================================================

function initTabs() {
  Elements.tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.id.replace('tab-', '');
      switchTab(tabId);
      playClickSound();
    });
  });
  
  // Inicializar badge tabs
  Elements.badgeTabs.forEach(button => {
    button.addEventListener('click', function() {
      const badgeId = this.id.replace('badge-', '');
      switchBadgeTab(badgeId);
      playClickSound();
    });
  });
}

function switchTab(tabId) {
  // Atualizar estado
  AppState.currentTab = tabId;
  
  // Atualizar botões
  Elements.tabButtons.forEach(button => {
    button.classList.remove('active');
    button.setAttribute('aria-selected', 'false');
  });
  
  const activeButton = document.getElementById(`tab-${tabId}`);
  if (activeButton) {
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-selected', 'true');
  }
  
  // Atualizar conteúdo
  Elements.tabContents.forEach(content => {
    content.classList.remove('active');
  });
  
  const activeContent = document.getElementById(`panel-${tabId}`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
  
  // Resetar formulário
  resetDonationForm();
}

function switchBadgeTab(badgeId) {
  // Atualizar botões
  Elements.badgeTabs.forEach(button => {
    button.classList.remove('active');
    button.setAttribute('aria-selected', 'false');
  });
  
  const activeButton = document.getElementById(`badge-${badgeId}`);
  if (activeButton) {
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-selected', 'true');
  }
  
  // Atualizar painéis
  Elements.badgePanels.forEach(panel => {
    panel.classList.remove('active');
  });
  
  const activePanel = document.getElementById(`badge-panel-${badgeId}`);
  if (activePanel) {
    activePanel.classList.add('active');
  }
}

// ============================================================================
// CARDS DE DOAÇÃO INTERATIVOS
// ============================================================================

function initDonationCards() {
  Elements.donationCards.forEach(card => {
    // Efeito hover
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
      if (!this.classList.contains('highlighted')) {
        this.style.transform = 'translateY(0)';
      }
    });
    
    // Seleção de card
    card.addEventListener('click', function() {
      selectDonationCard(this);
      playClickSound();
    });
    
    // Botão do card
    const cardBtn = card.querySelector('.card-btn');
    if (cardBtn) {
      cardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        selectDonationCard(card);
        playClickSound();
      });
    }
  });
}

function selectDonationCard(selectedCard) {
  // Remover seleção anterior
  Elements.donationCards.forEach(card => {
    card.classList.remove('highlighted');
    card.style.transform = 'translateY(0)';
    
    const btn = card.querySelector('.card-btn');
    const indicator = card.querySelector('.selected-indicator');
    
    if (btn) {
      btn.textContent = 'Selecionar';
      btn.classList.remove('selected');
    }
    
    if (indicator) {
      indicator.remove();
    }
  });
  
  // Adicionar seleção ao card clicado
  selectedCard.classList.add('highlighted');
  selectedCard.style.transform = 'translateY(-4px)';
  
  const btn = selectedCard.querySelector('.card-btn');
  if (btn) {
    btn.textContent = 'Selecionado';
    btn.classList.add('selected');
  }
  
  // Adicionar indicador visual
  const cardHeader = selectedCard.querySelector('.card-header');
  if (cardHeader && !selectedCard.querySelector('.selected-indicator')) {
    const indicator = document.createElement('div');
    indicator.className = 'selected-indicator';
    indicator.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
      </svg>
    `;
    cardHeader.appendChild(indicator);
  }
  
  // Extrair valor do card para o formulário
  const amountElement = selectedCard.querySelector('.amount');
  if (amountElement) {
    const amount = amountElement.textContent.replace('R$', '').trim();
    AppState.selectedAmount = amount;
    updateFormAmount(amount);
  }
  
  // Animação de confirmação
  selectedCard.style.animation = 'pulse 0.6s ease-in-out';
  setTimeout(() => {
    selectedCard.style.animation = '';
  }, 600);
}

// ============================================================================
// FORMULÁRIO DE DOAÇÃO
// ============================================================================

function initDonationForm() {
  // Opções de causa
  Elements.causeOptions.forEach(option => {
    option.addEventListener('click', function() {
      selectCause(this);
      playClickSound();
    });
  });
  
  // Opções de valor
  Elements.amountOptions.forEach(option => {
    option.addEventListener('click', function() {
      selectAmount(this);
      playClickSound();
    });
  });
  
  // Input de valor customizado
  if (Elements.customAmountInput) {
    Elements.customAmountInput.addEventListener('input', function() {
      validateCustomAmount(this.value);
      AppState.selectedAmount = this.value;
      updateFormValidation();
    });
    
    Elements.customAmountInput.addEventListener('focus', function() {
      // Desmarcar opções predefinidas
      Elements.amountOptions.forEach(option => {
        option.classList.remove('selected');
        const radio = option.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      });
    });
  }
  
  // Botões de navegação
  if (Elements.continueBtn) {
    Elements.continueBtn.addEventListener('click', function() {
      if (validateStep1()) {
        goToStep2();
        playClickSound();
      }
    });
  }
  
  if (Elements.backBtn) {
    Elements.backBtn.addEventListener('click', function() {
      goToStep1();
      playClickSound();
    });
  }
  
  // Submissão do formulário
  if (Elements.submitBtn) {
    Elements.submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (validateStep2()) {
        submitDonation();
      }
    });
  }
  
  // Validação em tempo real dos campos
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  
  if (nameInput) {
    nameInput.addEventListener('input', function() {
      validateName(this.value);
      updateFormValidation();
    });
  }
  
  if (emailInput) {
    emailInput.addEventListener('input', function() {
      validateEmail(this.value);
      updateFormValidation();
    });
  }
}

function selectCause(selectedOption) {
  Elements.causeOptions.forEach(option => {
    option.classList.remove('selected');
  });
  
  selectedOption.classList.add('selected');
  
  // Extrair ID da causa
  const causeText = selectedOption.querySelector('span').textContent;
  const causeMap = {
    'Combate à Fome': 'hunger',
    'Meio Ambiente': 'environment',
    'Educação': 'education'
  };
  
  AppState.selectedCause = causeMap[causeText] || 'hunger';
  updateFormValidation();
}

function selectAmount(selectedOption) {
  Elements.amountOptions.forEach(option => {
    option.classList.remove('selected');
    const radio = option.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
  
  selectedOption.classList.add('selected');
  const radio = selectedOption.querySelector('input[type="radio"]');
  if (radio) {
    radio.checked = true;
    AppState.selectedAmount = radio.value;
  }
  
  // Limpar input customizado
  if (Elements.customAmountInput) {
    Elements.customAmountInput.value = '';
  }
  
  updateFormValidation();
}

function validateCustomAmount(value) {
  const numValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
  
  if (isNaN(numValue) || numValue < CONFIG.MIN_DONATION) {
    showFieldError(Elements.customAmountInput, `Valor mínimo: R$ ${CONFIG.MIN_DONATION}`);
    return false;
  }
  
  if (numValue > CONFIG.MAX_DONATION) {
    showFieldError(Elements.customAmountInput, `Valor máximo: R$ ${CONFIG.MAX_DONATION.toLocaleString('pt-BR')}`);
    return false;
  }
  
  clearFieldError(Elements.customAmountInput);
  return true;
}

function validateName(name) {
  if (name.length < 2) {
    showFieldError(document.getElementById('name'), 'Nome deve ter pelo menos 2 caracteres');
    return false;
  }
  
  clearFieldError(document.getElementById('name'));
  return true;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    showFieldError(document.getElementById('email'), 'Email inválido');
    return false;
  }
  
  clearFieldError(document.getElementById('email'));
  return true;
}

function showFieldError(field, message) {
  clearFieldError(field);
  
  field.style.borderColor = '#ef4444';
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    animation: fadeIn 0.3s ease-out;
  `;
  
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.style.borderColor = '';
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
}

function validateStep1() {
  const hasSelectedCause = AppState.selectedCause !== '';
  const hasSelectedAmount = AppState.selectedAmount !== '' && parseFloat(AppState.selectedAmount) >= CONFIG.MIN_DONATION;
  
  if (!hasSelectedCause) {
    showNotification('Por favor, selecione uma causa', 'error');
    return false;
  }
  
  if (!hasSelectedAmount) {
    showNotification('Por favor, selecione um valor válido', 'error');
    return false;
  }
  
  return true;
}

function validateStep2() {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  
  const isNameValid = nameInput && validateName(nameInput.value);
  const isEmailValid = emailInput && validateEmail(emailInput.value);
  const isPaymentValid = validatePaymentMethod();
  
  if (!isPaymentValid) {
    showNotification('Por favor, complete os dados de pagamento', 'error');
  }
  
  return isNameValid && isEmailValid && isPaymentValid;
}

function updateFormValidation() {
  if (Elements.continueBtn) {
    const isValid = AppState.selectedCause && AppState.selectedAmount && parseFloat(AppState.selectedAmount) >= CONFIG.MIN_DONATION;
    Elements.continueBtn.disabled = !isValid;
  }
  
  if (Elements.submitBtn) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const isValid = nameInput?.value.length >= 2 && emailInput?.value.includes('@');
    Elements.submitBtn.disabled = !isValid;
  }
}

function updateFormAmount(amount) {
  // Atualizar resumo da doação
  const summaryAmount = document.querySelector('.summary-amount');
  if (summaryAmount) {
    const period = AppState.currentTab === 'monthly' ? '/mês' : '';
    summaryAmount.innerHTML = `R$ ${amount}<span>${period}</span>`;
  }
}

function goToStep2() {
  AppState.formStep = 2;
  
  Elements.formSteps.forEach((step, index) => {
    step.classList.remove('active');
    if (index === 1) {
      step.classList.add('active');
    }
  });
  
  updateFormAmount(AppState.selectedAmount);
  
  // Focar no primeiro campo
  const nameInput = document.getElementById('name');
  if (nameInput) {
    setTimeout(() => nameInput.focus(), 300);
  }
}

function goToStep1() {
  AppState.formStep = 1;
  
  Elements.formSteps.forEach((step, index) => {
    step.classList.remove('active');
    if (index === 0) {
      step.classList.add('active');
    }
  });
}

function resetDonationForm() {
  AppState.formStep = 1;
  AppState.selectedAmount = '';
  
  // Resetar steps
  Elements.formSteps.forEach((step, index) => {
    step.classList.remove('active');
    if (index === 0) {
      step.classList.add('active');
    }
  });
  
  // Limpar seleções
  Elements.causeOptions.forEach(option => {
    option.classList.remove('selected');
  });
  
  Elements.amountOptions.forEach(option => {
    option.classList.remove('selected');
    const radio = option.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
  
  // Limpar campos
  if (Elements.customAmountInput) Elements.customAmountInput.value = '';
  
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  
  // Limpar erros
  document.querySelectorAll('.field-error').forEach(error => error.remove());
  
  updateFormValidation();
}

// ============================================================================
// SISTEMA DE PAGAMENTO E DADOS SALVOS
// ============================================================================

function initPaymentSystem() {
  // Carregar dados salvos do usuário logado
  loadSavedUserData();
  
  // Verificar se há métodos de pagamento salvos
  checkSavedPaymentMethods();
  
  // Inicializar eventos de método de pagamento
  initPaymentMethodEvents();
}

function loadSavedUserData() {
  // Buscar usuário logado no localStorage
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  
  if (usuarioLogado) {
    AppState.userName = usuarioLogado.nome || '';
    AppState.userEmail = usuarioLogado.email || '';
    
    // Preencher dados automaticamente no formulário se disponíveis
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    if (nameInput && AppState.userName) {
      nameInput.value = AppState.userName;
      nameInput.setAttribute('data-auto-filled', 'true');
    }
    
    if (emailInput && AppState.userEmail) {
      emailInput.value = AppState.userEmail;
      emailInput.setAttribute('data-auto-filled', 'true');
    }
    
    // Carregar dados de pagamento salvos
    if (usuarioLogado.cartao) {
      AppState.savedPaymentData = {
        type: 'credit',
        ...usuarioLogado.cartao
      };
    } else if (usuarioLogado.pix) {
      AppState.savedPaymentData = {
        type: 'pix',
        ...usuarioLogado.pix
      };
    }
  }
}

function checkSavedPaymentMethods() {
  if (AppState.savedPaymentData) {
    // Mostrar opção de usar dados salvos
    showSavedPaymentOption();
  }
}

function showSavedPaymentOption() {
  if (!AppState.savedPaymentData) return;
  
  // Criar seção de dados salvos se não existir
  let savedPaymentSection = document.querySelector('.saved-payment-section');
  
  if (!savedPaymentSection) {
    const formStep2 = document.querySelector('.form-step:nth-child(2)');
    const summaryElement = formStep2?.querySelector('.donation-summary');
    
    if (summaryElement) {
      savedPaymentSection = document.createElement('div');
      savedPaymentSection.className = 'saved-payment-section';
      savedPaymentSection.innerHTML = generateSavedPaymentHTML();
      
      // Inserir antes do resumo da doação
      summaryElement.parentNode.insertBefore(savedPaymentSection, summaryElement);
      
      // Adicionar eventos
      initSavedPaymentEvents();
    }
  }
}

function generateSavedPaymentHTML() {
  const paymentData = AppState.savedPaymentData;
  const isCredit = paymentData.type === 'credit';
  
  return `
    <div class="payment-methods">
      <h4>Método de pagamento</h4>
      
      <div class="saved-payment-option">
        <label class="payment-method-card saved-payment active">
          <input type="radio" name="payment-method" value="saved" checked>
          <div class="payment-method-content">
            <div class="payment-method-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                ${isCredit ? 
                  '<path fill="currentColor" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>' :
                  '<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>'
                }
              </svg>
            </div>
            <div class="payment-method-details">
              <div class="payment-method-title">
                ${isCredit ? 'Cartão salvo' : 'PIX salvo'}
                <span class="saved-badge">Salvo</span>
              </div>
              <div class="payment-method-subtitle">
                ${isCredit ? 
                  `**** **** **** ${paymentData.numero?.slice(-4) || '****'}` :
                  paymentData.email || 'PIX configurado'
                }
              </div>
            </div>
            <div class="payment-method-security">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
              </svg>
              <span>Dados protegidos</span>
            </div>
          </div>
        </label>
      </div>
      
      <div class="alternative-payment-options">
        <button type="button" class="btn-alt-payment">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
          Usar outro método
        </button>
      </div>
    </div>
    
    <div class="new-payment-methods" style="display: none;">
      <div class="payment-method-tabs">
        <button type="button" class="payment-tab active" data-method="credit">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
          </svg>
          Cartão de Crédito
        </button>
        <button type="button" class="payment-tab" data-method="pix">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          PIX
        </button>
      </div>
      
      <div class="payment-content">
        <div class="payment-form credit-form active">
          <div class="form-row">
            <div class="form-group full-width">
              <label for="card-number">Número do cartão</label>
              <input type="text" id="card-number" placeholder="**** **** **** ****" maxlength="19">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="card-name">Nome no cartão</label>
              <input type="text" id="card-name" placeholder="Nome completo">
            </div>
            <div class="form-group">
              <label for="card-expiry">Validade</label>
              <input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="card-cvv">CVV</label>
              <input type="text" id="card-cvv" placeholder="***" maxlength="4">
            </div>
            <div class="form-group">
              <label class="checkbox-group">
                <input type="checkbox" id="save-card">
                <span class="checkmark"></span>
                Salvar para próximas doações
              </label>
            </div>
          </div>
        </div>
        
        <div class="payment-form pix-form">
          <div class="pix-info">
            <div class="pix-icon">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="pix-details">
              <h5>Pagamento via PIX</h5>
              <p>Após finalizar, você receberá as instruções para pagamento via PIX</p>
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox-group">
              <input type="checkbox" id="save-pix">
              <span class="checkmark"></span>
              Salvar preferência PIX para próximas doações
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
}

function initSavedPaymentEvents() {
  // Botão para usar outro método
  const altPaymentBtn = document.querySelector('.btn-alt-payment');
  if (altPaymentBtn) {
    altPaymentBtn.addEventListener('click', showAlternativePaymentMethods);
  }
  
  // Tabs de método de pagamento
  const paymentTabs = document.querySelectorAll('.payment-tab');
  paymentTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      switchPaymentTab(this.getAttribute('data-method'));
    });
  });
  
  // Formatação de inputs
  initPaymentInputFormatting();
  
  // Validação em tempo real
  initPaymentValidation();
}

function initPaymentMethodEvents() {
  // Este método é chamado quando não há dados salvos
  // Implementar inicialização de métodos de pagamento padrão se necessário
}

function showAlternativePaymentMethods() {
  const savedOption = document.querySelector('.saved-payment-option');
  const newMethods = document.querySelector('.new-payment-methods');
  const altBtn = document.querySelector('.btn-alt-payment');
  
  if (savedOption && newMethods && altBtn) {
    savedOption.style.display = 'none';
    altBtn.style.display = 'none';
    newMethods.style.display = 'block';
    
    // Desmarcar opção salva
    const savedRadio = savedOption.querySelector('input[type="radio"]');
    if (savedRadio) savedRadio.checked = false;
    
    AppState.selectedPaymentMethod = 'credit';
    
    // Animar entrada
    newMethods.style.opacity = '0';
    newMethods.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      newMethods.style.transition = 'all 0.3s ease-out';
      newMethods.style.opacity = '1';
      newMethods.style.transform = 'translateY(0)';
    }, 10);
  }
}

function switchPaymentTab(method) {
  AppState.selectedPaymentMethod = method;
  
  // Atualizar tabs
  const tabs = document.querySelectorAll('.payment-tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-method') === method) {
      tab.classList.add('active');
    }
  });
  
  // Atualizar formulários
  const forms = document.querySelectorAll('.payment-form');
  forms.forEach(form => {
    form.classList.remove('active');
    if (form.classList.contains(`${method}-form`)) {
      form.classList.add('active');
    }
  });
}

function initPaymentInputFormatting() {
  // Formatação do número do cartão
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function() {
      let value = this.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
      let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) {
        formattedValue = formattedValue.substring(0, 19);
      }
      this.value = formattedValue;
    });
  }
  
  // Formatação da validade
  const cardExpiryInput = document.getElementById('card-expiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      this.value = value;
    });
  }
  
  // Formatação do CVV
  const cardCvvInput = document.getElementById('card-cvv');
  if (cardCvvInput) {
    cardCvvInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').substring(0, 4);
    });
  }
}

function initPaymentValidation() {
  const cardNumberInput = document.getElementById('card-number');
  const cardNameInput = document.getElementById('card-name');
  const cardExpiryInput = document.getElementById('card-expiry');
  const cardCvvInput = document.getElementById('card-cvv');
  
  if (cardNumberInput) {
    cardNumberInput.addEventListener('blur', function() {
      validateCardNumber(this.value);
    });
  }
  
  if (cardNameInput) {
    cardNameInput.addEventListener('blur', function() {
      validateCardName(this.value);
    });
  }
  
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('blur', function() {
      validateCardExpiry(this.value);
    });
  }
  
  if (cardCvvInput) {
    cardCvvInput.addEventListener('blur', function() {
      validateCardCvv(this.value);
    });
  }
}

function validateCardNumber(number) {
  const cleanNumber = number.replace(/\s/g, '');
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    showFieldError(document.getElementById('card-number'), 'Número do cartão inválido');
    return false;
  }
  
  // Validação Luhn Algorithm
  if (!isValidCardNumber(cleanNumber)) {
    showFieldError(document.getElementById('card-number'), 'Número do cartão inválido');
    return false;
  }
  
  clearFieldError(document.getElementById('card-number'));
  return true;
}

function validateCardName(name) {
  if (name.length < 2 || !name.includes(' ')) {
    showFieldError(document.getElementById('card-name'), 'Nome completo é obrigatório');
    return false;
  }
  
  clearFieldError(document.getElementById('card-name'));
  return true;
}

function validateCardExpiry(expiry) {
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (!month || !year || month < 1 || month > 12) {
    showFieldError(document.getElementById('card-expiry'), 'Data de validade inválida');
    return false;
  }
  
  const expYear = parseInt('20' + year);
  const expMonth = parseInt(month);
  const currentFullYear = currentDate.getFullYear();
  
  if (expYear < currentFullYear || (expYear === currentFullYear && expMonth < currentMonth)) {
    showFieldError(document.getElementById('card-expiry'), 'Cartão expirado');
    return false;
  }
  
  clearFieldError(document.getElementById('card-expiry'));
  return true;
}

function validateCardCvv(cvv) {
  if (cvv.length < 3 || cvv.length > 4) {
    showFieldError(document.getElementById('card-cvv'), 'CVV inválido');
    return false;
  }
  
  clearFieldError(document.getElementById('card-cvv'));
  return true;
}

function isValidCardNumber(number) {
  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

function validatePaymentMethod() {
  const savedPaymentRadio = document.querySelector('input[name="payment-method"][value="saved"]');
  
  if (savedPaymentRadio && savedPaymentRadio.checked) {
    return true; // Dados salvos são válidos
  }
  
  if (AppState.selectedPaymentMethod === 'credit') {
    const cardNumber = document.getElementById('card-number')?.value;
    const cardName = document.getElementById('card-name')?.value;
    const cardExpiry = document.getElementById('card-expiry')?.value;
    const cardCvv = document.getElementById('card-cvv')?.value;
    
    return validateCardNumber(cardNumber) &&
           validateCardName(cardName) &&
           validateCardExpiry(cardExpiry) &&
           validateCardCvv(cardCvv);
  } else if (AppState.selectedPaymentMethod === 'pix') {
    return true; // PIX sempre válido
  }
  
  return false;
}

function savePaymentData() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (!usuarioLogado) return;
  
  const savedPaymentRadio = document.querySelector('input[name="payment-method"][value="saved"]');
  
  // Se está usando dados salvos, não precisa salvar novamente
  if (savedPaymentRadio && savedPaymentRadio.checked) {
    return;
  }
  
  if (AppState.selectedPaymentMethod === 'credit') {
    const saveCard = document.getElementById('save-card')?.checked;
    
    if (saveCard) {
      usuarioLogado.cartao = {
        numero: document.getElementById('card-number')?.value,
        nome: document.getElementById('card-name')?.value,
        validade: document.getElementById('card-expiry')?.value,
        cvv: document.getElementById('card-cvv')?.value
      };
      
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
      
      showNotification('Dados do cartão salvos com segurança', 'success');
    }
  } else if (AppState.selectedPaymentMethod === 'pix') {
    const savePix = document.getElementById('save-pix')?.checked;
    
    if (savePix) {
      usuarioLogado.pix = {
        email: usuarioLogado.email,
        preferencia: true
      };
      
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
      
      showNotification('Preferência PIX salva', 'success');
    }
  }
}

function getPaymentMethodDisplay() {
  const savedPaymentRadio = document.querySelector('input[name="payment-method"][value="saved"]');
  
  if (savedPaymentRadio && savedPaymentRadio.checked && AppState.savedPaymentData) {
    return AppState.savedPaymentData.type === 'credit' ? 'Cartão salvo' : 'PIX salvo';
  }
  
  return AppState.selectedPaymentMethod === 'credit' ? 'Cartão de crédito' : 'PIX';
}

// ============================================================================
// SUBMISSÃO DE DOAÇÃO E CONFIRMAÇÃO
// ============================================================================

function submitDonation() {
  const submitBtn = Elements.submitBtn;
  if (!submitBtn) return;
  
  // Estado de loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
      <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Processando...
  `;
  
  // Salvar dados de pagamento se necessário
  savePaymentData();
  
  // Registrar doação no sistema do usuário se logado
  registerUserDonation();
  
  // Simular processamento
  setTimeout(() => {
    processDonationSuccess();
  }, 2000);
}

function registerUserDonation() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (!usuarioLogado) return;
  
  const donationData = {
    tipo: getPaymentMethodDisplay(),
    valor: parseFloat(AppState.selectedAmount),
    detalhes: getPaymentDetails(),
    data: new Date().toISOString(),
    causa: AppState.selectedCause,
    frequencia: AppState.currentTab
  };
  
  // Registrar doação no histórico do usuário
  const usuarioId = usuarioLogado.id || usuarioLogado.email;
  const key = `doacoesRecentes_${usuarioId}`;
  const doacoes = JSON.parse(localStorage.getItem(key)) || [];
  
  doacoes.unshift(donationData);
  localStorage.setItem(key, JSON.stringify(doacoes.slice(0, 10))); // Manter apenas 10 doações
  
  console.log('Doação registrada para o usuário:', donationData);
}

function getPaymentDetails() {
  const savedPaymentRadio = document.querySelector('input[name="payment-method"][value="saved"]');
  
  if (savedPaymentRadio && savedPaymentRadio.checked && AppState.savedPaymentData) {
    if (AppState.savedPaymentData.type === 'credit') {
      return {
        numero: AppState.savedPaymentData.numero,
        nome: AppState.savedPaymentData.nome,
        validade: AppState.savedPaymentData.validade
      };
    } else {
      return {
        email: AppState.savedPaymentData.email || AppState.userEmail
      };
    }
  }
  
  if (AppState.selectedPaymentMethod === 'credit') {
    return {
      numero: document.getElementById('card-number')?.value,
      nome: document.getElementById('card-name')?.value,
      validade: document.getElementById('card-expiry')?.value
    };
  } else {
    return {
      email: AppState.userEmail
    };
  }
}

function processDonationSuccess() {
  const amount = parseFloat(AppState.selectedAmount);
  
  // Atualizar estatísticas
  AppState.donationCount++;
  AppState.totalDonated += amount;
  CONFIG.CURRENT_AMOUNT += amount;
  CONFIG.DONORS_COUNT++;
  
  // Atualizar pontos do usuário
  const points = Math.floor(amount / 5);
  AppState.userPoints += points;
  updateUserLevel();
  
  // Resetar botão
  const submitBtn = Elements.submitBtn;
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      Finalizar doação
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
      </svg>
    `;
  }
  
  // Efeitos de confirmação
  showSuccessNotification();
  triggerConfetti();
  playSuccessSound();
  updateImpactDisplay();
  
  // Resetar formulário após delay
  setTimeout(() => {
    resetDonationForm();
  }, 3000);
  
  // Verificar conquistas
  checkAchievements();
}

function showSuccessNotification() {
  const notification = document.createElement('div');
  notification.className = 'success-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
      </svg>
      <div>
        <h4>Doação realizada com sucesso!</h4>
        <p>Obrigado por fazer a diferença. Você ganhou ${Math.floor(parseFloat(AppState.selectedAmount) / 5)} pontos!</p>
      </div>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
    color: white;
    padding: 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideInRight 0.5s ease-out;
    max-width: 400px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.5s ease-out reverse';
    setTimeout(() => notification.remove(), 500);
  }, 4000);
}

function updateImpactDisplay() {
  // Atualizar valor total
  if (Elements.amountDisplay) {
    animateNumber(Elements.amountDisplay, CONFIG.CURRENT_AMOUNT - parseFloat(AppState.selectedAmount), CONFIG.CURRENT_AMOUNT, 1000, formatCurrency);
  }
  
  // Atualizar contador de doadores
  const donorsElement = document.querySelector('.stat-number');
  if (donorsElement) {
    animateNumber(donorsElement, CONFIG.DONORS_COUNT - 1, CONFIG.DONORS_COUNT, 800);
  }
  
  // Atualizar barra de progresso
  setTimeout(() => {
    animateProgressBar();
  }, 500);
}

// ============================================================================
// SISTEMA DE GAMIFICAÇÃO E CONQUISTAS
// ============================================================================

function updateUserLevel() {
  const previousLevel = AppState.userLevel;
  
  if (AppState.userPoints >= 500) {
    AppState.userLevel = 'platinum';
  } else if (AppState.userPoints >= 250) {
    AppState.userLevel = 'gold';
  } else if (AppState.userPoints >= 100) {
    AppState.userLevel = 'silver';
  } else {
    AppState.userLevel = 'bronze';
  }
  
  // Se subiu de nível, mostrar notificação
  if (previousLevel !== AppState.userLevel) {
    showLevelUpNotification(AppState.userLevel);
  }
}

function showLevelUpNotification(newLevel) {
  const levelNames = {
    bronze: 'Bronze',
    silver: 'Prata',
    gold: 'Ouro',
    platinum: 'Platinum'
  };
  
  const notification = document.createElement('div');
  notification.className = 'level-up-notification';
  notification.innerHTML = `
    <div class="level-up-content">
      <svg width="32" height="32" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/>
      </svg>
      <div>
        <h4>Parabéns! Você subiu de nível!</h4>
        <p>Agora você é <strong>${levelNames[newLevel]}</strong>!</p>
      </div>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    z-index: 1001;
    animation: scaleIn 0.5s ease-out;
    text-align: center;
  `;
  
  document.body.appendChild(notification);
  
  // Efeito especial para level up
  triggerConfetti();
  
  setTimeout(() => {
    notification.style.animation = 'scaleIn 0.5s ease-out reverse';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

function checkAchievements() {
  const achievements = [
    {
      id: 'first_donation',
      name: 'Primeira Doação',
      description: 'Fez sua primeira doação',
      condition: () => AppState.donationCount === 1
    },
    {
      id: 'generous_heart',
      name: 'Coração Generoso',
      description: 'Fez 5 doações',
      condition: () => AppState.donationCount === 5
    },
    {
      id: 'big_donor',
      name: 'Grande Doador',
      description: 'Doou mais de R$ 500',
      condition: () => AppState.totalDonated >= 500
    }
  ];
  
  achievements.forEach(achievement => {
    if (achievement.condition() && !hasAchievement(achievement.id)) {
      unlockAchievement(achievement);
    }
  });
}

function hasAchievement(achievementId) {
  const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
  return unlockedAchievements.includes(achievementId);
}

function unlockAchievement(achievement) {
  const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
  unlockedAchievements.push(achievement.id);
  localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
  
  showAchievementNotification(achievement);
}

function showAchievementNotification(achievement) {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-content">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/>
      </svg>
      <div>
        <h4>Conquista Desbloqueada!</h4>
        <p><strong>${achievement.name}</strong></p>
        <p>${achievement.description}</p>
      </div>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    padding: 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideInLeft 0.5s ease-out;
    max-width: 350px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideInLeft 0.5s ease-out reverse';
    setTimeout(() => notification.remove(), 500);
  }, 4000);
}

// ============================================================================
// TIMELINE ANIMADA
// ============================================================================

function initTimeline() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
      }
    });
  }, { threshold: 0.3 });
  
  Elements.timelineItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      observer.observe(item);
    }, index * 100);
  });
}

// ============================================================================
// SISTEMA DE BADGES
// ============================================================================

function initBadgeSystem() {
  // Já inicializado no initTabs()
  // Aqui podemos adicionar animações específicas dos badges
  
  const badgeIcons = document.querySelectorAll('.badge-icon');
  badgeIcons.forEach(icon => {
    icon.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    icon.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) rotate(0deg)';
    });
  });
}

// ============================================================================
// FLOATING CTA
// ============================================================================

function initFloatingCTA() {
  if (!Elements.floatingCTA) return;
  
  Elements.floatingCTA.addEventListener('click', function() {
    // Scroll para seção de doação
    const donationSection = document.getElementById('causas');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth' });
    }
    playClickSound();
  });
}

function updateFloatingCTA() {
  if (!Elements.floatingCTA) return;
  
  const heroSection = Elements.heroSection;
  if (!heroSection) return;
  
  const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
  const scrollPosition = window.scrollY + window.innerHeight;
  
  if (scrollPosition > heroBottom && AppState.isScrolled) {
    Elements.floatingCTA.classList.add('visible');
  } else {
    Elements.floatingCTA.classList.remove('visible');
  }
}

// ============================================================================
// SISTEMA DE SOM
// ============================================================================

function initSoundSystem() {
  if (Elements.soundToggle) {
    Elements.soundToggle.addEventListener('click', function() {
      AppState.soundEnabled = !AppState.soundEnabled;
      updateSoundToggle();
      
      if (AppState.soundEnabled) {
        playClickSound();
      }
    });
  }
  
  updateSoundToggle();
}

function updateSoundToggle() {
  if (!Elements.soundToggle) return;
  
  const icon = Elements.soundToggle.querySelector('svg');
  if (AppState.soundEnabled) {
    Elements.soundToggle.classList.remove('muted');
    if (icon) {
      icon.innerHTML = `
        <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      `;
    }
  } else {
    Elements.soundToggle.classList.add('muted');
    if (icon) {
      icon.innerHTML = `
        <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      `;
    }
  }
}

function playClickSound() {
  if (!AppState.soundEnabled) return;
  
  // Criar um som sintético simples
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playSuccessSound() {
  if (!AppState.soundEnabled) return;
  
  // Som de sucesso mais elaborado
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Primeira nota
  setTimeout(() => playNote(audioContext, 523.25, 0.2), 0);    // C5
  setTimeout(() => playNote(audioContext, 659.25, 0.2), 150); // E5
  setTimeout(() => playNote(audioContext, 783.99, 0.3), 300); // G5
}

function playNote(audioContext, frequency, duration) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// ============================================================================
// ANIMAÇÕES DE SCROLL
// ============================================================================

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Diferentes tipos de animação baseados na classe
        if (element.classList.contains('donation-card')) {
          element.style.animation = 'fadeInUp 0.6s ease-out forwards';
        } else if (element.classList.contains('reward-card')) {
          element.style.animation = 'scaleIn 0.5s ease-out forwards';
        } else {
          element.style.animation = 'fadeInUp 0.8s ease-out forwards';
        }
        
        observer.unobserve(element);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Observar elementos que devem animar
  const animatedElements = document.querySelectorAll(`
    .donation-card,
    .reward-card,
    .timeline-content,
    .badge-panel,
    section header
  `);
  
  animatedElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    observer.observe(element);
  });
}

// ============================================================================
// SISTEMA DE CONFETE
// ============================================================================

function initConfettiSystem() {
  // Sistema de confete será ativado quando necessário
}

function triggerConfetti() {
  if (!Elements.confettiContainer) return;
  
  const colors = ['#22c55e', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
    }, i * 50);
  }
}

function createConfettiPiece(color) {
  const confetti = document.createElement('div');
  confetti.style.cssText = `
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${color};
    top: -10px;
    left: ${Math.random() * 100}%;
    transform: rotate(${Math.random() * 360}deg);
    animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
    z-index: 9999;
  `;
  
  Elements.confettiContainer.appendChild(confetti);
  
  // Remover após animação
  setTimeout(() => {
    if (confetti.parentNode) {
      confetti.parentNode.removeChild(confetti);
    }
  }, 5000);
}

// Adicionar animação de confete ao CSS dinamicamente
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
  @keyframes confettiFall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
  
  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(confettiStyle);

// ============================================================================
// EVENTOS GLOBAIS E UTILITÁRIOS
// ============================================================================

function setupGlobalEvents() {
  // Prevenir zoom em inputs no iOS
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  });
  
  // Salvar estado no localStorage
  window.addEventListener('beforeunload', function() {
    localStorage.setItem('appState', JSON.stringify({
      donationCount: AppState.donationCount,
      totalDonated: AppState.totalDonated,
      userPoints: AppState.userPoints,
      userLevel: AppState.userLevel
    }));
  });
  
  // Carregar estado do localStorage
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    const parsed = JSON.parse(savedState);
    Object.assign(AppState, parsed);
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Fechar modais ou resetar formulário
      if (AppState.formStep === 2) {
        goToStep1();
      }
    }
    
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      // Prevenir submit acidental
      if (e.target.tagName === 'INPUT') {
        e.preventDefault();
      }
    }
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  const colors = {
    success: 'linear-gradient(135deg, #22c55e, #10b981)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================================================
// PERFORMANCE E OTIMIZAÇÕES
// ============================================================================

// Debounce function para otimizar eventos de scroll
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function para eventos frequentes
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// LOGS E DEBUG (apenas em desenvolvimento)
// ============================================================================



// ============================================================================
// FIM DO SCRIPT
// ============================================================================

console.log('📝 DoarComAmor JavaScript carregado com sucesso!');