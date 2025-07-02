// Agendas - EcoColeta
// Configuração da API
const API_BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://two025-1-p1-tiaw-ecocoleta.onrender.com';


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
    console.log('Inicializando AgendasManager...');
    
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
    
    console.log('Usuário autenticado:', this.currentUser);
    return true;
  }

  async loadData() {
    try {
      console.log('Carregando dados...');
      
      // Mostrar estado de carregamento
      const loadingElement = document.querySelector('.agendas-loading');
      const listElement = document.querySelector('#agendas-list');
      const emptyElement = document.querySelector('.agendas-empty');
      
      if (loadingElement) loadingElement.style.display = 'flex';
      if (listElement) listElement.style.display = 'none';
      if (emptyElement) emptyElement.style.display = 'none';
      
      // Buscar pontos de coleta
      const pontosResponse = await fetch(`${API_BASE_URL}/pontosDeColeta`);
      this.pontosDeColeta = await pontosResponse.json();
      console.log('Pontos de coleta carregados:', this.pontosDeColeta.length);
      
      // Filtrar apenas os pontos do usuário logado
      await this.loadUserCollectionPoints();
      
      // Carregar agendas dos pontos do usuário (agora via API)
      await this.loadUserAgendas();
      
      // Log para diagnóstico
      this.logDiagnosticInfo();
      
      // Atualizar estatísticas
      this.updateAgendaStats();
      
      // Renderizar pontos e agendas
      this.renderUserCollectionPoints();
      this.renderAgendas(this.userAgendas);
      
      // Esconder estado de carregamento
      if (loadingElement) loadingElement.style.display = 'none';
      if (listElement) listElement.style.display = 'flex';
      
      if (this.userAgendas.length === 0) {
        if (emptyElement) emptyElement.style.display = 'flex';
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      const loadingElement = document.querySelector('.agendas-loading');
      const emptyElement = document.querySelector('.agendas-empty');
      const emptyText = document.querySelector('.agendas-empty-text');
      
      if (loadingElement) loadingElement.style.display = 'none';
      if (emptyElement) emptyElement.style.display = 'flex';
      if (emptyText) emptyText.textContent = 'Erro ao carregar as agendas. Tente novamente.';
    }
  }

  async loadUserCollectionPoints() {
    console.log(`Buscando pontos de coleta para usuário ${this.currentUser.nome} (ID: ${this.currentUser.id}, Tipo: ${this.currentUser.tipoUsuario})`);
    
    if (this.currentUser.tipoUsuario === 'coletor') {
      // Se for coletor, buscar pontos onde ele é responsável
      this.userCollectionPoints = this.pontosDeColeta.filter(ponto => 
        ponto.coletorId === this.currentUser.id || ponto.criadoPor === this.currentUser.id
      );
    } else {
      // Para outros tipos de usuário, filtrar por pontos criados por ele
      this.userCollectionPoints = this.pontosDeColeta.filter(ponto => 
        ponto.criadoPor === this.currentUser.id
      );
    }

    console.log(`Pontos de coleta do usuário: ${this.userCollectionPoints.length}`);
    console.log('Pontos encontrados:', this.userCollectionPoints.map(p => ({ id: p.id, nome: p.nome })));
  }

  async loadUserAgendas() {
    this.userAgendas = [];
    
    try {
      console.log(`Carregando agendas via API para ${this.currentUser.tipoUsuario} (ID: ${this.currentUser.id})`);
      console.log('Usuário atual:', this.currentUser);
      
      // Buscar todos os agendamentos via API
      const response = await fetch(`${API_BASE_URL}/agendamentos`);
      if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos');
      }
      
      const todosAgendamentos = await response.json();
      console.log('Todos os agendamentos encontrados:', todosAgendamentos);
      
      // Se for coletor, filtrar agendamentos dos pontos onde ele é responsável
      // OU agendamentos onde ele é o doador
      if (this.currentUser.tipoUsuario === 'coletor') {
        // Buscar IDs dos pontos onde este coletor é responsável
        const pontosDoColetorIds = this.pontosDeColeta
          .filter(ponto => ponto.coletorId === this.currentUser.id)
          .map(p => p.id);
        
        console.log('IDs dos pontos onde o coletor é responsável:', pontosDoColetorIds);
        
        this.userAgendas = todosAgendamentos.filter(agendamento => {
          const isPontoDoColetorResponsavel = pontosDoColetorIds.includes(parseInt(agendamento.pontoColetaId));
          const isAgendamentoDoUsuario = agendamento.doadorEmail === this.currentUser.email;
          
          console.log(`Agendamento ${agendamento.id} (Ponto ${agendamento.pontoColetaId}):`, {
            pontoColetaId: agendamento.pontoColetaId,
            doadorEmail: agendamento.doadorEmail,
            isPontoDoColetorResponsavel,
            isAgendamentoDoUsuario,
            shouldInclude: isPontoDoColetorResponsavel || isAgendamentoDoUsuario
          });
          
          return isPontoDoColetorResponsavel || isAgendamentoDoUsuario;
        });
        
        console.log('Agendamentos filtrados para coletor:', this.userAgendas);
      } else {
        // Se for doador, filtrar por email
        // Se for admin, pode ver agendamentos dos pontos que criou
        const pontosUsuarioIds = this.userCollectionPoints.map(p => p.id);
        console.log('Pontos do usuário:', pontosUsuarioIds);
        console.log('Email do usuário:', this.currentUser.email);
        
        this.userAgendas = todosAgendamentos.filter(agendamento => {
          const isUserAgenda = agendamento.doadorEmail === this.currentUser.email;
          const isPontoDoUsuario = pontosUsuarioIds.includes(parseInt(agendamento.pontoColetaId));
          
          console.log(`Agendamento ${agendamento.id}:`, {
            doadorEmail: agendamento.doadorEmail,
            pontoColetaId: agendamento.pontoColetaId,
            isUserAgenda,
            isPontoDoUsuario,
            shouldInclude: isUserAgenda || isPontoDoUsuario
          });
          
          return isUserAgenda || isPontoDoUsuario;
        });
        
        console.log('Agendamentos filtrados para doador/admin:', this.userAgendas);
      }
      
      // Enriquecer com dados do ponto de coleta
      this.userAgendas = this.userAgendas.map(agenda => {
        const ponto = this.pontosDeColeta.find(p => p.id === parseInt(agenda.pontoColetaId));
        console.log(`Procurando ponto ID ${agenda.pontoColetaId}:`, ponto);
        return {
          ...agenda,
          pontoColetaNome: ponto?.nome || agenda.pontoColetaNome || 'Ponto não encontrado',
          pontoColetaEndereco: ponto?.endereco || 'Endereço não disponível'
        };
      });

      console.log(`Total de agendas do usuário: ${this.userAgendas.length}`);
      console.log('Agendas finais do usuário:', this.userAgendas);
      
    } catch (error) {
      console.error('Erro ao carregar agendas via API:', error);
      this.userAgendas = [];
    }
  }

  logDiagnosticInfo() {
    console.log('=== DIAGNÓSTICO DE AGENDAMENTOS ===');
    console.log(`Usuário logado: ${this.currentUser.nome} (ID: ${this.currentUser.id})`);
    console.log(`Tipo de usuário: ${this.currentUser.tipoUsuario}`);
    console.log(`Email do usuário: ${this.currentUser.email}`);
    console.log(`Total de pontos de coleta na base: ${this.pontosDeColeta.length}`);
    console.log(`Total de pontos filtrados para o usuário: ${this.userCollectionPoints.length}`);
    console.log(`Total de agendas encontradas: ${this.userAgendas.length}`);
  }

  updateAgendaStats() {
    const total = this.userAgendas.length;
    const hoje = new Date().toISOString().split('T')[0];
    const agendaHoje = this.userAgendas.filter(a => a.dataAgendamento === hoje).length;
    const pendentes = this.userAgendas.filter(a => a.status === 'pendente').length;
    const concluidas = this.userAgendas.filter(a => a.status === 'concluido').length;

    const totalElement = document.getElementById('total-agendas');
    const hojeElement = document.getElementById('agendas-hoje');
    const pendentesElement = document.getElementById('agendas-pendentes');
    const concluidasElement = document.getElementById('agendas-concluidas');

    if (totalElement) totalElement.textContent = total;
    if (hojeElement) hojeElement.textContent = agendaHoje;
    if (pendentesElement) pendentesElement.textContent = pendentes;
    if (concluidasElement) concluidasElement.textContent = concluidas;
  }

  renderUserCollectionPoints() {
    const container = document.getElementById('user-collection-points');
    if (!container) return;
    
    if (this.userCollectionPoints.length === 0) {
      container.innerHTML = '<p class="empty-message">Nenhum ponto de coleta encontrado.</p>';
      return;
    }

    container.innerHTML = this.userCollectionPoints.map(ponto => `
      <div class="collection-point-item">
        <div class="point-info">
          <h4>${ponto.nome}</h4>
          <p>${ponto.endereco}</p>
          <div class="point-status">
            <span class="status-badge active">ATIVO</span>
          </div>
        </div>
        <div class="point-stats">
          <div class="stat-item">
            <span class="stat-label">Coletas ativas</span>
            <span class="stat-value">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Agendas pendentes</span>
            <span class="stat-value">${this.userAgendas.filter(a => a.pontoColetaId == ponto.id && a.status === 'pendente').length}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderAgendas(agendas) {
    const container = document.getElementById('agendas-list');
    const emptyElement = document.querySelector('.agendas-empty');
    
    if (!container) return;
    
    if (agendas.length === 0) {
      container.innerHTML = '';
      if (emptyElement) emptyElement.style.display = 'flex';
      return;
    }

    if (emptyElement) emptyElement.style.display = 'none';
    
    container.innerHTML = agendas.map(agenda => this.createAgendaHTML(agenda)).join('');
  }

  createAgendaHTML(agenda) {
    const statusClass = agenda.status === 'pendente' ? 'pending' : 
                       agenda.status === 'confirmado' ? 'confirmed' : 
                       agenda.status === 'concluido' ? 'completed' : 'cancelled';

    return `
      <div class="agenda-item" data-agenda-id="${agenda.id}">
        <div class="agenda-header">
          <div class="agenda-info">
            <h4>${agenda.pontoColetaNome}</h4>
            <p class="agenda-address">${agenda.pontoColetaEndereco}</p>
          </div>
          <div class="agenda-status">
            <span class="status-badge ${statusClass}">${this.getStatusText(agenda.status)}</span>
          </div>
        </div>
        
        <div class="agenda-details">
          <div class="detail-item">
            <span class="label">Data:</span>
            <span class="value">${new Date(agenda.dataAgendamento).toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="detail-item">
            <span class="label">Horário:</span>
            <span class="value">${agenda.horarioAgendamento}</span>
          </div>
          <div class="detail-item">
            <span class="label">Material:</span>
            <span class="value">${agenda.tipoMaterial}</span>
          </div>
          <div class="detail-item">
            <span class="label">Doador:</span>
            <span class="value">${agenda.doadorEmail}</span>
          </div>
          ${agenda.observacoes ? `
          <div class="detail-item">
            <span class="label">Observações:</span>
            <span class="value">${agenda.observacoes}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="agenda-actions">
          <button class="btn-small btn-primary" onclick="window.agendas.verDetalhes('${agenda.id}')">
            Ver Detalhes
          </button>
          ${agenda.status === 'pendente' ? `
          <button class="btn-small btn-success" onclick="window.agendas.confirmarAgendamento('${agenda.id}')">
            Confirmar
          </button>
          <button class="btn-small btn-danger" onclick="window.agendas.cancelarAgendamento('${agenda.id}')">
            Cancelar
          </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  getStatusText(status) {
    const statusMap = {
      'pendente': 'Pendente',
      'confirmado': 'Confirmado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  verDetalhes(agendaId) {
    console.log('Ver detalhes do agendamento:', agendaId);
    // Implementar modal ou redirecionamento para detalhes
  }

  async confirmarAgendamento(agendaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/${agendaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'confirmado' })
      });

      if (response.ok) {
        console.log('Agendamento confirmado com sucesso');
        await this.loadData(); // Recarregar dados
      } else {
        console.error('Erro ao confirmar agendamento');
      }
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
    }
  }

  async cancelarAgendamento(agendaId) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/agendamentos/${agendaId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelado' })
        });

        if (response.ok) {
          console.log('Agendamento cancelado com sucesso');
          await this.loadData(); // Recarregar dados
        } else {
          console.error('Erro ao cancelar agendamento');
        }
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
      }
    }
  }

  setupEventListeners() {
    // Botão de atualizar
    const refreshButton = document.getElementById('refresh-agendas');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => this.loadData());
    }

    // Filtro de agendas
    const filterSelect = document.getElementById('agendas-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.filterAgendas(e.target.value);
      });
    }

    // Botão de diagnóstico
    const diagnosticoBtn = document.getElementById('diagnostico-btn');
    if (diagnosticoBtn) {
      diagnosticoBtn.addEventListener('click', () => {
        this.logDiagnosticInfo();
        alert('Diagnóstico executado! Verifique o console para detalhes.');
      });
    }
  }

  filterAgendas(filterValue) {
    let agendasFiltradas = [...this.userAgendas];

    switch (filterValue) {
      case 'hoje':
        const hoje = new Date().toISOString().split('T')[0];
        agendasFiltradas = agendasFiltradas.filter(a => a.dataAgendamento === hoje);
        break;
      case 'semana':
        const agora = new Date();
        const inicioSemana = new Date(agora.setDate(agora.getDate() - agora.getDay()));
        const fimSemana = new Date(agora.setDate(agora.getDate() - agora.getDay() + 6));
        agendasFiltradas = agendasFiltradas.filter(a => {
          const dataAgenda = new Date(a.dataAgendamento);
          return dataAgenda >= inicioSemana && dataAgenda <= fimSemana;
        });
        break;
      case 'mes':
        const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const fimMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        agendasFiltradas = agendasFiltradas.filter(a => {
          const dataAgenda = new Date(a.dataAgendamento);
          return dataAgenda >= inicioMes && dataAgenda <= fimMes;
        });
        break;
      case 'agendado':
      case 'confirmado':
      case 'concluido':
        agendasFiltradas = agendasFiltradas.filter(a => a.status === filterValue);
        break;
      default:
        // 'all' - não filtrar
        break;
    }

    this.renderAgendas(agendasFiltradas);
  }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  window.agendas = new AgendasManager();
});
