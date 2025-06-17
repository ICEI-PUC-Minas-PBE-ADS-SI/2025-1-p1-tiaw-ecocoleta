// Agendas - EcoColeta
// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

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
      
      // Log para diagnóstico
      this.logDiagnosticInfo();
      
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
  }  // Carregar pontos de coleta do usuário
  async loadUserCollectionPoints() {
    console.log(`Buscando pontos de coleta para usuário ${this.currentUser.nome} (ID: ${this.currentUser.id}, Tipo: ${this.currentUser.tipoUsuario})`);
    
    // Verificar se o usuário é um coletor ou administrador de ponto
    if (this.currentUser.tipoUsuario === 'coletor') {
      // Se for coletor, buscar todos os pontos que têm agendas associadas a este coletor
      this.userCollectionPoints = this.pontosDeColeta.filter(ponto => {
        if (!ponto.agenda || ponto.agenda.length === 0) return false;
        
        // Verificar se existe alguma agenda com este coletor (tratando IDs como string e como number)
        const userId = this.currentUser.id;
        const userIdStr = String(userId);
        const hasAgenda = ponto.agenda.some(agenda => {
          const coletorId = agenda.coletorId;
          return coletorId === userId || coletorId === userIdStr;
        });
        
        if (hasAgenda) {
          console.log(`Ponto encontrado para coletor: ${ponto.nome} (ID: ${ponto.id})`);
        }
        
        return hasAgenda;
      });
    } else {
      // Se for administrador de ponto, filtrar pelos pontos que ele criou
      this.userCollectionPoints = this.pontosDeColeta.filter(ponto => {
        const userId = this.currentUser.id;
        const userIdStr = String(userId);
        const userEmail = this.currentUser.email;
        
        const isCreatedByUser = ponto.criadoPor === userId || 
                               String(ponto.criadoPor) === userIdStr ||
                               (ponto.email && ponto.email === userEmail);
        
        if (isCreatedByUser) {
          console.log(`Ponto encontrado para admin: ${ponto.nome} (ID: ${ponto.id}), criado por: ${ponto.criadoPor}`);
        }
        
        return isCreatedByUser;
      });
    }
    
    console.log(`Pontos de coleta do usuário: ${this.userCollectionPoints.length}`);
  }
  // Carregar todas as agendas dos pontos de coleta do usuário
  loadUserAgendas() {
    this.userAgendas = [];
    const userId = this.currentUser.id;
    const userIdStr = String(userId);
    
    console.log(`Carregando agendas para ${this.currentUser.tipoUsuario} (ID: ${userId})`);
    
    this.userCollectionPoints.forEach(ponto => {
      if (ponto.agenda && ponto.agenda.length > 0) {
        // Filtrar agendas conforme o tipo de usuário
        let agendasFiltradas = ponto.agenda;
        
        // Se for coletor, filtrar apenas as agendas designadas para ele
        if (this.currentUser.tipoUsuario === 'coletor') {
          agendasFiltradas = ponto.agenda.filter(agenda => {
            const coletorId = agenda.coletorId;
            const isForThisCollector = coletorId === userId || coletorId === userIdStr;
            
            if (isForThisCollector) {
              console.log(`Agenda encontrada para coletor: ${agenda.descricao} (ID: ${agenda.idAgenda || 'N/A'})`);
            }
            
            return isForThisCollector;
          });
          
          console.log(`Ponto ${ponto.nome}: ${agendasFiltradas.length} agendas filtradas de ${ponto.agenda.length} totais`);
        } else {
          console.log(`Ponto ${ponto.nome}: incluindo todas as ${ponto.agenda.length} agendas (usuário admin)`);
        }
        
        agendasFiltradas.forEach(agenda => {
          this.userAgendas.push({
            ...agenda,
            pontoColetaId: ponto.id,
            pontoColetaNome: ponto.nome,
            pontoColetaEndereco: ponto.endereco
          });
        });
      } else {
        console.log(`Ponto ${ponto.nome}: sem agendas disponíveis`);
      }
    });

    console.log(`Total de agendas do usuário: ${this.userAgendas.length}`);
  }
  // Função de diagnóstico para verificar o carregamento de dados
  logDiagnosticInfo() {
    console.log('=== DIAGNÓSTICO DE AGENDAMENTOS ===');
    console.log(`Usuário logado: ${this.currentUser.nome} (ID: ${this.currentUser.id})`);
    console.log(`Tipo de usuário: ${this.currentUser.tipoUsuario}`);
    console.log(`Total de pontos de coleta na base: ${this.pontosDeColeta.length}`);
    console.log(`Total de pontos filtrados para o usuário: ${this.userCollectionPoints.length}`);
    
    // Listar pontos encontrados
    if (this.userCollectionPoints.length > 0) {
      console.log('Pontos encontrados:');
      this.userCollectionPoints.forEach(ponto => {
        console.log(`- ${ponto.nome} (ID: ${ponto.id})`);
        console.log(`  Criado por: ${ponto.criadoPor}`);
        console.log(`  Endereço: ${ponto.endereco}`);
        
        // Verificar agendas
        if (ponto.agenda && ponto.agenda.length > 0) {
          console.log(`  Agendas totais neste ponto: ${ponto.agenda.length}`);
          
          // Mostrar detalhes das primeiras 3 agendas
          console.log('  Detalhes das agendas:');
          ponto.agenda.slice(0, 3).forEach((agenda, idx) => {
            console.log(`  [${idx+1}] ID: ${agenda.idAgenda || 'N/A'}`);
            console.log(`      Descrição: ${agenda.descricao}`);
            console.log(`      Status: ${agenda.status}`);
            console.log(`      Data/Hora: ${agenda.dataHoraInicio}`);
            console.log(`      Coletor ID: ${agenda.coletorId}`);
            console.log(`      Usuário Agendamento: ${agenda.idUsuarioAgendamento}`);
          });
          
          if (this.currentUser.tipoUsuario === 'coletor') {
            const agendasDoColetor = ponto.agenda.filter(agenda => agenda.coletorId === this.currentUser.id || 
                                                                   agenda.coletorId === String(this.currentUser.id));
            console.log(`  Agendas para este coletor: ${agendasDoColetor.length}`);
            console.log(`  IDs de coletores nas agendas: ${[...new Set(ponto.agenda.map(a => a.coletorId))].join(', ')}`);
            
            if (agendasDoColetor.length > 0) {
              console.log('  Exemplo de agenda para este coletor:');
              const exemplo = agendasDoColetor[0];
              console.log(`    ID: ${exemplo.idAgenda}`);
              console.log(`    Descrição: ${exemplo.descricao}`);
              console.log(`    Status: ${exemplo.status}`);
              console.log(`    Data: ${new Date(exemplo.dataHoraInicio).toLocaleString()}`);
            }
          }
        } else {
          console.log('  Sem agendas neste ponto.');
        }
      });
    }
    
    // Mostrar detalhes das agendas finais
    console.log(`Total de agendas carregadas: ${this.userAgendas.length}`);
    if (this.userAgendas.length > 0) {
      console.log('Detalhes das primeiras agendas carregadas:');
      this.userAgendas.slice(0, 3).forEach((agenda, idx) => {
        console.log(`[${idx+1}] Descrição: ${agenda.descricao}`);
        console.log(`    Ponto: ${agenda.pontoColetaNome}`);
        console.log(`    Status: ${agenda.status}`);
        console.log(`    Data: ${new Date(agenda.dataHoraInicio).toLocaleString()}`);
      });
    }
    console.log('=== FIM DO DIAGNÓSTICO ===');
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
      ).join('') : '';    // Verificar se o agendamento pode ser cancelado
    // Só permitir cancelamento para agendamentos que ainda não aconteceram e que não foram cancelados ou concluídos
    const now = new Date();
    const canCancel = (startDate > now) && 
                      (agenda.status !== 'cancelado' && agenda.status !== 'concluido');
    
    return `
      <div class="agenda-item ${statusClass}" data-agenda-id="${agenda.idAgenda}" data-ponto-id="${agenda.pontoColetaId}">
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
        ${canCancel ? 
          `<div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <button class="btn-cancelar-agendamento" data-agenda-id="${agenda.idAgenda}" data-ponto-id="${agenda.pontoColetaId}" 
            style="background-color: #f44336; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;">
              Cancelar
            </button>
          </div>` : ''
        }
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
    
    // Configurar os botões de cancelamento de agendamentos
    document.querySelectorAll('.btn-cancelar-agendamento').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const agendaId = button.dataset.agendaId;
        const pontoId = button.dataset.pontoId;
        
        if (!agendaId || !pontoId) {
          alert('Não foi possível identificar o agendamento');
          return;
        }
        
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
          try {
            await this.cancelarAgendamento(agendaId, pontoId);
          } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
            alert('Erro ao cancelar o agendamento. Tente novamente.');
          }
        }
      });
    });
  }
  
  // Método para cancelar um agendamento
  async cancelarAgendamento(agendaId, pontoId) {
    try {
      // 1. Buscar os dados atualizados do ponto de coleta
      const response = await fetch(`${API_BASE_URL}/pontosDeColeta/${pontoId}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados do ponto de coleta: ${response.status}`);
      }
      
      const pontoDeColeta = await response.json();
      
      // 2. Encontrar o agendamento específico
      if (!pontoDeColeta.agenda || !Array.isArray(pontoDeColeta.agenda)) {
        throw new Error('Dados de agendamento inválidos');
      }
      
      const agendaIndex = pontoDeColeta.agenda.findIndex(a => a.idAgenda === agendaId);
      if (agendaIndex === -1) {
        throw new Error('Agendamento não encontrado');
      }
      
      // 3. Atualizar o status do agendamento para "cancelado"
      pontoDeColeta.agenda[agendaIndex].status = 'cancelado';
      
      // 4. Salvar as alterações no servidor
      const updateResponse = await fetch(`${API_BASE_URL}/pontosDeColeta/${pontoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pontoDeColeta)
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Erro ao atualizar agendamento: ${updateResponse.status}`);
      }
      
      // 5. Mostrar mensagem de sucesso
      alert('Agendamento cancelado com sucesso');
      
      // 6. Recarregar os dados para atualizar a interface
      await this.loadData();
      
      return true;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert(`Erro ao cancelar agendamento: ${error.message}`);
      throw error;
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
    
    // Botão de diagnóstico
    const diagnosticoBtn = document.getElementById('diagnostico-btn');
    if (diagnosticoBtn) {
      diagnosticoBtn.addEventListener('click', () => {
        console.clear();
        this.logDiagnosticInfo();
        alert('Diagnóstico gerado no console. Abra as ferramentas do desenvolvedor (F12) para visualizar.');
        
        // Mostrar informações extras para depuração
        console.log('=== INFORMAÇÕES EXTRAS DE DEPURAÇÃO ===');
        console.log('Verificando possíveis problemas de tipo de dados:');
        
        if (this.currentUser.id) {
          console.log(`ID do usuário atual: ${this.currentUser.id} (Tipo: ${typeof this.currentUser.id})`);
        }
        
        // Verificar se existem problemas de correspondência de IDs
        if (this.pontosDeColeta.length > 0) {
          console.log('Exemplo de estrutura de ponto de coleta:');
          const exemploPonto = this.pontosDeColeta[0];
          console.log(`ID do ponto: ${exemploPonto.id} (Tipo: ${typeof exemploPonto.id})`);
          console.log(`criadoPor: ${exemploPonto.criadoPor} (Tipo: ${typeof exemploPonto.criadoPor})`);
          
          if (exemploPonto.agenda && exemploPonto.agenda.length > 0) {
            const exemploAgenda = exemploPonto.agenda[0];
            console.log('Exemplo de estrutura de agenda:');
            console.log(`coletorId: ${exemploAgenda.coletorId} (Tipo: ${typeof exemploAgenda.coletorId})`);
            console.log(`idUsuarioAgendamento: ${exemploAgenda.idUsuarioAgendamento} (Tipo: ${typeof exemploAgenda.idUsuarioAgendamento})`);
          }
        }
        
        // Verificar usuário armazenado no localStorage
        try {
          const rawUserData = localStorage.getItem('usuarioLogado');
          console.log('Dados brutos do localStorage (usuarioLogado):', rawUserData);
        } catch (error) {
          console.error('Erro ao acessar localStorage:', error);
        }
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
