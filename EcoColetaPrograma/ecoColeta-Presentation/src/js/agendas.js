// Agendas - EcoColeta
// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Classe principal para gerenciar as agendas
class AgendasManager {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.pontosDeColeta = [];
    this.userCollectionPoints = [];
    this.userAgendas = [];
    
    this.init();
  }
  
  // Obter usuário atualmente logado
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('usuarioLogado');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter usuário logado:', error);
      return null;
    }
  }
  
  async init() {
    // Validar se usuário está logado antes de continuar
    if (!this.validateUserAuth()) {
      return;
    }

    // Carrega os dados necessários
    await this.loadData();
    
    // Inicializa os elementos da página
    this.setupEventListeners();
  }

  // Validar autenticação do usuário
  validateUserAuth() {
    if (!this.currentUser) {
      console.warn('Usuário não autenticado. Redirecionando para login...');
      
      // Redirecionar para página de login após um breve delay
      setTimeout(() => {
        window.location.href = 'autent.html';
      }, 1000);
      
      return false;
    }

    // Verificar se o token ainda é válido (opcional)
    const lastLogin = localStorage.getItem('lastLoginTime');
    if (lastLogin) {
      const loginTime = new Date(lastLogin);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
      
      // Expirar sessão após 24 horas
      if (hoursDiff > 24) {
        console.warn('Sessão expirada. Redirecionando para login...');
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('lastLoginTime');
        
        setTimeout(() => {
          window.location.href = 'autent.html';
        }, 1000);
        
        return false;
      }
    }

    console.log(`Agendas carregadas para usuário: ${this.currentUser.nome} (ID: ${this.currentUser.id})`);
    return true;
  }

  // Carregamento de dados necessários
  async loadData() {
    try {
      // Mostrar estado de carregamento
      document.querySelector('.agendas-loading').style.display = 'flex';
      document.querySelector('#agendas-list').style.display = 'none';
      document.querySelector('.agendas-empty').style.display = 'none';
      
      // Buscar pontos de coleta
      const pontosResponse = await fetch(`${API_BASE_URL}/pontosDeColeta`);
      this.pontosDeColeta = await pontosResponse.json();
      
      // Filtrar apenas os pontos do usuário logado
      await this.loadUserCollectionPoints();
      
      // Carregar agendas dos pontos do usuário
      this.loadUserAgendas();
      
      // Atualizar estatísticas
      this.updateAgendaStats();
      
      // Renderizar pontos e agendas
      this.renderUserCollectionPoints();
      this.renderAgendas(this.userAgendas);
      
      // Esconder estado de carregamento
      document.querySelector('.agendas-loading').style.display = 'none';
      document.querySelector('#agendas-list').style.display = 'flex';
      
      if (this.userAgendas.length === 0) {
        document.querySelector('.agendas-empty').style.display = 'flex';
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      document.querySelector('.agendas-loading').style.display = 'none';
      document.querySelector('.agendas-empty').style.display = 'flex';
      document.querySelector('.agendas-empty-text').textContent = 'Erro ao carregar as agendas. Tente novamente.';
    }
  }

  // Carregar pontos de coleta do usuário
  async loadUserCollectionPoints() {
    // Filtrar pontos de coleta baseado no email do usuário
    this.userCollectionPoints = this.pontosDeColeta.filter(ponto => {
      // Verificar se o ponto tem relação com o usuário logado (pelo email)
      return ponto.criadoPor === this.currentUser.id || 
             (ponto.email && ponto.email === this.currentUser.email);
    });
    
    console.log(`Pontos de coleta do usuário: ${this.userCollectionPoints.length}`);
  }

  // Carregar todas as agendas dos pontos de coleta do usuário
  loadUserAgendas() {
    this.userAgendas = [];
    
    this.userCollectionPoints.forEach(ponto => {
      if (ponto.agenda && ponto.agenda.length > 0) {
        ponto.agenda.forEach(agenda => {
          this.userAgendas.push({
            ...agenda,
            pontoColetaId: ponto.id,
            pontoColetaNome: ponto.nome,
            pontoColetaEndereco: ponto.endereco
          });
        });
      }
    });

    console.log(`Total de agendas do usuário: ${this.userAgendas.length}`);
  }

  // Atualizar estatísticas das agendas
  updateAgendaStats() {
    // Total de agendas
    document.getElementById('total-agendas').textContent = this.userAgendas.length;
    
    // Agendas de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const agendasHoje = this.userAgendas.filter(agenda => {
      const dataAgenda = new Date(agenda.dataHoraInicio);
      return dataAgenda >= hoje && dataAgenda < amanha;
    });
    document.getElementById('agendas-hoje').textContent = agendasHoje.length;
    
    // Agendas pendentes
    const agendasPendentes = this.userAgendas.filter(agenda => 
      agenda.status === 'pendente' || agenda.status === 'agendado'
    );
    document.getElementById('agendas-pendentes').textContent = agendasPendentes.length;
    
    // Agendas concluídas
    const agendasConcluidas = this.userAgendas.filter(agenda => 
      agenda.status === 'concluido'
    );
    document.getElementById('agendas-concluidas').textContent = agendasConcluidas.length;
  }

  // Renderizar os pontos de coleta do usuário
  renderUserCollectionPoints() {
    const container = document.getElementById('user-collection-points');
    if (!container) return;

    if (this.userCollectionPoints.length === 0) {
      container.innerHTML = '<p class="no-points-message">Você não possui pontos de coleta cadastrados.</p>';
      return;
    }

    const pointsHTML = this.userCollectionPoints.map(ponto => {
      const statusClass = ponto.status === 'maintenance' ? 'maintenance' : 'active';
      const statusText = ponto.status === 'maintenance' ? 'Manutenção' : 'Ativo';
      
      // Contar agendas pendentes para este ponto
      const agendasPendentes = ponto.agenda ? 
        ponto.agenda.filter(a => a.status === 'pendente' || a.status === 'agendado').length : 0;
      
      // Contar coletores ativos para este ponto
      const coletoresAtivos = ponto.coletores ? ponto.coletores.length : 0;
      
      // Materiais aceitos
      const materiaisHTML = ponto.materiaisAceitos ? 
        ponto.materiaisAceitos.map(material => 
          `<span class="material-tag ${material}">${this.formatMaterialName(material)}</span>`
        ).join('') : '';
      
      return `
        <div class="collection-point-item" data-ponto-id="${ponto.id}">
          <div class="point-header">
            <div class="point-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="point-info">
              <h4 class="point-name">${ponto.nome}</h4>
              <p class="point-address">${ponto.endereco}</p>
            </div>
            <span class="point-status ${statusClass}">${statusText}</span>
          </div>
          <div class="point-materials">
            ${materiaisHTML}
          </div>
          <div class="point-stats">
            <div class="stat">
              <span class="stat-label">Coletores ativos</span>
              <span class="stat-value">${coletoresAtivos}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Agendas pendentes</span>
              <span class="stat-value">${agendasPendentes}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = pointsHTML;
    
    // Adicionar listeners para filtrar agendas por ponto
    document.querySelectorAll('.collection-point-item').forEach(item => {
      item.addEventListener('click', () => {
        const pontoId = item.dataset.pontoId;
        this.filterAgendasByPoint(pontoId);
      });
    });
  }

  // Formatar nome do material
  formatMaterialName(material) {
    const materialMap = {
      'plastico': 'Plástico',
      'papel': 'Papel',
      'vidro': 'Vidro',
      'metal': 'Metal',
      'eletronicos': 'Eletrônicos',
      'pilhas': 'Pilhas',
      'baterias': 'Baterias',
      'oleo': 'Óleo'
    };
    
    return materialMap[material] || material.charAt(0).toUpperCase() + material.slice(1);
  }

  // Filtrar agendas por ponto de coleta
  filterAgendasByPoint(pontoId) {
    const filteredAgendas = this.userAgendas.filter(agenda => agenda.pontoColetaId === parseInt(pontoId));
    const ponto = this.userCollectionPoints.find(p => p.id === parseInt(pontoId));
    
    this.renderAgendas(filteredAgendas, ponto);
  }

  // Mostrar todas as agendas
  showAllAgendas() {
    this.renderAgendas(this.userAgendas);
  }

  // Renderizar agendas
  renderAgendas(agendas, ponto = null) {
    const container = document.getElementById('agendas-list');
    const emptyElement = document.querySelector('.agendas-empty');

    if (!container) return;

    if (agendas.length === 0) {
      container.innerHTML = '';
      if (emptyElement) {
        const emptyText = ponto 
          ? `Nenhum agendamento encontrado para ${ponto.nome}`
          : 'Nenhuma agenda encontrada';
        emptyElement.querySelector('.agendas-empty-text').textContent = emptyText;
        emptyElement.style.display = 'flex';
      }
      return;
    }

    if (emptyElement) emptyElement.style.display = 'none';

    let headerHTML = '';
    if (ponto) {
      headerHTML = `
        <div class="agendas-filter-header">
          <div class="filter-info">
            <h3>Agendas para: ${ponto.nome}</h3>
            <p>${ponto.endereco}</p>
          </div>
          <button class="btn-secondary" id="ver-todas-agendas">
            Ver Todas as Agendas
          </button>
        </div>
      `;
    }

    const agendasHTML = agendas.map(agenda => this.createAgendaHTML(agenda)).join('');
    container.innerHTML = headerHTML + agendasHTML;

    // Setup action buttons
    this.setupAgendaActions();
  }

  // Criar HTML para uma agenda
  createAgendaHTML(agenda) {
    const startDate = new Date(agenda.dataHoraInicio);
    const endDate = new Date(agenda.dataHoraFim);
    
    const day = startDate.getDate().toString().padStart(2, '0');
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(startDate).toUpperCase();
    const formattedTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

    const statusClass = agenda.status.toLowerCase();
    const statusText = this.getStatusText(agenda.status);

    const materiaisHTML = agenda.materiais ? 
      agenda.materiais.map(material => 
        `<span class="material-tag ${material.toLowerCase()}">${this.formatMaterialName(material)}</span>`
      ).join('') : '';

    return `
      <div class="agenda-item ${statusClass}">
        <div class="agenda-header">
          <div class="agenda-date">
            <div class="date-day">${day}</div>
            <div class="date-month">${month}</div>
          </div>
          <div class="agenda-info">
            <h4 class="agenda-title">${agenda.descricao}</h4>
            <p class="agenda-collector">Coletor: ${agenda.contatoResponsavel || 'Não definido'}</p>
            <p class="agenda-time">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              ${formattedTime}
            </p>
          </div>
          <span class="agenda-status ${statusClass}">${statusText}</span>
        </div>
        <div class="agenda-materials">
          ${materiaisHTML}
        </div>
      </div>
    `;
  }

  // Obter texto correspondente ao status
  getStatusText(status) {
    const statusMap = {
      'agendado': 'Agendado',
      'pendente': 'Pendente',
      'confirmado': 'Confirmado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Configurar ações para agendas
  setupAgendaActions() {
    // Listener para o botão "Ver Todas as Agendas"
    const verTodasButton = document.getElementById('ver-todas-agendas');
    if (verTodasButton) {
      verTodasButton.addEventListener('click', () => this.showAllAgendas());
    }
  }

  // Configurar event listeners
  setupEventListeners() {
    // Botão de atualizar
    const refreshButton = document.getElementById('refresh-agendas');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => this.loadData());
    }
    
    // Filtro de agendas
    const filterSelect = document.getElementById('agendas-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        const value = filterSelect.value;
        this.filterAgendas(value);
      });
    }
  }

  // Filtrar agendas por período ou status
  filterAgendas(filter) {
    let filteredAgendas = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    switch(filter) {
      case 'all':
        filteredAgendas = this.userAgendas;
        break;
      case 'hoje':
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        
        filteredAgendas = this.userAgendas.filter(agenda => {
          const dataAgenda = new Date(agenda.dataHoraInicio);
          return dataAgenda >= hoje && dataAgenda < amanha;
        });
        break;
      case 'semana':
        const fimSemana = new Date(hoje);
        fimSemana.setDate(fimSemana.getDate() + 7);
        
        filteredAgendas = this.userAgendas.filter(agenda => {
          const dataAgenda = new Date(agenda.dataHoraInicio);
          return dataAgenda >= hoje && dataAgenda < fimSemana;
        });
        break;
      case 'mes':
        const fimMes = new Date(hoje);
        fimMes.setMonth(fimMes.getMonth() + 1);
        
        filteredAgendas = this.userAgendas.filter(agenda => {
          const dataAgenda = new Date(agenda.dataHoraInicio);
          return dataAgenda >= hoje && dataAgenda < fimMes;
        });
        break;
      default:
        // Filtrar por status (agendado, confirmado, concluido)
        filteredAgendas = this.userAgendas.filter(agenda => agenda.status === filter);
    }
    
    this.renderAgendas(filteredAgendas);
  }
}

// Inicializar o gerenciador de agendas quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.agendasManager = new AgendasManager();
});
