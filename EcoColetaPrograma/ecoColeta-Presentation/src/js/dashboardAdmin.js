// Dashboard Administrativo - EcoColeta
// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Classe principal para gerenciar o dashboard
class DashboardAdmin {
  constructor() {
    this.usuarios = [];
    this.pontosDeColeta = [];
    this.donations = [];
    this.charts = {};
    this.currentUser = this.getCurrentUser();
    this.userCollectionPoints = [];
    this.userAgendas = [];
    this.currentPeriod = { days: 30 }; // Período padrão de 30 dias
    this.customDateRange = null; // Intervalo de datas personalizado
    
    this.init();  }
  
  // Obter usuário atualmente logado
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('usuarioLogado');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter usuário logado:', error);
      return null;
    }
  }  async init() {
    // Validar se usuário está logado antes de continuar
    if (!this.validateUserAuth()) {
      return;
    }

    // Sidebar é agora gerenciado automaticamente pelo sidebar.js
    await this.loadAllData();
    this.loadUserCollectionPoints();
    this.loadUserAgendas();
    this.updateDashboardStats();
    this.updateStatsWithAnimation();
    this.renderCharts();
    this.renderDynamicLists();
    this.setupEventListeners();
    this.addRealTimeIndicators();
    this.startRealTimeUpdates();
    this.setupModalManagement();
    
    // Initialize all enhanced features
    this.initializeEnhancements();
    this.monitorPerformance();
  }

  // Validar autenticação do usuário
  validateUserAuth() {
    if (!this.currentUser) {
      console.warn('Usuário não autenticado. Redirecionando para login...');
      this.showError('Acesso negado. Faça login para continuar.');
      
      // Redirecionar para página de login após um breve delay
      setTimeout(() => {
        window.location.href = 'autent.html';
      }, 2000);
      
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
        this.showError('Sessão expirada. Faça login novamente.');
        
        setTimeout(() => {
          window.location.href = 'autent.html';
        }, 2000);
        
        return false;
      }
    }

    console.log(`Dashboard carregado para usuário: ${this.currentUser.nome} (ID: ${this.currentUser.id})`);
    return true;  }

  // Carregamento de dados da API
  async loadAllData() {
    try {
      const [usuariosRes, pontosRes, donationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/usuarios`),
        fetch(`${API_BASE_URL}/pontosDeColeta`),
        fetch(`${API_BASE_URL}/donations`)
      ]);

      this.usuarios = await usuariosRes.json();
      this.pontosDeColeta = await pontosRes.json();
      this.donations = await donationsRes.json();

      console.log('Dados carregados:', {
        usuarios: this.usuarios.length,
        pontosDeColeta: this.pontosDeColeta.length,
        donations: this.donations.length
      });    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showError('Erro ao carregar dados do servidor');
    }
  }
  // Filtrar pontos de coleta do usuário logado
  loadUserCollectionPoints() {
    if (!this.currentUser) {
      console.warn('Usuário não está logado');
      this.userCollectionPoints = [];
      return;
    }

    this.userCollectionPoints = this.pontosDeColeta.filter(ponto => 
      ponto.criadoPor === this.currentUser.id
    );

    console.log(`Pontos de coleta do usuário ${this.currentUser.nome}:`, this.userCollectionPoints.length);
  }
  // Obter coletores associados aos pontos de coleta do usuário
  getUserAssociatedCollectors() {
    if (!this.currentUser) {
      return [];
    }

    const userCollectorIds = new Set();
    const userCollectors = [];
    const collectorAssociations = new Map(); // Para rastrear o tipo de associação

    // 1. Verificar coletores diretamente associados aos pontos
    this.userCollectionPoints.forEach(ponto => {
      // Coletores específicos associados
      if (ponto.coletoresAssociados && ponto.coletoresAssociados.length > 0) {
        ponto.coletoresAssociados.forEach(coletorId => {
          userCollectorIds.add(coletorId);
          if (!collectorAssociations.has(coletorId)) {
            collectorAssociations.set(coletorId, []);
          }
          collectorAssociations.get(coletorId).push(`Associado ao ${ponto.nome}`);
        });
      }

      // Coletor atribuído diretamente ao ponto
      if (ponto.coletorId) {
        userCollectorIds.add(ponto.coletorId);
        if (!collectorAssociations.has(ponto.coletorId)) {
          collectorAssociations.set(ponto.coletorId, []);
        }
        collectorAssociations.get(ponto.coletorId).push(`Atribuído ao ${ponto.nome}`);
      }

      // Verificar agendas para coletores que agendaram coletas
      if (ponto.agenda && ponto.agenda.length > 0) {
        ponto.agenda.forEach(agenda => {
          if (agenda.coletorId) {
            userCollectorIds.add(agenda.coletorId);
            if (!collectorAssociations.has(agenda.coletorId)) {
              collectorAssociations.set(agenda.coletorId, []);
            }
            collectorAssociations.get(agenda.coletorId).push(`Agendamento em ${ponto.nome}`);
          }
        });
      }
    });

    // 2. Buscar coletores por cidade/região (incluindo todos os coletores de Betim)
    const userCities = [...new Set(this.userCollectionPoints.map(p => p.cidade || 'Betim'))];
    userCities.push('Betim'); // Garantir que Betim esteja incluído
    
    this.usuarios.filter(u => u.tipoUsuario === 'coletor').forEach(coletor => {
      if (userCities.includes(coletor.cidade)) {
        userCollectorIds.add(coletor.id);
        if (!collectorAssociations.has(coletor.id)) {
          collectorAssociations.set(coletor.id, []);
        }
        collectorAssociations.get(coletor.id).push(`Atende região: ${coletor.cidade}`);
      }
    });

    // 3. Garantir que coletores específicos sejam incluídos (Samuel e Matheus)
    const priorityCollectors = [
      'samuelsilvamaciel02@gmail.com',
      'matheusaagd298765@gmail.com'
    ];
    
    this.usuarios.filter(u => u.tipoUsuario === 'coletor').forEach(coletor => {
      if (priorityCollectors.includes(coletor.email)) {
        userCollectorIds.add(coletor.id);
        if (!collectorAssociations.has(coletor.id)) {
          collectorAssociations.set(coletor.id, []);
        }
        collectorAssociations.get(coletor.id).push('Coletor ativo na região');
      }
    });

    // 4. Obter dados completos dos coletores com informações de associação
    userCollectorIds.forEach(coletorId => {
      const coletor = this.usuarios.find(u => u.id === coletorId);
      if (coletor) {
        userCollectors.push({
          ...coletor,
          associationInfo: collectorAssociations.get(coletorId) || []
        });
      }
    });

    console.log(`Coletores associados aos pontos do usuário:`, userCollectors.length);
    console.log('Coletores encontrados:', userCollectors.map(c => ({ nome: c.nome, email: c.email, associacoes: c.associationInfo })));
    return userCollectors;
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

    console.log(`Total de agendas do usuário:`, this.userAgendas.length);
  }

  // Cálculo de estatísticas
  calculateStats() {
    const totalPontosColeta = this.pontosDeColeta.length;
    const totalColetores = this.usuarios.filter(u => u.tipoUsuario === 'coletor').length;
    const totalDoadores = this.usuarios.filter(u => u.tipoUsuario === 'doador').length;
    const totalDonations = this.donations.length;
    
    // Simular coletas feitas e pendentes baseado nos pontos de coleta
    const coletasFeitas = Math.floor(totalPontosColeta * 0.7); // 70% dos pontos já foram coletados
    const coletasPendentes = totalPontosColeta - coletasFeitas;

    // Pontos ativos (com coleta domiciliar)
    const pontosAtivos = this.pontosDeColeta.filter(p => p.coletaDomiciliar).length;

    return {
      totalPontosColeta,
      totalColetores,
      totalDoadores,
      totalDonations,
      coletasFeitas,
      coletasPendentes,
      pontosAtivos
    };
  }

  // Atualização dos cards do dashboard
  updateDashboardStats() {
    const stats = this.calculateStats();
    
    // Atualizar cards principais
    this.updateCard('total-pontos', stats.totalPontosColeta);
    this.updateCard('total-coletores', stats.totalColetores);
    this.updateCard('coletas-feitas', stats.coletasFeitas);
    this.updateCard('coletas-pendentes', stats.coletasPendentes);

    // Atualizar cards de materiais (baseado nos materiais aceitos pelos pontos)
    this.updateMaterialCards();
  }

  updateCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  updateMaterialCards() {
    const materialCount = {};
    
    // Contar materiais aceitos pelos pontos de coleta
    this.pontosDeColeta.forEach(ponto => {
      if (ponto.materiaisAceitos) {
        ponto.materiaisAceitos.forEach(material => {
          materialCount[material] = (materialCount[material] || 0) + 1;
        });
      }
    });

    // Mapear materiais para os cards
    const materialMapping = {
      'plastico': 'plastico-count',
      'papel': 'papel-count', 
      'vidro': 'vidro-count',
      'metal': 'metal-count',
      'eletronicos': 'eletronicos-count'
    };

    Object.entries(materialMapping).forEach(([material, elementId]) => {
      this.updateCard(elementId, materialCount[material] || 0);
    });
  }
  // Geração de dados para gráficos baseado nos pontos do usuário
  generateChartData() {
    // Dados mensais baseados nos pontos de coleta do usuário
    const monthlyData = this.generateUserMonthlyData();
    
    // Dados de performance por tipo de material dos pontos do usuário
    const performanceData = this.generateUserPerformanceData();
    
    // Dados de coletas por região dos pontos do usuário
    const regionData = this.generateUserRegionData();

    return { monthlyData, performanceData, regionData };
  }
  // Geração de dados para gráficos baseado nos pontos do usuário
  generateChartData() {
    // Dados mensais baseados nos pontos de coleta do usuário
    const monthlyData = this.generateUserMonthlyData();
    
    // Dados de performance por tipo de material dos pontos do usuário
    const performanceData = this.generateUserPerformanceData();
    
    // Dados de coletas por região dos pontos do usuário
    const regionData = this.generateUserRegionData();

    return { monthlyData, performanceData, regionData };
  }

  generateUserMonthlyData() {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const baseValue = this.userCollectionPoints.length * 4; // 4 coletas por ponto em média
    
    if (baseValue === 0) {
      return months.map(month => ({ name: month, value: 0 }));
    }
    
    return months.map((month, index) => {
      // Simular crescimento ao longo dos meses
      const growthFactor = 1 + (index * 0.1);
      const randomVariation = (Math.random() - 0.5) * 0.3;
      const value = Math.floor(baseValue * growthFactor * (1 + randomVariation));
      
      return {
        name: month,
        value: Math.max(value, 0)
      };
    });
  }

  generateUserPerformanceData() {
    // Agrupar por tipos de materiais aceitos nos pontos do usuário
    const materialsCount = {};
    const materialLabels = {
      'plastico': 'Plástico',
      'papel': 'Papel', 
      'vidro': 'Vidro',
      'metal': 'Metal',
      'eletronicos': 'Eletrônicos',
      'organico': 'Orgânico',
      'oleo': 'Óleo'
    };
    
    this.userCollectionPoints.forEach(ponto => {
      if (ponto.materiaisAceitos && ponto.materiaisAceitos.length > 0) {
        ponto.materiaisAceitos.forEach(material => {
          materialsCount[material] = (materialsCount[material] || 0) + 1;
        });
      }
    });

    if (Object.keys(materialsCount).length === 0) {
      return [{ name: 'Sem dados', value: 1, color: '#E5E7EB' }];
    }

    const colors = ['#10B981', '#3B82F6', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    let colorIndex = 0;

    return Object.entries(materialsCount).map(([material, count]) => ({
      name: materialLabels[material] || material,
      value: count * 15, // Multiplicar para simular volume de coletas
      color: colors[colorIndex++ % colors.length]
    }));
  }

  generateUserRegionData() {
    // Agrupar pontos por cidade/região
    const regionCount = {};
    
    this.userCollectionPoints.forEach(ponto => {
      const cidade = ponto.cidade || 'Não informado';
      regionCount[cidade] = (regionCount[cidade] || 0) + 1;
    });    return Object.entries(regionCount).map(([cidade, count]) => ({
      name: cidade,
      value: count,
      coletas: count * 12 // Simular coletas por região
    }));
  }

  // Renderização dos gráficos
  renderCharts() {
    const { monthlyData, performanceData, regionData } = this.generateChartData();
    
    this.renderMonthlyChart(monthlyData);
    this.renderPerformanceChart(performanceData);
    this.renderRegionChart(regionData);
  }

  // Renderização das listas dinâmicas
  renderDynamicLists() {
    this.renderPontosAtivosList();
    this.renderColetoresList();
    this.renderColetoresPerformance();
  }

  renderPontosAtivosList() {
    const container = document.getElementById('pontos-ativos-list');
    if (!container) return;

    // Filtrar pontos ativos (com coleta domiciliar)
    const pontosAtivos = this.pontosDeColeta.filter(ponto => ponto.coletaDomiciliar);
    
    if (pontosAtivos.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum ponto ativo encontrado</div>';
      return;
    }

    const listHTML = pontosAtivos.slice(0, 5).map(ponto => `
      <div class="point-item">
        <div class="point-info">
          <div class="point-header">
            <span class="point-name">${ponto.nome}</span>
            <span class="point-status active">Ativo</span>
          </div>
          <div class="point-details">
            <span class="point-address">${ponto.endereco}</span>
            <span class="point-materials">${ponto.materiaisAceitos ? ponto.materiaisAceitos.join(', ') : 'N/A'}</span>
          </div>
        </div>
        <div class="point-actions">
          <button class="btn-small">Ver Detalhes</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = listHTML;
  }  renderColetoresList() {
    const container = document.getElementById('coletores-list');
    if (!container) return;

    // Obter coletores associados aos pontos de coleta do usuário logado
    const coletoresAssociados = this.getUserAssociatedCollectors();
    
    if (coletoresAssociados.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>Nenhum coletor encontrado</h3>
          <p>Ainda não há coletores disponíveis para seus pontos de coleta.</p>
        </div>
      `;
      return;
    }

    const listHTML = coletoresAssociados.map(coletor => {
      // Calcular estatísticas baseadas nos pontos do usuário
      const coletasRealizadas = this.calculateCollectorStats(coletor);
      const statusAtivo = this.isCollectorActive(coletor);
      const ultimaColeta = this.getLastCollectionDate(coletor);
      
      // Determinar se é um coletor prioritário
      const isPriority = ['samuelsilvamaciel02@gmail.com', 'matheusaagd298765@gmail.com'].includes(coletor.email);
      
      return `
        <div class="collector-item ${isPriority ? 'priority-collector' : ''}">
          <div class="collector-avatar">
            <img src="${coletor.imagem || 'https://placehold.co/50'}" alt="${coletor.nome}">
            <div class="status-indicator ${statusAtivo ? 'active' : 'inactive'}"></div>
            ${isPriority ? '<div class="priority-badge">⭐</div>' : ''}
          </div>
          <div class="collector-info">
            <div class="collector-header">
              <span class="collector-name">${coletor.nome}${isPriority ? ' (Coletor Verificado)' : ''}</span>
              <span class="collector-status ${statusAtivo ? 'active' : 'inactive'}">
                ${statusAtivo ? '✅ Ativo' : '⏸️ Inativo'}
              </span>
            </div>
            <div class="collector-details">
              <div class="detail-item">
                <span class="label">📧 Email:</span>
                <span class="value">${coletor.email}</span>
              </div>
              <div class="detail-item">
                <span class="label">📱 Telefone:</span>
                <span class="value">${coletor.telefone || 'Não informado'}</span>
              </div>
              <div class="detail-item">
                <span class="label">♻️ Coletas:</span>
                <span class="value">${coletasRealizadas} realizadas</span>
              </div>
              <div class="detail-item">
                <span class="label">📅 Última coleta:</span>
                <span class="value">${ultimaColeta}</span>
              </div>
              ${coletor.areaAtuacao ? `
                <div class="detail-item">
                  <span class="label">📍 Área de Atuação:</span>
                  <span class="value">${coletor.areaAtuacao}</span>
                </div>
              ` : ''}
              ${coletor.horarioColeta ? `
                <div class="detail-item">
                  <span class="label">🕒 Horário:</span>
                  <span class="value">${coletor.horarioColeta}</span>
                </div>
              ` : ''}
              ${coletor.materiaisColeta ? `
                <div class="detail-item">
                  <span class="label">🏷️ Materiais:</span>
                  <span class="value">${coletor.materiaisColeta.join(', ')}</span>
                </div>
              ` : ''}
              ${coletor.associationInfo && coletor.associationInfo.length > 0 ? `
                <div class="detail-item">
                  <span class="label">🔗 Associação:</span>
                  <span class="value">${coletor.associationInfo.join(', ')}</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="collector-actions">
            <button class="btn-small btn-primary" onclick="window.open('tel:${coletor.telefone}')">
              📞 Ligar
            </button>
            <button class="btn-small btn-secondary" onclick="window.open('mailto:${coletor.email}')">
              ✉️ Email
            </button>
            <button class="btn-small btn-info" onclick="window.dashboardAdmin.viewCollectorDetails(${coletor.id})">
              👁️ Detalhes
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = listHTML;
  }

  // Calcular estatísticas do coletor baseado nos pontos do usuário
  calculateCollectorStats(coletor) {
    // Simular coletas baseado nos pontos de coleta do usuário
    const pontosAssociados = this.userCollectionPoints.filter(ponto => {
      return ponto.cidade === coletor.cidade || 
             (ponto.coletoresAssociados && ponto.coletoresAssociados.includes(coletor.id));
    });
    
    // Base de coletas: 5-15 por ponto de coleta
    return pontosAssociados.length * (Math.floor(Math.random() * 10) + 5);
  }

  // Verificar se o coletor está ativo
  isCollectorActive(coletor) {
    // Simular status baseado na última atividade
    return Math.random() > 0.2; // 80% chance de estar ativo
  }
  // Obter data da última coleta
  getLastCollectionDate(coletor) {
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - daysAgo);
    
    if (daysAgo <= 7) {
      return `${daysAgo} dia${daysAgo > 1 ? 's' : ''} atrás`;
    } else {
      return lastDate.toLocaleDateString('pt-BR');
    }
  }

  // Visualizar detalhes completos do coletor
  viewCollectorDetails(coletorId) {
    const coletor = this.usuarios.find(u => u.id === coletorId);
    if (!coletor) {
      console.error('Coletor não encontrado');
      return;
    }

    // Calcular estatísticas detalhadas
    const stats = this.calculateDetailedCollectorStats(coletor);
    const pontosAssociados = this.getCollectorAssociatedPoints(coletor);
    const agendasRecentes = this.getCollectorRecentAgendas(coletor);
    
    // Determinar se é um coletor prioritário
    const isPriority = ['samuelsilvamaciel02@gmail.com', 'matheusaagd298765@gmail.com'].includes(coletor.email);
    
    const modalHTML = `
      <div id="collector-details-modal" class="modal" style="display: block;">
        <div class="modal-content" style="max-width: 800px;">
          <div class="modal-header">
            <h2>
              ${coletor.nome}
              ${isPriority ? '<span class="priority-badge">⭐ Verificado</span>' : ''}
            </h2>
            <button class="modal-close" onclick="document.getElementById('collector-details-modal').remove()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="collector-details-grid">
              <!-- Informações Básicas -->
              <div class="details-section">
                <h3>📋 Informações Básicas</h3>
                <div class="detail-item">
                  <span class="label">Nome:</span>
                  <span class="value">${coletor.nome}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Email:</span>
                  <span class="value">${coletor.email}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Telefone:</span>
                  <span class="value">${coletor.telefone || 'Não informado'}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Cidade:</span>
                  <span class="value">${coletor.cidade || 'Não informado'}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Data de Cadastro:</span>
                  <span class="value">${new Date(coletor.dataRegistro || Date.now()).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Status:</span>
                  <span class="value status-badge ${this.isCollectorActive(coletor) ? 'active' : 'inactive'}">
                    ${this.isCollectorActive(coletor) ? '✅ Ativo' : '⏸️ Inativo'}
                  </span>
                </div>
              </div>

              <!-- Estatísticas de Performance -->
              <div class="details-section">
                <h3>📊 Estatísticas</h3>
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-number">${stats.totalColetas}</div>
                    <div class="stat-label">Coletas Realizadas</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">${pontosAssociados.length}</div>
                    <div class="stat-label">Pontos Associados</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">${agendasRecentes.length}</div>
                    <div class="stat-label">Agendas Ativas</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">${stats.eficiencia}%</div>
                    <div class="stat-label">Eficiência</div>
                  </div>
                </div>
              </div>

              <!-- Pontos de Coleta Associados -->
              <div class="details-section">
                <h3>📍 Pontos de Coleta Associados</h3>
                ${pontosAssociados.length > 0 ? `
                  <div class="points-list">
                    ${pontosAssociados.map(ponto => `
                      <div class="point-item">
                        <div class="point-name">${ponto.nome}</div>
                        <div class="point-address">${ponto.endereco}</div>
                        <div class="point-materials">
                          ${ponto.materiaisAceitos ? ponto.materiaisAceitos.map(material => 
                            `<span class="material-tag">${material}</span>`
                          ).join('') : ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : '<p>Nenhum ponto de coleta associado.</p>'}
              </div>

              <!-- Agendas Recentes -->
              <div class="details-section">
                <h3>📅 Atividades Recentes</h3>
                ${agendasRecentes.length > 0 ? `
                  <div class="agendas-list">
                    ${agendasRecentes.map(agenda => `
                      <div class="agenda-item">
                        <div class="agenda-date">
                          ${new Date(agenda.dataHoraInicio).toLocaleDateString('pt-BR')}
                        </div>
                        <div class="agenda-details">
                          <div class="agenda-title">${agenda.titulo || 'Coleta agendada'}</div>
                          <div class="agenda-point">${agenda.pontoNome || 'Ponto não identificado'}</div>
                          <span class="agenda-status status-${agenda.status}">
                            ${this.getStatusLabel(agenda.status)}
                          </span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : '<p>Nenhuma atividade recente encontrada.</p>'}
              </div>

              <!-- Informações de Contato e Ações -->
              <div class="details-section">
                <h3>🔗 Ações</h3>
                <div class="action-buttons">
                  <button class="btn-primary" onclick="window.open('tel:${coletor.telefone}')">
                    📞 Ligar
                  </button>
                  <button class="btn-secondary" onclick="window.open('mailto:${coletor.email}')">
                    ✉️ Enviar Email
                  </button>
                  <button class="btn-info" onclick="window.dashboardAdmin.viewCollectorHistory(${coletorId})">
                    📈 Ver Histórico
                  </button>
                  <button class="btn-success" onclick="window.dashboardAdmin.scheduleCollectionWithCollector(${coletorId})">
                    📅 Agendar Coleta
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" onclick="document.getElementById('collector-details-modal').remove()">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    // Remove modal existente se houver
    const existingModal = document.getElementById('collector-details-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Adicionar modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Calcular estatísticas detalhadas do coletor
  calculateDetailedCollectorStats(coletor) {
    const pontosAssociados = this.getCollectorAssociatedPoints(coletor);
    const totalColetas = pontosAssociados.length * (Math.floor(Math.random() * 15) + 5);
    const eficiencia = Math.min(95, 60 + (pontosAssociados.length * 5) + Math.floor(Math.random() * 20));
    
    return {
      totalColetas,
      eficiencia,
      pontosAtivos: pontosAssociados.length,
      ultimaAtividade: this.getLastCollectionDate(coletor)
    };
  }

  // Obter pontos de coleta associados ao coletor
  getCollectorAssociatedPoints(coletor) {
    return this.userCollectionPoints.filter(ponto => {
      return ponto.cidade === coletor.cidade || 
             (ponto.coletoresAssociados && ponto.coletoresAssociados.includes(coletor.id)) ||
             ponto.coletorId === coletor.id;
    });
  }

  // Obter agendas recentes do coletor
  getCollectorRecentAgendas(coletor) {
    const agendas = [];
    this.userCollectionPoints.forEach(ponto => {
      if (ponto.agenda && ponto.agenda.length > 0) {
        ponto.agenda.forEach(agenda => {
          if (agenda.coletorId === coletor.id) {
            agendas.push({
              ...agenda,
              pontoNome: ponto.nome
            });
          }
        });
      }
    });
    
    // Ordenar por data mais recente
    return agendas.sort((a, b) => new Date(b.dataHoraInicio) - new Date(a.dataHoraInicio)).slice(0, 5);
  }

  // Obter label do status
  getStatusLabel(status) {
    const statusLabels = {
      'agendado': 'Agendado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado',
      'pendente': 'Pendente'
    };
    return statusLabels[status] || status;
  }

  renderMonthlyChart(data) {
    const ctx = document.getElementById("monthly-chart");
    if (!ctx) return;

    const chartCtx = ctx.getContext("2d");
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

    this.charts.monthly = new Chart(chartCtx, {
      type: "line",
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          label: "Coletas",
          data: data.map(item => item.value),
          fill: true,
          backgroundColor: gradient,
          borderColor: "#10B981",
          tension: 0.4,
          pointBackgroundColor: "#10B981",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { 
            enabled: true,
            callbacks: {
              label: function(context) {
                return `Coletas: ${context.parsed.y}`;
              }
            }
          },
        },
        scales: {
          x: { display: false },
          y: { display: false },
        },
        elements: {
          line: { borderWidth: 2 },
        },
        onHover: (event, activeElements) => {
          event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
        },
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const clickedIndex = activeElements[0].index;
            const clickedMonth = data[clickedIndex];
            this.showMonthDetails(clickedMonth);
          }
        }
      },
    });
  }

  // Renderizar gráfico de região com interatividade
  renderRegionChart(data) {
    const ctx = document.getElementById("region-chart");
    if (!ctx) {
      console.warn('Elemento region-chart não encontrado');
      return;
    }

    this.charts.region = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          label: "Coletas por Região",
          data: data.map(item => item.coletas),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(59, 130, 246, 1)', 
            'rgba(99, 102, 241, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 1,
          borderRadius: 4
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { 
            enabled: true,
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} coletas realizadas`;
              }
            }
          },
        },
        scales: {
          x: { 
            display: true,
            grid: { display: false }
          },
          y: { 
            display: true,
            beginAtZero: true,
            grid: { display: true, color: 'rgba(0,0,0,0.1)' }
          },
        },
        onHover: (event, activeElements) => {
          event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
        },
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const clickedIndex = activeElements[0].index;
            const clickedRegion = data[clickedIndex];
            this.showRegionDetails(clickedRegion);
          }
        }
      },
    });
  }

  // Renderizar gráfico com interatividade aprimorada
  renderPerformanceChart(data) {
    const ctx = document.getElementById("performance-chart");
    if (!ctx) return;

    this.charts.performance = new Chart(ctx.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: data.map(item => item.color),
          borderWidth: 0,
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: { display: false },
          tooltip: { 
            enabled: true,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          },
        },
        onHover: (event, activeElements) => {
          event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
        },
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const clickedIndex = activeElements[0].index;
            const clickedMaterial = data[clickedIndex];
            this.showMaterialDetails(clickedMaterial);
          }
        }
      },
    });

    // Renderizar legenda personalizada
    this.renderPerformanceLegend(data);
  }

  // Mostrar detalhes do material clicado
  showMaterialDetails(material) {
    const pointsWithMaterial = this.userCollectionPoints.filter(ponto => 
      ponto.materiaisAceitos && ponto.materiaisAceitos.includes(material.name.toLowerCase())
    );

    const modal = document.createElement('div');
    modal.className = 'material-details-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detalhes: ${material.name}</h3>
          <button class="modal-close" onclick="this.closest('.material-details-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="material-stats">
            <div class="stat-item">
              <span class="stat-label">Pontos que aceitam:</span>
              <span class="stat-value">${pointsWithMaterial.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total de coletas:</span>
              <span class="stat-value">${material.value}</span>
            </div>
          </div>
          
          <h4>Pontos de Coleta:</h4>
          <div class="points-list">
            ${pointsWithMaterial.map(ponto => `
              <div class="point-item-detail">
                <div class="point-name">${ponto.nome}</div>
                <div class="point-address">${ponto.endereco}</div>
                <div class="point-status ${ponto.coletaDomiciliar ? 'active' : 'inactive'}">
                  ${ponto.coletaDomiciliar ? 'Coleta Domiciliar' : 'Ponto Fixo'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Mostrar detalhes da região clicada
  showRegionDetails(region) {
    const pointsInRegion = this.userCollectionPoints.filter(ponto => 
      ponto.cidade === region.name
    );

    const modal = document.createElement('div');
    modal.className = 'region-details-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Região: ${region.name}</h3>
          <button class="modal-close" onclick="this.closest('.region-details-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="region-overview">
            <div class="overview-stats">
              <div class="overview-item">
                <span class="overview-label">Pontos na região:</span>
                <span class="overview-value">${pointsInRegion.length}</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Coletas estimadas:</span>
                <span class="overview-value">${region.coletas}</span>
              </div>
            </div>
          </div>

          <h4>Pontos de Coleta na Região:</h4>
          <div class="region-points-list">
            ${pointsInRegion.map(ponto => `
              <div class="region-point-item">
                <div class="point-header">
                  <span class="point-name">${ponto.nome}</span>
                  <span class="point-type ${ponto.coletaDomiciliar ? 'domiciliar' : 'fixo'}">
                    ${ponto.coletaDomiciliar ? 'Domiciliar' : 'Fixo'}
                  </span>
                </div>
                <div class="point-details">
                  <div class="point-address">${ponto.endereco}</div>
                  <div class="point-materials">
                    Materiais: ${ponto.materiaisAceitos ? ponto.materiaisAceitos.join(', ') : 'N/A'}
                  </div>
                </div>
                <div class="point-actions">
                  <button class="btn-small btn-secondary" onclick="window.dashboardAdmin.showAgendasForCollectionPoint('${ponto.id}')">
                    Ver Agendas
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Mostrar detalhes do mês clicado
  showMonthDetails(month) {
    // Filtrar agendas do mês específico
    const monthAgendas = this.userAgendas.filter(agenda => {
      const agendaDate = new Date(agenda.dataHoraInicio);
      const monthName = agendaDate.toLocaleString('pt-BR', { month: 'long' });
      return monthName.toLowerCase().includes(month.name.toLowerCase());
    });

    const modal = document.createElement('div');
    modal.className = 'month-details-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detalhes: ${month.name}</h3>
          <button class="modal-close" onclick="this.closest('.month-details-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="month-stats">
            <div class="stat-group">
              <div class="stat-item">
                <span class="stat-label">Coletas realizadas:</span>
                <span class="stat-value">${month.value}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Agendamentos:</span>
                <span class="stat-value">${monthAgendas.length}</span>
              </div>
            </div>
          </div>

          ${monthAgendas.length > 0 ? `
            <h4>Agendamentos do período:</h4>
            <div class="month-agendas-list">
              ${monthAgendas.slice(0, 5).map(agenda => `
                <div class="agenda-item-small">
                  <div class="agenda-date">
                    ${new Date(agenda.dataHoraInicio).toLocaleDateString('pt-BR')}
                  </div>
                  <div class="agenda-point">${agenda.pontoColetaNome || 'N/A'}</div>
                  <div class="agenda-status ${agenda.status}">${this.getStatusText(agenda.status)}</div>
                </div>
              `).join('')}
              ${monthAgendas.length > 5 ? `<div class="agenda-more">+${monthAgendas.length - 5} mais...</div>` : ''}
            </div>
          ` : '<p class="no-data">Nenhum agendamento neste período.</p>'}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // ===== NAVIGATION METHODS =====
  
  setupNavigation() {
    // Handle navigation between sections
    const navLinks = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.main-content');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const id = link.getAttribute('id');
          // Handle specific navigation items
        if (id === 'minhas-agendas-link') {
          e.preventDefault();
          this.showSection('minhas-agendas-section');
        }
        // You can add more navigation handlers here for other sections
      });
    });
  }
  showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.main-content');
    sections.forEach(section => {
      section.style.display = 'none';
    });

    // Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }

    // Update active navigation item
    const navLinks = document.querySelectorAll('.sidebar a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`#${sectionId.replace('-section', '-link')}`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Load section-specific data
    if (sectionId === 'minhas-agendas-section') {
      this.renderUserCollectionPoints();
      this.loadAgendas();
    }
  }

  // ===== AGENDAS METHODS =====

  setupAgendasEventListeners() {
    // Refresh agendas button
    const refreshAgendasBtn = document.getElementById('refresh-agendas');
    if (refreshAgendasBtn) {
      refreshAgendasBtn.addEventListener('click', () => this.loadAgendas());
    }

    // Filter agendas
    const agendasFilter = document.getElementById('agendas-filter');
    if (agendasFilter) {
      agendasFilter.addEventListener('change', (e) => this.filterAgendas(e.target.value));
    }
  }
  async loadAgendas(filteredByPoint = null) {
    const container = document.getElementById('agendas-list');
    const loadingElement = document.querySelector('.agendas-loading');
    const emptyElement = document.querySelector('.agendas-empty');

    if (!container) return;

    // Show loading state
    container.innerHTML = '';
    if (loadingElement) loadingElement.style.display = 'flex';
    if (emptyElement) emptyElement.style.display = 'none';

    try {
      let agendasToShow = [];

      if (filteredByPoint) {
        // Show agendas only for a specific collection point
        const ponto = this.userCollectionPoints.find(p => p.id === filteredByPoint);
        if (ponto && ponto.agenda && ponto.agenda.length > 0) {
          agendasToShow = ponto.agenda.map(agenda => ({
            ...agenda,
            pontoColetaId: ponto.id,
            pontoColetaNome: ponto.nome,
            pontoColetaEndereco: ponto.endereco
          }));
        }
      } else {
        // Show all user agendas
        agendasToShow = [...this.userAgendas];
      }

      // Sort agendas by date (newest first)
      agendasToShow.sort((a, b) => new Date(b.dataHoraInicio) - new Date(a.dataHoraInicio));

      // Update statistics
      this.updateAgendasStats(agendasToShow);

      // Render agendas
      this.renderAgendas(agendasToShow, filteredByPoint);

    } catch (error) {
      console.error('Erro ao carregar agendas:', error);
      this.showError('Erro ao carregar agendas');
    } finally {
      if (loadingElement) loadingElement.style.display = 'none';
    }
  }
  updateAgendasStats(agendas) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalAgendas = agendas.length;
    const agendasHoje = agendas.filter(agenda => {
      const agendaDate = new Date(agenda.dataHoraInicio);
      agendaDate.setHours(0, 0, 0, 0);
      return agendaDate.getTime() === today.getTime();
    }).length;

    const agendasPendentes = agendas.filter(agenda => 
      agenda.status === 'agendado' || agenda.status === 'confirmado'
    ).length;

    const agendasConcluidas = agendas.filter(agenda => 
      agenda.status === 'concluido'
    ).length;

    // Update DOM elements
    const totalElement = document.getElementById('total-agendas');
    const hojeElement = document.getElementById('agendas-hoje');
    const pendentesElement = document.getElementById('agendas-pendentes');
    const concluidasElement = document.getElementById('agendas-concluidas');

    if (totalElement) totalElement.textContent = totalAgendas;
    if (hojeElement) hojeElement.textContent = agendasHoje;
    if (pendentesElement) pendentesElement.textContent = agendasPendentes;
    if (concluidasElement) concluidasElement.textContent = agendasConcluidas;
  }
  renderAgendas(agendas, filteredByPoint = null) {
    const container = document.getElementById('agendas-list');
    const emptyElement = document.querySelector('.agendas-empty');

    if (!container) return;

    if (agendas.length === 0) {
      container.innerHTML = '';
      if (emptyElement) {
        const emptyText = filteredByPoint 
          ? 'Nenhum agendamento encontrado para este ecoponto'
          : 'Nenhuma agenda encontrada';
        emptyElement.querySelector('.agendas-empty-text').textContent = emptyText;
        emptyElement.style.display = 'flex';
      }
      return;
    }

    if (emptyElement) emptyElement.style.display = 'none';

    let headerHTML = '';
    if (filteredByPoint) {
      const ponto = this.userCollectionPoints.find(p => p.id === filteredByPoint);
      headerHTML = `
        <div class="agendas-filter-header">
          <div class="filter-info">
            <h3>Agendas para: ${ponto.nome}</h3>
            <p>${ponto.endereco}</p>
          </div>
          <button class="btn-secondary" onclick="window.dashboardAdmin.showAllAgendas()">
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

  createAgendaHTML(agenda) {
    const startDate = new Date(agenda.dataHoraInicio);
    const endDate = new Date(agenda.dataHoraFim);
    
    const formattedDate = startDate.toLocaleDateString('pt-BR');
    const formattedTime = `${startDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - ${endDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;

    const statusClass = agenda.status.toLowerCase();
    const statusText = this.getStatusText(agenda.status);

    const materiaisText = agenda.materiais.join(', ');

    return `
      <div class="agenda-item" data-agenda-id="${agenda.idAgenda}">
        <div class="agenda-main-info">
          <div class="agenda-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
            </svg>
          </div>          <div class="agenda-details">
            <h3 class="agenda-title">${agenda.descricao}</h3>
            <p class="agenda-subtitle">${agenda.pontoColetaNome}</p>
            <div class="agenda-meta">
              <span class="agenda-time">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                ${formattedDate} • ${formattedTime}
              </span>
              <span class="agenda-location">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                ${materiaisText}
              </span>
            </div>
          </div>
        </div>
        <div class="agenda-status">
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="agenda-actions">
          <button class="agenda-action-btn" data-action="view" title="Ver detalhes">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          ${agenda.status === 'agendado' ? `
            <button class="agenda-action-btn primary" data-action="confirm" title="Confirmar agenda">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </button>
          ` : ''}
          <button class="agenda-action-btn" data-action="edit" title="Editar agenda">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  getStatusText(status) {
    const statusMap = {
      'agendado': 'Agendado',
      'confirmado': 'Confirmado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado',
      'em-andamento': 'Em Andamento'
    };
    return statusMap[status] || status;
  }

  setupAgendaActions() {
    const actionButtons = document.querySelectorAll('.agenda-action-btn');
    
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = button.getAttribute('data-action');
        const agendaItem = button.closest('.agenda-item');
        const agendaId = agendaItem.getAttribute('data-agenda-id');
        
        this.handleAgendaAction(action, agendaId);
      });
    });
  }

  handleAgendaAction(action, agendaId) {
    switch (action) {
      case 'view':
        this.viewAgendaDetails(agendaId);
        break;
      case 'confirm':
        this.confirmAgenda(agendaId);
        break;
      case 'edit':
        this.editAgenda(agendaId);
        break;
      default:
        console.log('Ação não implementada:', action);
    }
  }

  viewAgendaDetails(agendaId) {
    // Find the agenda
    let foundAgenda = null;
    let foundPonto = null;
    
    for (const ponto of this.pontosDeColeta) {
      if (ponto.agenda) {
        const agenda = ponto.agenda.find(a => a.idAgenda === agendaId);
        if (agenda) {
          foundAgenda = agenda;
          foundPonto = ponto;
          break;
        }
      }
    }

    if (foundAgenda && foundPonto) {
      // Create and show details modal
      this.showAgendaDetailsModal(foundAgenda, foundPonto);
    }
  }

  showAgendaDetailsModal(agenda, ponto) {
    const startDate = new Date(agenda.dataHoraInicio);
    const endDate = new Date(agenda.dataHoraFim);
    
    const modalHTML = `
      <div id="agenda-details-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Detalhes da Agenda</h2>
            <button id="close-agenda-modal" class="close-modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="agenda-detail-item">
              <strong>Descrição:</strong> ${agenda.descricao}
            </div>
            <div class="agenda-detail-item">
              <strong>Ponto de Coleta:</strong> ${ponto.nome}
            </div>
            <div class="agenda-detail-item">
              <strong>Data:</strong> ${startDate.toLocaleDateString('pt-BR')}
            </div>
            <div class="agenda-detail-item">
              <strong>Horário:</strong> ${startDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - ${endDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
            </div>
            <div class="agenda-detail-item">
              <strong>Status:</strong> <span class="status-badge ${agenda.status}">${this.getStatusText(agenda.status)}</span>
            </div>
            <div class="agenda-detail-item">
              <strong>Materiais:</strong> ${agenda.materiais.join(', ')}
            </div>
            <div class="agenda-detail-item">
              <strong>Contato Responsável:</strong> ${agenda.contatoResponsavel}
            </div>
            ${agenda.observacoes ? `
              <div class="agenda-detail-item">
                <strong>Observações:</strong> ${agenda.observacoes}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('agenda-details-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup close event
    const closeButton = document.getElementById('close-agenda-modal');
    const modal = document.getElementById('agenda-details-modal');
    
    closeButton.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  async confirmAgenda(agendaId) {
    try {
      // Find the ponto that contains this agenda
      let targetPonto = null;
      let targetAgendaIndex = -1;

      for (const ponto of this.pontosDeColeta) {
        if (ponto.agenda) {
          const agendaIndex = ponto.agenda.findIndex(a => a.idAgenda === agendaId);
          if (agendaIndex !== -1) {
            targetPonto = ponto;
            targetAgendaIndex = agendaIndex;
            break;
          }
        }
      }

      if (targetPonto && targetAgendaIndex !== -1) {
        // Update status to confirmed
        targetPonto.agenda[targetAgendaIndex].status = 'confirmado';

        // Update in the database
        const response = await fetch(`${API_BASE_URL}/pontosDeColeta/${targetPonto.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(targetPonto)
        });

        if (response.ok) {
          this.showSuccess('Agenda confirmada com sucesso!');
          this.loadAgendas(); // Reload agendas
        } else {
          throw new Error('Erro ao confirmar agenda');
        }
      }
    } catch (error) {
      console.error('Erro ao confirmar agenda:', error);
      this.showError('Erro ao confirmar agenda');
    }
  }

  editAgenda(agendaId) {
    // For now, just show a message that editing is not implemented
    this.showNotification('Funcionalidade de edição será implementada em breve', 'info');
  }
  filterAgendas(filterValue) {
    // This would be implemented to filter the displayed agendas
    // For now, we'll just reload all agendas
    this.loadAgendas();
  }

  // Show agendas for a specific collection point
  showAgendasForCollectionPoint(pontoId) {
    this.loadAgendas(pontoId);
  }

  // Show all agendas
  showAllAgendas() {
    this.loadAgendas();
  }

  // Render collection points with "Ver Agenda" buttons
  renderUserCollectionPoints() {
    const container = document.getElementById('user-collection-points');
    if (!container) return;

    if (this.userCollectionPoints.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Você ainda não criou nenhum ecoponto.</p>
        </div>
      `;
      return;
    }

    const pointsHTML = this.userCollectionPoints.map(ponto => {
      const agendasCount = ponto.agenda ? ponto.agenda.length : 0;
      return `
        <div class="collection-point-item">
          <div class="point-info">
            <h4>${ponto.nome}</h4>
            <p>${ponto.endereco}</p>
            <span class="agendas-count">${agendasCount} agendamento(s)</span>
          </div>
          <button class="btn-primary" onclick="window.dashboardAdmin.showAgendasForCollectionPoint(${ponto.id})">
            Ver Agendas
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = pointsHTML;
  }

  // Renderizar performance dos coletores
  renderColetoresPerformance() {
    const container = document.getElementById('coletores-performance-list');
    if (!container) return;

    const coletoresAssociados = this.getUserAssociatedCollectors();
    
    if (coletoresAssociados.length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <p>Nenhum coletor associado encontrado</p>
        </div>
      `;
      return;
    }

    // Ordenar coletores por performance (coletas realizadas)
    const coletoresComStats = coletoresAssociados.map(coletor => ({
      ...coletor,
      coletas: this.calculateCollectorStats(coletor),
      status: this.isCollectorActive(coletor)
    })).sort((a, b) => b.coletas - a.coletas);

    const performanceHTML = coletoresComStats.slice(0, 5).map((coletor, index) => {
      const rank = index + 1;
      const percentage = Math.round((coletor.coletas / coletoresComStats[0].coletas) * 100);
      
      return `
        <div class="performance-item">
          <div class="performance-rank">#${rank}</div>
          <div class="performance-info">
            <div class="performance-header">
              <span class="performance-name">${coletor.nome}</span>
              <span class="performance-value">${coletor.coletas} coletas</span>
            </div>
            <div class="performance-bar">
              <div class="performance-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="performance-details">
              <span class="performance-status ${coletor.status ? 'active' : 'inactive'}">
                ${coletor.status ? '🟢 Ativo' : '🔴 Inativo'}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = performanceHTML;
  }

  // Renderizar legenda dinâmica do gráfico de performance
  renderPerformanceLegend(data) {
    const container = document.getElementById('performance-legend');
    if (!container || !data) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    const legendHTML = data.map(item => {
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
      
      return `
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${item.color};"></div>
          <span class="legend-label">${item.name}</span>
          <span class="legend-value">${percentage}%</span>
        </div>
      `;
    }).join('');

    container.innerHTML = legendHTML;
  }

  // Exportar para Excel (implementação básica usando CSV formatado)
  exportToExcel(data) {
    // Para uma implementação completa, seria necessário usar uma biblioteca como SheetJS
    // Por enquanto, vamos usar uma versão formatada em CSV que pode ser aberta no Excel
    
    let excelContent = '';
    
    // Cabeçalho do relatório
    excelContent += `Relatório EcoColeta\n`;
    excelContent += `Usuário:,${data.user.nome}\n`;
    excelContent += `Email:,${data.user.email}\n`;
    excelContent += `Data:,${new Date().toLocaleDateString('pt-BR')}\n\n`;

    if (data.collectors) {
      excelContent += `COLETORES ASSOCIADOS\n`;
      excelContent += `Nome,Email,Telefone,Coletas Realizadas,Status,Última Coleta\n`;
      data.collectors.forEach(collector => {
        const stats = this.calculateCollectorStats(collector);
        const lastCollection = this.getLastCollectionDate(collector);
        const status = this.isCollectorActive(collector) ? 'Ativo' : 'Inativo';
        excelContent += `"${collector.nome}","${collector.email}","${collector.telefone || 'N/A'}",${stats},${status},"${lastCollection}"\n`;
      });
      excelContent += '\n';
    }

    if (data.collections) {
      excelContent += `PONTOS DE COLETA\n`;
      excelContent += `Nome,Endereço,Cidade,Estado,Materiais Aceitos,Coleta Domiciliar,Horário,Contato\n`;
      data.collections.forEach(ponto => {
        const materiais = ponto.materiaisAceitos ? ponto.materiaisAceitos.join('; ') : 'N/A';
        const domiciliar = ponto.coletaDomiciliar ? 'Sim' : 'Não';
        excelContent += `"${ponto.nome}","${ponto.endereco}","${ponto.cidade || 'N/A'}","${ponto.estado || 'N/A'}","${materiais}",${domiciliar},"${ponto.horario || 'N/A'}","${ponto.contato || 'N/A'}"\n`;
      });
      excelContent += '\n';
    }

    if (data.agendas) {
      excelContent += `AGENDAMENTOS\n`;
      excelContent += `Data,Horário,Ponto de Coleta,Status,Materiais,Contato Responsável,Observações\n`;
      data.agendas.forEach(agenda => {
        const dataInicio = new Date(agenda.dataHoraInicio);
        const dataFormatada = dataInicio.toLocaleDateString('pt-BR');
        const horarioFormatado = dataInicio.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        const materiais = agenda.materiais ? agenda.materiais.join('; ') : 'N/A';
        const status = this.getStatusText(agenda.status);
        excelContent += `"${dataFormatada}","${horarioFormatado}","${agenda.pontoColetaNome || 'N/A'}","${status}","${materiais}","${agenda.contatoResponsavel || 'N/A'}","${agenda.observacoes || 'N/A'}"\n`;
      });
      excelContent += '\n';
    }

    if (data.performance) {
      excelContent += `RELATÓRIO DE PERFORMANCE\n`;
      excelContent += `Nome,Email,Telefone,Coletas Realizadas,Última Coleta,Status,Materiais Coletados\n`;
      data.performance.forEach(perf => {
        const materiaisColetados = perf.materiaisColetados ? perf.materiaisColetados.join('; ') : 'N/A';
        const status = perf.statusAtivo ? 'Ativo' : 'Inativo';
        excelContent += `"${perf.nome}","${perf.email}","${perf.telefone || 'N/A'}",${perf.coletasRealizadas},"${perf.ultimaColeta}",${status},"${materiaisColetados}"\n`;
      });
    }

    // Criar e baixar arquivo
    const blob = new Blob(['\ufeff' + excelContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_ecocoleta_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Função auxiliar para calcular performance avançada dos coletores
  calculateAdvancedCollectorStats(collector) {
    // Simular dados de performance mais detalhados
    const baseStats = this.calculateCollectorStats(collector);
    
    return {
      coletasRealizadas: baseStats,
      coletasEsteMes: Math.floor(baseStats * 0.3),
      mediaColetasPorDia: (baseStats / 30).toFixed(1),
      eficiencia: Math.min(100, (baseStats * 5)).toFixed(1), // Simular % de eficiência
      pontuacao: baseStats * 10, // Sistema de pontos
      ranking: this.getCollectorRanking(collector),
      tendencia: this.getCollectorTrend(collector)
    };
  }

  // Obter ranking do coletor
  getCollectorRanking(collector) {
    const collectors = this.getUserAssociatedCollectors();
    const collectorStats = collectors.map(c => ({
      id: c.id,
      stats: this.calculateCollectorStats(c)
    }));
    
    collectorStats.sort((a, b) => b.stats - a.stats);
    const position = collectorStats.findIndex(c => c.id === collector.id) + 1;
    
    return `${position}º de ${collectors.length}`;
  }

  // Obter tendência do coletor (simulada)
  getCollectorTrend(collector) {
    const trends = ['📈 Crescendo', '📊 Estável', '📉 Declinando'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  // Adicionar métricas de sustentabilidade
  calculateSustainabilityMetrics() {
    const totalCollectionPoints = this.userCollectionPoints.length;
    const totalMaterials = new Set();
    
    this.userCollectionPoints.forEach(ponto => {
      if (ponto.materiaisAceitos) {
        ponto.materiaisAceitos.forEach(material => totalMaterials.add(material));
      }
    });

    // Estimativas de impacto ambiental (simuladas)
    const estimatedCollections = totalCollectionPoints * 12; // 12 coletas por ponto por mês
    const co2Saved = estimatedCollections * 2.5; // kg de CO2 economizado
    const treesEquivalent = Math.floor(co2Saved / 22); // Árvores equivalentes
    const wasteRecycled = estimatedCollections * 15; // kg de resíduos reciclados

    return {
      totalMaterialTypes: totalMaterials.size,
      estimatedCollections,
      co2Saved: co2Saved.toFixed(1),
      treesEquivalent,
      wasteRecycled: wasteRecycled.toFixed(1),
      recyclabilityScore: Math.min(100, (totalMaterials.size * 14.3)).toFixed(1)
    };
  }

  // Mostrar métricas de sustentabilidade
  showSustainabilityMetrics() {
    const metrics = this.calculateSustainabilityMetrics();
    
    const modal = document.createElement('div');
    modal.className = 'sustainability-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>🌱 Métricas de Sustentabilidade</h3>
          <button class="modal-close" onclick="this.closest('.sustainability-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="sustainability-grid">
            <div class="metric-card co2">
              <div class="metric-icon">🌍</div>
              <div class="metric-value">${metrics.co2Saved} kg</div>
              <div class="metric-label">CO² Economizado</div>
            </div>
            
            <div class="metric-card trees">
              <div class="metric-icon">🌳</div>
              <div class="metric-value">${metrics.treesEquivalent}</div>
              <div class="metric-label">Árvores Equivalentes</div>
            </div>
            
            <div class="metric-card waste">
              <div class="metric-icon">♻️</div>
              <div class="metric-value">${metrics.wasteRecycled} kg</div>
              <div class="metric-label">Resíduos Reciclados</div>
            </div>
            
            <div class="metric-card score">
              <div class="metric-icon">📊</div>
              <div class="metric-value">${metrics.recyclabilityScore}%</div>
              <div class="metric-label">Score de Reciclabilidade</div>
            </div>
          </div>
          
          <div class="impact-details">
            <h4>Detalhes do Impacto:</h4>
            <ul>
              <li><strong>${metrics.totalMaterialTypes}</strong> tipos diferentes de materiais aceitos</li>
              <li><strong>${metrics.estimatedCollections}</strong> coletas estimadas por mês</li>
              <li>Contribuição para <strong>redução de emissões</strong> de gases do efeito estufa</li>
              <li>Apoio ao <strong>desenvolvimento sustentável</strong> da comunidade</li>
            </ul>
          </div>
          
          <div class="sustainability-actions">
            <button class="btn-primary" onclick="window.dashboardAdmin.shareImpact(${JSON.stringify(metrics).replace(/"/g, '&quot;')})">
              📤 Compartilhar Impacto
            </button>
            <button class="btn-secondary" onclick="window.dashboardAdmin.downloadImpactReport(${JSON.stringify(metrics).replace(/"/g, '&quot;')})">
              📄 Baixar Relatório
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Compartilhar impacto nas redes sociais
  shareImpact(metrics) {
    const message = `🌱 Meu impacto sustentável com a EcoColeta:\n\n🌍 ${metrics.co2Saved} kg de CO² economizado\n🌳 ${metrics.treesEquivalent} árvores equivalentes\n♻️ ${metrics.wasteRecycled} kg de resíduos reciclados\n\n#EcoColeta #Sustentabilidade #MeioAmbiente`;
    
    // Opções de compartilhamento
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Compartilhar Impacto</h3>
          <button class="modal-close" onclick="this.closest('.share-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="share-options">
            <button class="share-btn whatsapp" onclick="window.open('https://wa.me/?text=${encodeURIComponent(message)}', '_blank')">
              📱 WhatsApp
            </button>
            <button class="share-btn facebook" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}', '_blank')">
              📘 Facebook
            </button>
            <button class="share-btn twitter" onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}', '_blank')">
              🐦 Twitter
            </button>
            <button class="share-btn copy" onclick="navigator.clipboard.writeText('${message.replace(/'/g, "\\'")}').then(() => alert('Texto copiado!'))">
              📋 Copiar Texto
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(shareModal);
    
    // Fechar modal anterior
    document.querySelector('.sustainability-modal')?.remove();
  }

  // Baixar relatório de impacto
  downloadImpactReport(metrics) {
    const reportContent = `
RELATÓRIO DE IMPACTO AMBIENTAL - ECOCOLETA
==========================================

Usuário: ${this.currentUser.nome}
Email: ${this.currentUser.email}
Data: ${new Date().toLocaleDateString('pt-BR')}

MÉTRICAS DE SUSTENTABILIDADE:
-----------------------------
🌍 CO² Economizado: ${metrics.co2Saved} kg
🌳 Árvores Equivalentes: ${metrics.treesEquivalent}
♻️ Resíduos Reciclados: ${metrics.wasteRecycled} kg
📊 Score de Reciclabilidade: ${metrics.recyclabilityScore}%

DETALHOS:
---------
• Tipos de materiais aceitos: ${metrics.totalMaterialTypes}
• Coletas estimadas/mês: ${metrics.estimatedCollections}
• Pontos de coleta ativos: ${this.userCollectionPoints.length}

CONTRIBUIÇÕES:
--------------
✓ Redução de emissões de gases do efeito estufa
✓ Promoção da economia circular
✓ Desenvolvimento sustentável da comunidade
✓ Educação ambiental e conscientização

--
Relatório gerado automaticamente pela plataforma EcoColeta
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `impacto_ambiental_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Fechar modal
    document.querySelector('.sustainability-modal')?.remove();
  }

  // Função para atualizar contadores dinamicamente com animação
  updateStatsWithAnimation() {
    const stats = this.calculateStats();
    
    // Stats do dashboard principal
    this.animateCounter('total-pontos', stats.totalPontosColeta);
    this.animateCounter('total-coletores', stats.totalColetores);
    this.animateCounter('coletas-feitas', stats.coletasFeitas);
    this.animateCounter('coletas-pendentes', stats.coletasPendentes);

    // Stats das agendas se estiver na seção de agendas
    if (document.getElementById('total-agendas')) {
      this.animateCounter('total-agendas', this.userAgendas.length);
      this.animateCounter('agendas-hoje', this.userAgendas.filter(a => this.isToday(a.dataColeta)).length);
      this.animateCounter('agendas-pendentes', this.userAgendas.filter(a => a.status === 'agendado').length);
      this.animateCounter('agendas-concluidas', this.userAgendas.filter(a => a.status === 'concluido').length);
    }
  }

  // Animação suave para contadores
  animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000; // 1 segundo
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function para animação suave
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
      
      element.textContent = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Função para verificar se uma data é hoje
  isToday(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  }

  // Função para atualizar o status dos pontos em tempo real
  updatePointsStatus() {
    const pointsList = document.getElementById('pontos-ativos-list');
    if (!pointsList) return;

    // Simular atualizações de status dos pontos
    const points = pointsList.querySelectorAll('.point-item');
    points.forEach((point, index) => {
      const statusElement = point.querySelector('.point-status');
      if (statusElement && Math.random() > 0.9) { // 10% chance de mudança
        // Simular mudança de status
        const isActive = statusElement.classList.contains('status-active');
        if (isActive && Math.random() > 0.8) {
          statusElement.classList.remove('status-active');
          statusElement.classList.add('status-maintenance');
          statusElement.textContent = 'Manutenção';
        }
      }
    });
  }

  // Função para atualizar status dos coletores
  updateCollectorsStatus() {
    const collectorsList = document.getElementById('coletores-list');
    if (!collectorsList) return;

    const collectors = collectorsList.querySelectorAll('.collector-item');
    collectors.forEach(collector => {
      const statusElement = collector.querySelector('.collector-status');
      if (statusElement && Math.random() > 0.95) { // 5% chance de mudança
        const isOnline = statusElement.classList.contains('online');
        if (isOnline) {
          statusElement.classList.remove('online');
          statusElement.classList.add('offline');
          statusElement.textContent = 'Offline';
        } else {
          statusElement.classList.remove('offline');
          statusElement.classList.add('online');
          statusElement.textContent = 'Online';
        }
      }
    });
  }

  // Função para atualizar dados em tempo real
  startRealTimeUpdates() {
    // Atualizar a cada 30 segundos
    setInterval(() => {
      this.updatePointsStatus();
      this.updateCollectorsStatus();
      
      // Atualizar timestamp na interface
      const lastUpdate = document.querySelector('.last-update');
      if (lastUpdate) {
        lastUpdate.textContent = `Última atualização: ${new Date().toLocaleTimeString()}`;
      }
    }, 30000);

    // Atualizar contadores a cada 5 minutos
    setInterval(() => {
      this.updateStatsWithAnimation();
    }, 300000);
  }

  // Função para adicionar indicadores de tempo real
  addRealTimeIndicators() {
    // Adicionar indicador de última atualização
    const header = document.querySelector('.dashboard-header');
    if (header && !header.querySelector('.last-update')) {
      const lastUpdateElement = document.createElement('div');
      lastUpdateElement.className = 'last-update';
      lastUpdateElement.style.cssText = 'font-size: 0.875rem; color: var(--color-gray-500); margin-top: 0.5rem;';
      lastUpdateElement.textContent = `Última atualização: ${new Date().toLocaleTimeString()}`;
      header.appendChild(lastUpdateElement);
    }

    // Adicionar indicadores de status em tempo real
    const statusElements = document.querySelectorAll('.collector-status.online');
    statusElements.forEach(element => {
      if (!element.querySelector('.pulse-indicator')) {
        const pulseIndicator = document.createElement('span');
        pulseIndicator.className = 'pulse-indicator';
        pulseIndicator.style.cssText = `
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          margin-left: 4px;
          animation: pulse 2s infinite;
        `;
        element.appendChild(pulseIndicator);
      }
    });
  }

  // Enhanced interactive features for final polish
  
  // Add smooth scrolling to navigation
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Add keyboard navigation
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // ESC key to close modals
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal[style*="block"]');
        if (activeModal) {
          activeModal.style.display = 'none';
        }
      }
      
      // Tab navigation improvements
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
    });
  }

  // Add loading states for dynamic content
  showLoadingState(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <span style="margin-left: 1rem;">Carregando...</span>
      </div>
    `;
  }

  // Add success/error notifications
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">
          ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
        </span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add styles for notifications
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Add real-time data simulation
  simulateRealTimeUpdates() {
    setInterval(() => {
      // Update online status indicators
      const onlineIndicators = document.querySelectorAll('.status-indicator.online');
      onlineIndicators.forEach(indicator => {
        // Simulate occasional status changes
        if (Math.random() < 0.05) { // 5% chance every interval
          indicator.classList.toggle('online');
          indicator.classList.toggle('offline');
        }
      });

      // Update timestamps
      const timeElements = document.querySelectorAll('.time-ago');
      timeElements.forEach(element => {
        const currentTime = element.textContent;
        if (currentTime.includes('min atrás')) {
          const minutes = parseInt(currentTime);
          element.textContent = `${minutes + 1} min atrás`;
        }
      });

      // Simulate new activities
      if (Math.random() < 0.1) { // 10% chance
        this.addNewActivity();
      }
    }, 30000); // Every 30 seconds
  }

  // Add new activity simulation
  addNewActivity() {
    const activities = [
      'Nova coleta realizada',
      'Coletor chegou ao ponto',
      'Material processado',
      'Rota otimizada',
      'Agendamento confirmado'
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    this.showNotification(activity, 'info');
  }

  // Enhanced chart tooltips
  setupEnhancedTooltips() {
    // Add custom tooltips for charts
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
    Chart.defaults.plugins.tooltip.titleColor = '#F8FAFC';
    Chart.defaults.plugins.tooltip.bodyColor = '#CBD5E1';
    Chart.defaults.plugins.tooltip.borderColor = '#334155';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = false;
  }

  // Add data export functionality
  exportData(data, filename, format = 'json') {
    let content, mimeType;
    
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
    } else if (format === 'csv') {
      content = this.convertToCSV(data);
      mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Convert data to CSV format
  convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  // Add performance monitoring
  monitorPerformance() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
      
      if (loadTime > 3000) { // If load time > 3 seconds
        console.warn('Page load time is high:', loadTime + 'ms');
      }
    });
  }
  // Universal Modal Management
  setupModalManagement() {
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
    });

    // Close modal with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
          this.closeModal(openModal);
        }
      }
    });

    // Use a delayed setup to ensure all page elements are loaded
    setTimeout(() => {
      this.setupModalButtons();
    }, 100);
  }

  // Setup modal buttons - called after a delay to ensure all page elements exist
  setupModalButtons() {
    // Setup close buttons
    document.querySelectorAll('.modal-close').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = e.target.closest('.modal');
        if (modal) {
          this.closeModal(modal);
        }
      });
    });

    // Setup cancel buttons
    document.querySelectorAll('[id*="cancel"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = e.target.closest('.modal');
        if (modal) {
          this.closeModal(modal);
        }
      });
    });
  }
  // Open modal with animation
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      console.log(`Opening modal: ${modalId}`);
      modal.style.display = 'flex';
      // Force reflow
      modal.offsetHeight;
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      // Focus on first input
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    } else {
      console.error(`Modal not found: ${modalId}`);
    }
  }

  // Close modal with animation
  closeModal(modal) {
    if (modal) {
      console.log(`Closing modal: ${modal.id}`);
      modal.classList.remove('show');
      document.body.style.overflow = '';
      
      setTimeout(() => {
        modal.style.display = 'none';
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
          form.reset();
        }
      }, 300);
    }
  }

  // Close modal by ID
  closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    this.closeModal(modal);
  }
  // Adicionar indicadores visuais de carregamento
  addLoadingStates() {
    const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
    
    sidebarLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        // Adicionar estado de carregamento apenas se estiver navegando para outra página
        if (link.href && !link.href.includes("#") && link.href !== window.location.href) {
          link.classList.add("loading");
          
          // Remover estado de loading após um timeout (caso a navegação não ocorra)
          setTimeout(() => {
            link.classList.remove("loading");
          }, 3000);
        }
      });
    });
  }

  // Public method to reinitialize modal management for dynamically loaded content
  reinitializeModals() {
    this.setupModalButtons();
  }
}

// Inicializar dashboard quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.dashboardAdmin = new DashboardAdmin();
});
