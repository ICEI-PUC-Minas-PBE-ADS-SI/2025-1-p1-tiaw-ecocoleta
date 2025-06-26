// Relatórios - PDF Generation and Management
class RelatoriosManager {
  constructor() {
    this.currentReportData = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Generate report button
    const generateReportBtn = document.getElementById('generate-report');
    if (generateReportBtn) {
      generateReportBtn.addEventListener('click', () => {
        this.generateReport();
      });
    }

    // Date range filter change handler
    const dateRangeSelect = document.getElementById('date-range');
    const customDateRange = document.getElementById('custom-date-range');
    
    if (dateRangeSelect && customDateRange) {
      dateRangeSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
          customDateRange.style.display = 'block';
        } else {
          customDateRange.style.display = 'none';
        }
      });
    }

    // Template buttons
    const templateBtns = document.querySelectorAll('.template-btn');
    templateBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.applyTemplate(e);
      });
    });

    // Refresh reports
    const refreshBtn = document.getElementById('refresh-reports');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshReports();
      });
    }

    // Schedule report button
    const scheduleBtn = document.getElementById('schedule-report');
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', () => {
        this.showNotification('Funcionalidade de agendamento em desenvolvimento', 'info');
      });
    }
  }

  async generateReport() {
    const reportType = document.getElementById('report-type').value;
    const dateRange = document.getElementById('date-range').value;
    const region = document.getElementById('region-filter').value;
    const format = document.getElementById('format').value;
    
    const generateBtn = document.getElementById('generate-report');
    
    // Show loading state
    generateBtn.innerHTML = '<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> Gerando...';
    generateBtn.disabled = true;
    
    try {
      // Collect report data
      const reportData = await this.collectReportData(reportType, dateRange, region);
      this.currentReportData = reportData;
      
      // Generate based on format
      if (format === 'pdf') {
        await this.generatePDF(reportData);
      } else if (format === 'excel') {
        this.generateExcel(reportData);
      } else if (format === 'csv') {
        this.generateCSV(reportData);
      }
      
      this.showNotification('Relatório gerado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      this.showNotification('Erro ao gerar relatório. Tente novamente.', 'error');
    } finally {
      // Reset button
      generateBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Gerar Relatório';
      generateBtn.disabled = false;
    }
  }
  async collectReportData(reportType, dateRange, region) {
    // Wait for dashboard data to be available
    await this.ensureDashboardData();
    
    const baseData = {
      reportType,
      dateRange,
      region,
      generatedAt: new Date().toLocaleString('pt-BR'),
      user: window.dashboardAdmin?.currentUser || { nome: 'Usuário Admin', email: 'admin@ecocoleta.com' }
    };

    switch (reportType) {
      case 'geral':
        return {
          ...baseData,
          title: 'Relatório Geral do Sistema',
          stats: this.getRealGeneralStats(),
          charts: await this.getRealChartData(),
          summary: this.getSystemSummary()
        };
      
      case 'coletas':
        return {
          ...baseData,
          title: 'Relatório de Coletas',
          collections: this.getRealCollectionsData(dateRange, region),
          summary: this.getRealCollectionsSummary(dateRange, region),
          trends: this.getCollectionTrends(dateRange)
        };
        case 'doadores':
        return {
          ...baseData,
          title: 'Relatório de Doadores',
          collectors: this.getRealCollectorsData(region),
          performance: this.getRealCollectorsPerformance(dateRange),
          rankings: this.getCollectorRankings()
        };
      
      case 'pontos':
        return {
          ...baseData,
          title: 'Relatório de Pontos de Coleta',
          points: this.getRealPointsData(region),
          distribution: this.getRealPointsDistribution(),
          efficiency: this.getPointsEfficiency(dateRange)
        };
      
      case 'financeiro':
        return {
          ...baseData,
          title: 'Relatório Financeiro',
          financial: this.getRealFinancialData(dateRange),
          costs: this.getRealCostsBreakdown(dateRange),
          projections: this.getFinancialProjections()
        };
      
      case 'impacto':
        return {
          ...baseData,
          title: 'Relatório de Impacto Ambiental',
          environmental: this.getRealEnvironmentalData(dateRange),
          sustainability: this.getRealSustainabilityMetrics(dateRange),
          goals: this.getSustainabilityGoals()
        };
      
      default:
        return baseData;
    }
  }

  async ensureDashboardData() {
    // Wait for dashboard admin to be available
    if (!window.dashboardAdmin) {
      return new Promise((resolve) => {
        const checkDashboard = () => {
          if (window.dashboardAdmin && window.dashboardAdmin.usuarios) {
            resolve();
          } else {
            setTimeout(checkDashboard, 100);
          }
        };
        checkDashboard();
      });
    }
  }

  async generatePDF(reportData) {
    // Load jsPDF library dynamically
    if (typeof window.jsPDF === 'undefined') {
      await this.loadJsPDF();
    }

    const { jsPDF } = window;
    const doc = new jsPDF();
    
    // PDF Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;
    
    // Helper function to add new page if needed
    const checkNewPage = (requiredHeight = 20) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // Header
    this.addPDFHeader(doc, reportData, margin, currentY);
    currentY += 60;

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(reportData.title, margin, currentY);
    currentY += 20;

    // Report Info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Período: ${this.formatDateRange(reportData.dateRange)}`, margin, currentY);
    currentY += 8;
    doc.text(`Região: ${this.formatRegion(reportData.region)}`, margin, currentY);
    currentY += 8;
    doc.text(`Gerado em: ${reportData.generatedAt}`, margin, currentY);
    currentY += 20;

    // Content based on report type
    switch (reportData.reportType) {
      case 'geral':
        currentY = this.addGeneralReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage);
        break;
      case 'coletas':
        currentY = this.addCollectionsReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage);
        break;      case 'doadores':
        currentY = this.addCollectorsReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage);
        break;
      case 'pontos':
        currentY = this.addPointsReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage);
        break;
      case 'financeiro':
        currentY = this.addFinancialReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage);
        break;
      case 'impacto':
        currentY = this.addEnvironmentalReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage);
        break;
    }

    // Footer
    this.addPDFFooter(doc);

    // Save PDF
    const fileName = `${reportData.reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  async loadJsPDF() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar jsPDF'));
      document.head.appendChild(script);
    });
  }

  addPDFHeader(doc, reportData, margin, y) {
    // Logo area (simulate)
    doc.setFillColor(76, 175, 80);
    doc.rect(margin, y, 40, 25, 'F');
    
    // Logo text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('EcoColeta', margin + 5, y + 16);
    
    // Reset colors
    doc.setTextColor(0, 0, 0);
    
    // User info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Usuário: ${reportData.user.nome}`, margin + 50, y + 10);
    doc.text(`Email: ${reportData.user.email}`, margin + 50, y + 20);
  }

  addPDFFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Página ${i} de ${pageCount} - Relatório gerado pela plataforma EcoColeta`,
        20,
        doc.internal.pageSize.getHeight() - 10
      );
    }
  }
  addGeneralReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage) {
    // Statistics section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Estatísticas Gerais', margin, currentY);
    currentY += 15;

    checkNewPage(40);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const stats = reportData.stats || this.getGeneralStats();
    console.log('Stats being added to PDF:', stats); // Debug log
    
    Object.entries(stats).forEach(([key, value]) => {
      const text = `${key}: ${value}`;
      console.log('Adding text to PDF:', text); // Debug log
      doc.text(text, margin, currentY);
      currentY += 8;
    });

    // Add charts data if available
    if (reportData.charts) {
      currentY += 10;
      checkNewPage(30);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Dados dos Gráficos', margin, currentY);
      currentY += 15;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      Object.entries(reportData.charts).forEach(([chartName, data]) => {
        checkNewPage(15);
        doc.text(`${chartName}:`, margin, currentY);
        currentY += 8;
        
        if (Array.isArray(data)) {
          data.forEach((item, index) => {
            checkNewPage(10);
            doc.text(`  • ${item.label || item.name || `Item ${index + 1}`}: ${item.value || item.data || 'N/A'}`, margin + 10, currentY);
            currentY += 6;
          });
        }
        currentY += 5;
      });
    }

    return currentY + 10;
  }

  addCollectionsReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage) {
    // Collections summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Resumo de Coletas', margin, currentY);
    currentY += 15;

    checkNewPage(60);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const summary = reportData.summary;
    Object.entries(summary).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, margin, currentY);
      currentY += 8;
    });

    currentY += 10;
    checkNewPage(40);

    // Collections table
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Detalhes das Coletas', margin, currentY);
    currentY += 15;

    // Simple table implementation
    const collections = reportData.collections.slice(0, 10); // Limit for PDF
    collections.forEach((collection, index) => {
      checkNewPage(15);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`${index + 1}. ${collection.ponto} - ${collection.data} - ${collection.status}`, margin, currentY);
      currentY += 12;
    });

    return currentY + 10;
  }

  addCollectorsReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage) {    // Donors performance
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Desempenho dos Doadores', margin, currentY);
    currentY += 15;

    const collectors = reportData.collectors.slice(0, 15);
    collectors.forEach((collector, index) => {
      checkNewPage(20);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`${collector.nome}`, margin, currentY);
      currentY += 10;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Email: ${collector.email}`, margin + 5, currentY);
      currentY += 8;
      doc.text(`Coletas: ${collector.coletas} | Status: ${collector.status}`, margin + 5, currentY);
      currentY += 12;
    });

    return currentY + 10;
  }

  addPointsReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage) {
    // Points distribution
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Distribuição dos Pontos de Coleta', margin, currentY);
    currentY += 15;

    const distribution = reportData.distribution;
    Object.entries(distribution).forEach(([region, count]) => {
      checkNewPage(10);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`${region}: ${count} pontos`, margin, currentY);
      currentY += 8;
    });

    currentY += 10;
    checkNewPage(40);

    // Points list
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Lista de Pontos', margin, currentY);
    currentY += 15;

    const points = reportData.points.slice(0, 10);
    points.forEach((point, index) => {
      checkNewPage(15);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`${index + 1}. ${point.nome} - ${point.endereco}`, margin, currentY);
      currentY += 8;
      doc.text(`   Materiais: ${point.materiais.join(', ')}`, margin, currentY);
      currentY += 10;
    });

    return currentY + 10;
  }

  addFinancialReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage) {
    // Financial summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Resumo Financeiro', margin, currentY);
    currentY += 15;

    const financial = reportData.financial;
    Object.entries(financial).forEach(([key, value]) => {
      checkNewPage(10);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`${key}: R$ ${value}`, margin, currentY);
      currentY += 8;
    });

    return currentY + 10;
  }

  addEnvironmentalReportContent(doc, reportData, margin, currentY, pageWidth, checkNewPage) {
    // Environmental impact
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Impacto Ambiental', margin, currentY);
    currentY += 15;

    const environmental = reportData.environmental;
    Object.entries(environmental).forEach(([key, value]) => {
      checkNewPage(10);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`${key}: ${value}`, margin, currentY);
      currentY += 8;
    });

    return currentY + 10;
  }

  generateExcel(reportData) {
    // Simple CSV export that can be opened in Excel
    let csvContent = `\uFEFF`; // BOM for UTF-8
    csvContent += `${reportData.title}\n`;
    csvContent += `Gerado em:,${reportData.generatedAt}\n`;
    csvContent += `Usuário:,${reportData.user.nome}\n\n`;

    // Add data based on report type
    switch (reportData.reportType) {
      case 'coletas':
        csvContent += `Data,Ponto,Status,Coletor,Materiais\n`;
        reportData.collections.forEach(collection => {
          csvContent += `${collection.data},${collection.ponto},${collection.status},${collection.coletor},${collection.materiais.join(';')}\n`;
        });
        break;
        case 'doadores':
        csvContent += `Nome,Email,Telefone,Coletas,Status\n`;
        reportData.collectors.forEach(collector => {
          csvContent += `${collector.nome},${collector.email},${collector.telefone},${collector.coletas},${collector.status}\n`;
        });
        break;
      
      default:
        csvContent += `Tipo de relatório não suportado para Excel\n`;
    }

    this.downloadFile(csvContent, `${reportData.reportType}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  generateCSV(reportData) {
    this.generateExcel(reportData); // Same implementation
  }

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  // Real data generation methods using dashboard data
  getRealGeneralStats() {
    const totalPoints = window.dashboardAdmin?.pontosDeColeta?.length || 0;
    const totalCollectors = window.dashboardAdmin?.usuarios?.filter(u => u.tipoUsuario === 'coletor')?.length || 0;
    const totalUsers = window.dashboardAdmin?.usuarios?.length || 0;
    
    // Calculate total collections from all agendas
    let totalCollections = 0;
    let completedCollections = 0;
    let totalVolume = 0;
    
    if (window.dashboardAdmin?.pontosDeColeta) {
      window.dashboardAdmin.pontosDeColeta.forEach(point => {
        if (point.agenda) {
          totalCollections += point.agenda.length;
          completedCollections += point.agenda.filter(a => a.status === 'concluido').length;
          // Simulate volume based on completed collections
          totalVolume += point.agenda.filter(a => a.status === 'concluido').length * 12.5; // 12.5kg average
        }
      });
    }
    
    const successRate = totalCollections > 0 ? Math.round((completedCollections / totalCollections) * 100) : 0;
    
    return {      'Total de Pontos de Coleta': totalPoints.toString(),
      'Doadores Ativos': totalCollectors.toString(),
      'Total de Usuários': totalUsers.toString(),
      'Coletas Realizadas': completedCollections.toString(),
      'Volume Total Coletado': `${(totalVolume / 1000).toFixed(1)} toneladas`,
      'Taxa de Sucesso': `${successRate}%`
    };
  }

  getRealCollectionsData(dateRange, region) {
    const collections = [];
    const days = this.getDaysFromRange(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    if (window.dashboardAdmin?.pontosDeColeta) {
      window.dashboardAdmin.pontosDeColeta.forEach(point => {
        // Filter by region if specified
        if (region !== 'all' && !this.pointMatchesRegion(point, region)) {
          return;
        }
        
        if (point.agenda) {
          point.agenda.forEach(agenda => {
            const agendaDate = new Date(agenda.dataHoraInicio);
            if (agendaDate >= startDate) {
              collections.push({
                data: agendaDate.toLocaleDateString('pt-BR'),
                ponto: point.nome || 'Ponto de Coleta',
                endereco: point.endereco || 'Endereço não informado',
                status: this.translateStatus(agenda.status),
                coletor: this.getCollectorName(point.coletorId),
                materiais: point.materiaisAceitos || ['Material não especificado'],
                volume: this.calculateCollectionVolume(agenda),
                prioridade: agenda.prioridade || 'normal'
              });
            }
          });
        }
      });
    }
    
    // Sort by date (most recent first)
    return collections.sort((a, b) => new Date(b.data.split('/').reverse().join('-')) - new Date(a.data.split('/').reverse().join('-')));
  }

  getRealCollectionsSummary(dateRange, region) {
    const collections = this.getRealCollectionsData(dateRange, region);
    const totalCollections = collections.length;
    const completedCollections = collections.filter(c => c.status === 'Concluída').length;
    const scheduledCollections = collections.filter(c => c.status === 'Agendada').length;
    const inProgressCollections = collections.filter(c => c.status === 'Em andamento').length;
    
    // Calculate material distribution
    const materialCount = {};
    collections.forEach(collection => {
      collection.materiais.forEach(material => {
        materialCount[material] = (materialCount[material] || 0) + 1;
      });
    });
    
    const mostCollectedMaterial = Object.entries(materialCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    const averageVolume = collections.reduce((sum, c) => sum + (c.volume || 0), 0) / totalCollections || 0;
    
    return {
      'Total de Coletas': totalCollections.toString(),
      'Coletas Concluídas': completedCollections.toString(),
      'Coletas Agendadas': scheduledCollections.toString(),
      'Coletas em Andamento': inProgressCollections.toString(),
      'Volume Médio por Coleta': `${averageVolume.toFixed(1)} kg`,
      'Material Mais Coletado': mostCollectedMaterial ? `${mostCollectedMaterial[0]} (${mostCollectedMaterial[1]} coletas)` : 'N/A'
    };
  }

  getRealCollectorsData(region) {
    if (!window.dashboardAdmin?.usuarios) return [];
    
    return window.dashboardAdmin.usuarios
      .filter(user => user.tipoUsuario === 'coletor')
      .filter(collector => region === 'all' || this.collectorMatchesRegion(collector, region))
      .map(collector => {
        const performance = this.calculateCollectorPerformance(collector.id);
        return {
          nome: collector.nome || 'Nome não informado',
          email: collector.email || 'Email não informado',
          telefone: collector.telefone || 'Telefone não informado',
          cidade: collector.cidade || 'Cidade não informada',
          coletas: performance.totalCollections,
          coletasCompletas: performance.completedCollections,
          pontos: performance.associatedPoints,
          status: performance.isActive ? 'Ativo' : 'Inativo',
          ultimaAtividade: performance.lastActivity,
          avaliacao: performance.rating.toFixed(1)
        };
      });
  }

  getRealPointsData(region) {
    if (!window.dashboardAdmin?.pontosDeColeta) return [];
    
    return window.dashboardAdmin.pontosDeColeta
      .filter(point => region === 'all' || this.pointMatchesRegion(point, region))
      .map(point => {
        const efficiency = this.calculatePointEfficiency(point);
        return {
          nome: point.nome || 'Ponto de Coleta',
          endereco: point.endereco || 'Endereço não informado',
          cidade: point.cidade || 'Cidade não informada',
          materiais: point.materiaisAceitos || [],
          status: this.getPointStatus(point),
          coletor: this.getCollectorName(point.coletorId),
          coletas: point.agenda?.length || 0,
          coletasCompletas: point.agenda?.filter(a => a.status === 'concluido').length || 0,
          eficiencia: `${efficiency}%`,
          ultimaColeta: this.getLastCollectionDate(point)
        };
      });
  }

  getRealPointsDistribution() {
    if (!window.dashboardAdmin?.pontosDeColeta) return {};
    
    const distribution = {};
    window.dashboardAdmin.pontosDeColeta.forEach(point => {
      const region = this.extractRegionFromPoint(point);
      distribution[region] = (distribution[region] || 0) + 1;
    });
    
    return distribution;
  }

  getRealEnvironmentalData(dateRange) {
    const collections = this.getRealCollectionsData(dateRange, 'all');
    const completedCollections = collections.filter(c => c.status === 'Concluída');
    
    // Environmental impact calculations
    const totalVolume = completedCollections.reduce((sum, c) => sum + (c.volume || 12.5), 0); // kg
    const co2Avoided = (totalVolume * 0.8).toFixed(1); // 0.8kg CO2 per kg recycled
    const treesEquivalent = Math.floor(totalVolume / 80); // 1 tree ≈ 80kg CO2/year
    const waterSaved = Math.floor(totalVolume * 15); // 15L water per kg recycled
    const energySaved = Math.floor(totalVolume * 2.5); // 2.5 kWh per kg recycled
    
    return {
      'CO₂ Evitado': `${co2Avoided} kg`,
      'Árvores Equivalentes Salvas': treesEquivalent.toString(),
      'Água Economizada': `${(waterSaved / 1000).toFixed(1)} m³`,
      'Energia Economizada': `${energySaved} kWh`,
      'Resíduos Desviados do Aterro': `${(totalVolume / 1000).toFixed(1)} toneladas`,
      'Materiais Mais Reciclados': this.getMostRecycledMaterials(completedCollections)
    };
  }

  // Helper methods
  getDaysFromRange(dateRange) {
    const ranges = { '7': 7, '30': 30, '90': 90, '365': 365, 'custom': 30 };
    return ranges[dateRange] || 30;
  }

  pointMatchesRegion(point, region) {
    const pointRegion = this.extractRegionFromPoint(point);
    return pointRegion.toLowerCase().includes(region.toLowerCase());
  }

  collectorMatchesRegion(collector, region) {
    if (!collector.cidade) return false;
    return collector.cidade.toLowerCase().includes(region.toLowerCase());
  }

  extractRegionFromPoint(point) {
    if (point.cidade) return point.cidade;
    if (point.endereco) {
      // Try to extract region from address
      const regions = ['centro', 'norte', 'sul', 'leste', 'oeste'];
      for (const region of regions) {
        if (point.endereco.toLowerCase().includes(region)) {
          return `Zona ${region.charAt(0).toUpperCase() + region.slice(1)}`;
        }
      }
      return 'Centro'; // Default
    }
    return 'Região não informada';
  }

  translateStatus(status) {
    const statusMap = {
      'agendado': 'Agendada',
      'em_andamento': 'Em andamento',
      'concluido': 'Concluída',
      'cancelado': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  getCollectorName(collectorId) {
    if (!collectorId || !window.dashboardAdmin?.usuarios) return 'Não atribuído';
    const collector = window.dashboardAdmin.usuarios.find(u => u.id === collectorId);
    return collector?.nome || 'Coletor não encontrado';
  }

  calculateCollectionVolume(agenda) {
    // Simulate volume based on agenda properties
    const baseVolume = 10; // Base 10kg
    const priorityMultiplier = { 'baixa': 0.8, 'normal': 1, 'alta': 1.3, 'urgente': 1.5 };
    const multiplier = priorityMultiplier[agenda.prioridade] || 1;
    return +(baseVolume * multiplier + Math.random() * 10).toFixed(1);
  }

  calculateCollectorPerformance(collectorId) {
    let totalCollections = 0;
    let completedCollections = 0;
    let associatedPoints = 0;
    let lastActivity = null;
    
    if (window.dashboardAdmin?.pontosDeColeta) {
      window.dashboardAdmin.pontosDeColeta.forEach(point => {
        if (point.coletorId === collectorId || point.criadoPor === collectorId) {
          associatedPoints++;
          if (point.agenda) {
            totalCollections += point.agenda.length;
            completedCollections += point.agenda.filter(a => a.status === 'concluido').length;
            
            // Find most recent activity
            point.agenda.forEach(agenda => {
              const agendaDate = new Date(agenda.dataHoraInicio);
              if (!lastActivity || agendaDate > lastActivity) {
                lastActivity = agendaDate;
              }
            });
          }
        }
      });
    }
    
    const successRate = totalCollections > 0 ? (completedCollections / totalCollections) : 0;
    const rating = 3.5 + (successRate * 1.5); // Rating between 3.5 and 5.0
    const isActive = lastActivity && (new Date() - lastActivity) < (30 * 24 * 60 * 60 * 1000); // Active if activity in last 30 days
    
    return {
      totalCollections,
      completedCollections,
      associatedPoints,
      isActive,
      lastActivity: lastActivity ? lastActivity.toLocaleDateString('pt-BR') : 'Nunca',
      rating
    };
  }

  calculatePointEfficiency(point) {
    if (!point.agenda || point.agenda.length === 0) return 0;
    const completed = point.agenda.filter(a => a.status === 'concluido').length;
    return Math.round((completed / point.agenda.length) * 100);
  }

  getPointStatus(point) {
    if (!point.agenda || point.agenda.length === 0) return 'Inativo';
    const recentActivity = point.agenda.some(agenda => {
      const agendaDate = new Date(agenda.dataHoraInicio);
      const daysDiff = (new Date() - agendaDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });
    return recentActivity ? 'Ativo' : 'Inativo';
  }

  getLastCollectionDate(point) {
    if (!point.agenda || point.agenda.length === 0) return 'Nunca';
    const lastAgenda = point.agenda
      .filter(a => a.status === 'concluido')
      .sort((a, b) => new Date(b.dataHoraInicio) - new Date(a.dataHoraInicio))[0];
    return lastAgenda ? new Date(lastAgenda.dataHoraInicio).toLocaleDateString('pt-BR') : 'Nunca';
  }

  getMostRecycledMaterials(collections) {
    const materialCount = {};
    collections.forEach(collection => {
      collection.materiais.forEach(material => {
        materialCount[material] = (materialCount[material] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(materialCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return sorted.map(([material, count]) => `${material} (${count})`).join(', ') || 'Nenhum';
  }

  async getRealChartData() {
    // Generate real chart data from dashboard information
    const materialData = this.generateMaterialChartData();
    const monthlyData = this.generateMonthlyChartData();
    const regionData = this.generateRegionChartData();
    
    return {
      materials: materialData,
      monthly: monthlyData,
      regions: regionData
    };
  }

  generateMaterialChartData() {
    const materialCount = {};
    
    if (window.dashboardAdmin?.pontosDeColeta) {
      window.dashboardAdmin.pontosDeColeta.forEach(point => {
        if (point.materiaisAceitos) {
          point.materiaisAceitos.forEach(material => {
            materialCount[material] = (materialCount[material] || 0) + 1;
          });
        }
      });
    }
    
    return {
      labels: Object.keys(materialCount),
      data: Object.values(materialCount)
    };
  }

  generateMonthlyChartData() {
    const monthlyCollections = new Array(6).fill(0);
    const monthLabels = [];
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      monthLabels.push(date.toLocaleDateString('pt-BR', { month: 'short' }));
      
      // Count collections for this month
      if (window.dashboardAdmin?.pontosDeColeta) {
        window.dashboardAdmin.pontosDeColeta.forEach(point => {
          if (point.agenda) {
            point.agenda.forEach(agenda => {
              const agendaDate = new Date(agenda.dataHoraInicio);
              if (agendaDate.getMonth() === date.getMonth() && 
                  agendaDate.getFullYear() === date.getFullYear() &&
                  agenda.status === 'concluido') {
                monthlyCollections[5 - i]++;
              }
            });
          }
        });
      }
    }
    
    return {
      labels: monthLabels,
      data: monthlyCollections
    };
  }

  generateRegionChartData() {
    const regionCount = {};
    
    if (window.dashboardAdmin?.pontosDeColeta) {
      window.dashboardAdmin.pontosDeColeta.forEach(point => {
        const region = this.extractRegionFromPoint(point);
        regionCount[region] = (regionCount[region] || 0) + 1;
      });
    }
    
    return {
      labels: Object.keys(regionCount),
      data: Object.values(regionCount)
    };
  }

  // Keep original data generation methods as fallback
  getGeneralStats() {    return {
      'Total de Pontos de Coleta': '147',
      'Doadores Ativos': '23',
      'Coletas Este Mês': '892',
      'Volume Total Coletado': '15.7 toneladas',
      'Taxa de Sucesso': '94%'
    };
  }

  getCollectionsData() {
    const collections = [];
    for (let i = 0; i < 20; i++) {
      collections.push({
        data: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        ponto: `Ponto de Coleta ${i + 1}`,
        status: ['Concluída', 'Agendada', 'Em andamento'][Math.floor(Math.random() * 3)],
        coletor: `Coletor ${i + 1}`,
        materiais: ['Papel', 'Plástico', 'Vidro', 'Metal'].slice(0, Math.floor(Math.random() * 4) + 1)
      });
    }
    return collections;
  }

  getCollectionsSummary() {
    return {
      'Total de Coletas': '892',
      'Coletas Concluídas': '847',
      'Coletas Agendadas': '45',
      'Volume Médio por Coleta': '17.6 kg',
      'Material Mais Coletado': 'Papel (35%)'
    };
  }
  getDonorsData() {
    const donors = [];
    for (let i = 0; i < 15; i++) {
      donors.push({
        nome: `Doador ${i + 1}`,
        email: `doador${i + 1}@ecocoleta.com`,
        telefone: `(11) 9${String(Math.random()).slice(2, 10)}`,
        doacoes: Math.floor(Math.random() * 50) + 10,
        status: Math.random() > 0.2 ? 'Ativo' : 'Inativo'
      });
    }
    return donors;
  }
  getDonorsPerformance() {
    return {
      'Doador Mais Ativo': 'João Silva (67 doações)',
      'Taxa Média de Sucesso': '91%',
      'Tempo Médio por Doação': '2.3 horas',
      'Avaliação Média': '4.6/5'
    };
  }

  getPointsData() {
    const points = [];
    const regioes = ['Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste'];
    const materiais = ['Papel', 'Plástico', 'Vidro', 'Metal', 'Orgânico'];
    
    for (let i = 0; i < 20; i++) {
      points.push({
        nome: `Ecoponto ${i + 1}`,
        endereco: `Rua ${i + 1}, ${Math.floor(Math.random() * 1000)} - ${regioes[Math.floor(Math.random() * regioes.length)]}`,
        materiais: materiais.slice(0, Math.floor(Math.random() * 3) + 2),
        status: Math.random() > 0.1 ? 'Ativo' : 'Inativo'
      });
    }
    return points;
  }

  getPointsDistribution() {
    return {
      'Centro': 23,
      'Zona Norte': 31,
      'Zona Sul': 28,
      'Zona Leste': 35,
      'Zona Oeste': 30
    };
  }

  getFinancialData() {
    return {
      'Receita Total': '287.450,00',
      'Custos Operacionais': '156.230,00',
      'Lucro Líquido': '131.220,00',
      'Investimentos': '45.000,00',
      'ROI': '18.5%'
    };
  }

  getCostsBreakdown() {
    return {
      'Combustível': '45.230,00',
      'Manutenção': '23.450,00',
      'Salários': '67.890,00',
      'Equipamentos': '19.660,00'
    };
  }

  getEnvironmentalData() {
    return {
      'CO₂ Evitado': '12.5 toneladas',
      'Árvores Equivalentes Salvas': '156',
      'Água Economizada': '45.000 litros',
      'Energia Economizada': '8.900 kWh',
      'Resíduos Desviados do Aterro': '15.7 toneladas'
    };
  }

  getSustainabilityMetrics() {
    return {
      'Índice de Sustentabilidade': '87%',
      'Taxa de Reciclagem': '94%',
      'Eficiência Energética': '91%',
      'Impacto Social': '4.8/5'
    };
  }

  async getChartData() {
    // Return placeholder data for charts
    return {
      materials: {
        labels: ['Papel', 'Plástico', 'Vidro', 'Metal'],
        data: [125, 98, 67, 45]
      },
      monthly: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        data: [65, 72, 81, 89, 92, 95]
      }
    };
  }

  applyTemplate(e) {
    const templateCard = e.target.closest('.template-card');
    const templateName = templateCard.querySelector('h4').textContent;
    
    // Pre-fill form based on template
    const reportTypeSelect = document.getElementById('report-type');
    switch(templateName) {
      case 'Relatório de Desempenho':
        reportTypeSelect.value = 'geral';
        break;
      case 'Relatório Ambiental':
        reportTypeSelect.value = 'impacto';
        break;
      case 'Relatório Financeiro':
        reportTypeSelect.value = 'financeiro';
        break;
      case 'Relatório de Coletores':
        reportTypeSelect.value = 'coletores';
        break;
    }
    
    this.showNotification(`Modelo "${templateName}" aplicado`, 'info');
  }

  refreshReports() {
    const refreshBtn = document.getElementById('refresh-reports');
    const icon = refreshBtn.querySelector('svg');
    icon.style.animation = 'spin 1s linear infinite';
    
    setTimeout(() => {
      icon.style.animation = '';
      this.showNotification('Relatórios atualizados', 'success');
    }, 1000);
  }

  formatDateRange(dateRange) {
    const ranges = {
      '7': 'Últimos 7 dias',
      '30': 'Últimos 30 dias',
      '90': 'Últimos 90 dias',
      '365': 'Último ano',
      'custom': 'Período personalizado'
    };
    return ranges[dateRange] || 'Período não especificado';
  }

  formatRegion(region) {
    const regions = {
      'all': 'Todas as regiões',
      'norte': 'Região Norte',
      'sul': 'Região Sul',
      'centro': 'Região Centro',
      'leste': 'Região Leste',
      'oeste': 'Região Oeste'
    };
    return regions[region] || 'Região não especificada';
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  new RelatoriosManager();
});