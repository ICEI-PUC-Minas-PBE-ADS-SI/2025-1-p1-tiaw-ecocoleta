// Função simplificada para substituir a loadSchedules problemática
async function loadSchedulesSimple() {
  try {
    console.log('🔄 Carregando agendas de forma simplificada...');
    
    // Fetch data from API
    const [pontosResponse, usuariosResponse] = await Promise.all([
      fetch('http://localhost:3000/api/pontosDeColeta'),
      fetch('http://localhost:3000/api/usuarios')
    ]);

    if (!pontosResponse.ok || !usuariosResponse.ok) {
      throw new Error('Erro ao carregar dados da API');
    }

    const pontos = await pontosResponse.json();
    const usuarios = await usuariosResponse.json();

    console.log(`📊 Dados carregados: ${pontos.length} pontos, ${usuarios.length} usuários`);

    // Get current user - simple fallback
    let currentUser = usuarios.find(u => u.id === 5); // Samuel para teste
    if (!currentUser) {
      currentUser = usuarios[0]; // Primeiro usuário como fallback
    }
    
    console.log('👤 Usuário atual:', currentUser);

    // Process schedules
    const schedules = [];
    let totalAgendamentos = 0;

    pontos.forEach(ponto => {
      if (ponto.agenda && ponto.agenda.length > 0) {
        totalAgendamentos += ponto.agenda.length;
        
        ponto.agenda.forEach(agendamento => {
          const doador = usuarios.find(u => u.id === agendamento.idUsuarioAgendamento);
          
          if (doador) {
            const dataAgendamento = new Date(agendamento.dataHoraInicio);
            
            schedules.push({
              id: agendamento.idAgenda || `agenda-${Date.now()}-${Math.random()}`,
              point: ponto.nome,
              collector: doador.nome,
              collectorEmail: doador.email,
              collectorPhone: doador.telefone || 'Não informado',
              date: dataAgendamento.toISOString().split('T')[0],
              time: dataAgendamento.toTimeString().slice(0, 5),
              materials: agendamento.materiais || [],
              status: agendamento.status || 'agendado',
              notes: agendamento.observacoes || agendamento.descricao || '',
              enderecoPonto: ponto.endereco
            });
          }
        });
      }
    });

    console.log(`✅ Processados ${schedules.length} agendamentos de ${totalAgendamentos} total`);

    // Update the scheduleManager if it exists
    if (window.scheduleManager) {
      window.scheduleManager.schedules = schedules;
      window.scheduleManager.filteredSchedules = schedules;
      window.scheduleManager.renderTimeline();
      window.scheduleManager.updateStatistics();
      console.log('✅ ScheduleManager atualizado com sucesso');
    }

    // Direct DOM update as fallback
    updateTimelineDirectly(schedules);
    updateStatsDirectly(schedules);

    return schedules;

  } catch (error) {
    console.error('❌ Erro ao carregar agendas:', error);
    
    // Show error in UI
    const timeline = document.getElementById('schedules-timeline');
    if (timeline) {
      timeline.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc3545;">
          <h3>❌ Erro ao carregar agendas</h3>
          <p>${error.message}</p>
          <button onclick="loadSchedulesSimple()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
            🔄 Tentar Novamente
          </button>
        </div>
      `;
    }
    
    throw error;
  }
}

function updateTimelineDirectly(schedules) {
  const timeline = document.getElementById('schedules-timeline');
  if (!timeline) return;

  if (schedules.length === 0) {
    timeline.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #6c757d;">
        <h3>📅 Nenhuma agenda encontrada</h3>
        <p>Não há agendamentos para exibir no momento.</p>
        <button onclick="loadSchedulesSimple()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
          🔄 Atualizar
        </button>
      </div>
    `;
    return;
  }

  // Group by date
  const grouped = {};
  schedules.forEach(schedule => {
    if (!grouped[schedule.date]) {
      grouped[schedule.date] = [];
    }
    grouped[schedule.date].push(schedule);
  });

  let html = '';
  Object.keys(grouped).sort().forEach(date => {
    const dateFormatted = new Date(date).toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    
    html += `
      <div class="timeline-day">
        <div class="timeline-day-header">
          <h3>${dateFormatted}</h3>
          <span class="schedule-count">${grouped[date].length} coletas</span>
        </div>
    `;
    
    grouped[date].forEach(schedule => {
      html += `
        <div class="timeline-item status-${schedule.status}">
          <div class="timeline-time">${schedule.time}</div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h4>📍 ${schedule.point}</h4>
              <span class="status-badge status-${schedule.status}">${formatStatus(schedule.status)}</span>
            </div>
            <div class="timeline-details">
              <div class="detail-item">
                <strong>👤 Doador:</strong> ${schedule.collector}
              </div>
              <div class="detail-item">
                <strong>📧 Email:</strong> ${schedule.collectorEmail || 'Não informado'}
              </div>
              <div class="detail-item">
                <strong>📞 Telefone:</strong> ${schedule.collectorPhone}
              </div>
              <div class="detail-item">
                <strong>♻️ Materiais:</strong> ${schedule.materials.join(', ') || 'Não especificado'}
              </div>
              <div class="detail-item">
                <strong>📍 Endereço:</strong> ${schedule.enderecoPonto || 'Não informado'}
              </div>
              ${schedule.notes ? `<div class="detail-item"><strong>📝 Observações:</strong> ${schedule.notes}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
  });

  timeline.innerHTML = html;
}

function updateStatsDirectly(schedules) {
  const counts = {
    total: schedules.length,
    agendado: schedules.filter(s => s.status === 'agendado').length,
    'em-andamento': schedules.filter(s => s.status === 'em-andamento').length,
    concluido: schedules.filter(s => s.status === 'concluido').length
  };

  // Update main stats
  const elements = {
    'schedules-today': counts.total,
    'schedules-progress': counts['em-andamento'],
    'schedules-completed': counts.concluido,
    'success-rate': schedules.length > 0 ? Math.round((counts.concluido / schedules.length) * 100) + '%' : '0%'
  };

  Object.entries(elements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  // Update summary stats
  const summaryElements = {
    'summary-scheduled': counts.agendado,
    'summary-progress': counts['em-andamento'],
    'summary-completed': counts.concluido,
    'summary-cancelled': schedules.filter(s => s.status === 'cancelado').length
  };

  Object.entries(summaryElements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function formatStatus(status) {
  const statuses = {
    'agendado': 'Agendado',
    'em-andamento': 'Em Andamento', 
    'concluido': 'Concluído',
    'cancelado': 'Cancelado'
  };
  return statuses[status] || status;
}

// Auto-load when script loads
console.log('🚀 Script de correção carregado');
setTimeout(() => {
  console.log('🔄 Iniciando carregamento automático...');
  loadSchedulesSimple();
}, 2000);

// Expose globally for manual testing
window.loadSchedulesSimple = loadSchedulesSimple;
