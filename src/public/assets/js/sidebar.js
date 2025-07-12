// Sidebar functionality for all dashboard pages
// Este arquivo fornece funcionalidade consistente do sidebar em todas as páginas

class SidebarManager {
  constructor() {
    this.sidebar = null;
    this.sidebarToggle = null;
    this.sidebarOverlay = null;
    this.mainContent = null;
    this.sidebarLinks = null;
    this.resizeTimeout = null;
    
    this.init();
  }

  init() {
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Obter elementos
    this.sidebar = document.getElementById("sidebar");
    this.sidebarToggle = document.getElementById("sidebar-toggle");
    this.sidebarOverlay = document.getElementById("sidebar-overlay");
    this.mainContent = document.getElementById("main-content");
    this.sidebarLinks = document.querySelectorAll(".sidebar-nav a");

    if (!this.sidebar) {
      console.warn('Sidebar element not found');
      return;
    }

    this.setupEventListeners();
    this.adjustLayout();
    this.highlightCurrentPage();
    this.addLoadingStates();
  }

  setupEventListeners() {
    // Toggle button
    this.sidebarToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleSidebar();
    });

    // Overlay click
    this.sidebarOverlay?.addEventListener("click", () => {
      this.closeSidebar();
    });

    // Click outside sidebar (mobile only)
    document.addEventListener("click", (e) => {
      if (window.innerWidth < 768) {
        const isClickInsideSidebar = this.sidebar.contains(e.target);
        const isClickOnToggle = this.sidebarToggle?.contains(e.target);
        
        if (!isClickInsideSidebar && !isClickOnToggle && this.sidebar.classList.contains("open")) {
          this.closeSidebar();
        }
      }
    });

    // Sidebar navigation links
    this.sidebarLinks.forEach(link => {
      // Close sidebar on mobile when navigating
      link.addEventListener("click", () => {
        if (window.innerWidth < 768) {
          this.closeSidebar();
        }
      });
    });

    // Window resize with debounce
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.adjustLayout(), 100);
    });

    // ESC key to close sidebar
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.sidebar.classList.contains("open")) {
        this.closeSidebar();
      }
    });
  }

  toggleSidebar() {
    if (this.sidebar.classList.contains("open")) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    this.sidebar.classList.add("open");
    this.sidebarOverlay?.classList.add("visible");
    
    // Prevent body scroll on mobile
    if (window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    }

    // Adicionar atributos de acessibilidade
    this.sidebar.setAttribute('aria-expanded', 'true');
    this.sidebarToggle?.setAttribute('aria-expanded', 'true');
  }

  closeSidebar() {
    this.sidebar.classList.remove("open");
    this.sidebarOverlay?.classList.remove("visible");
    document.body.style.overflow = "";

    // Atualizar atributos de acessibilidade
    this.sidebar.setAttribute('aria-expanded', 'false');
    this.sidebarToggle?.setAttribute('aria-expanded', 'false');
  }

  adjustLayout() {
    if (!this.sidebar || !this.mainContent) return;

    if (window.innerWidth < 768) {
      // Mobile: sidebar sobrepõe o conteúdo
      this.mainContent.style.marginLeft = "0";
      this.closeSidebar();
    } else {
      // Desktop: sidebar sempre visível
      const sidebarWidth = this.sidebar.offsetWidth;
      this.mainContent.style.marginLeft = `${sidebarWidth}px`;
      this.closeSidebar(); // Remove classes de mobile
    }
  }

  highlightCurrentPage() {
    if (!this.sidebarLinks) return;

    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    this.sidebarLinks.forEach(link => {
      link.classList.remove('active');
      
      const linkPath = link.getAttribute('href');
      if (linkPath) {
        const linkPage = linkPath.split('/').pop();
        
        // Highlight current page
        if (linkPage === currentPage || 
            (currentPage === 'dashboardAdmin.html' && linkPage === 'dashboardAdmin.html') ||
            (currentPage === '' && linkPage === 'dashboardAdmin.html')) {
          link.classList.add('active');
        }
      }
    });
  }

  addLoadingStates() {
    if (!this.sidebarLinks) return;

    this.sidebarLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        // Adicionar estado de loading apenas se estiver navegando para outra página
        const href = link.getAttribute('href');
        if (href && !href.includes("#") && href !== window.location.pathname) {
          link.classList.add("loading");
          
          // Remover loading state após timeout (caso navegação não ocorra)
          setTimeout(() => {
            link.classList.remove("loading");
          }, 3000);
        }
      });
    });
  }

  // Método público para fechar sidebar (para uso externo)
  close() {
    this.closeSidebar();
  }

  // Método público para abrir sidebar (para uso externo)
  open() {
    this.openSidebar();
  }

  // Método para verificar se sidebar está aberta
  isOpen() {
    return this.sidebar?.classList.contains('open') || false;
  }
}

// Inicializar automaticamente
const sidebarManager = new SidebarManager();

// Exportar para uso global
window.sidebarManager = sidebarManager;

// Para compatibilidade com código existente
window.setupSidebar = () => {
  console.log('setupSidebar() is deprecated. Sidebar is now managed automatically.');
};
