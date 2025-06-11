// Correção do filtro para coletores - agendas-filtro-corrigido.js
// Este arquivo deve ser incluído DEPOIS do código principal da página agendas

console.log('🔧 Aplicando correção do filtro para coletores...');

// Sobrescrever o método loadSchedules com a correção
if (window.scheduleManager && typeof window.scheduleManager.loadSchedules === 'function') {
    // Backup do método original
    window.scheduleManager.originalLoadSchedules = window.scheduleManager.loadSchedules;
    
    // Método corrigido
    window.scheduleManager.loadSchedules = async function() {
        console.log('🔄 Carregando agendamentos com filtro CORRIGIDO para coletores...');
        
        try {
            // Buscar pontos de coleta e usuários da API
            const [pontosResponse, usuariosResponse] = await Promise.all([
                fetch('http://localhost:3000/api/pontosDeColeta'),
                fetch('http://localhost:3000/api/usuarios')
            ]);

            if (!pontosResponse.ok || !usuariosResponse.ok) {
                throw new Error('Erro ao carregar dados da API');
            }

            const pontos = await pontosResponse.json();
            const usuarios = await usuariosResponse.json();

            // Obter usuário atual com melhor lógica
            let currentUser = null;
            
            try {
                // Tentar obter do localStorage primeiro
                const userData = localStorage.getItem('currentUser');
                if (userData) {
                    const userFromStorage = JSON.parse(userData);
                    currentUser = usuarios.find(u => u.id === userFromStorage.id);
                    console.log('👤 Usuário obtido do localStorage:', currentUser);
                }
                
                // Se não encontrou, tentar email específico do Samuel
                if (!currentUser) {
                    currentUser = usuarios.find(u => u.email === 'samuelsilvamaciel02@gmail.com');
                    console.log('👤 Usuário encontrado por email específico:', currentUser);
                }
                
                // Último recurso: usar ID 7
                if (!currentUser) {
                    currentUser = usuarios.find(u => u.id === 7);
                    console.log('👤 Usuário padrão (ID 7):', currentUser);
                }
            } catch (error) {
                console.error('Erro ao obter usuário:', error);
                currentUser = usuarios.find(u => u.id === 7); // Fallback
            }
            
            if (!currentUser) {
                throw new Error('Usuário não encontrado');
            }
            
            console.log('✅ Usuário atual identificado:', {
                id: currentUser.id,
                nome: currentUser.nome,
                email: currentUser.email,
                tipoUsuario: currentUser.tipoUsuario,
                ecopontoId: currentUser.ecopontoId
            });

            // FILTRO CORRIGIDO - Aplicar filtro rigoroso para coletores
            let pontosRelevantes = [];
            
            if (currentUser.tipoUsuario === 'coletor') {
                console.log('🔍 APLICANDO FILTRO PARA COLETOR:');
                console.log(`   Usuário: ${currentUser.nome} (ID: ${currentUser.id})`);
                console.log(`   Email: ${currentUser.email}`);
                console.log(`   EcopontoId: ${currentUser.ecopontoId || 'Não definido'}`);
                
                pontosRelevantes = pontos.filter(ponto => {
                    let incluir = false;
                    let razao = [];
                    
                    // Critério 1: coletorId igual ao ID do usuário
                    if (ponto.coletorId && ponto.coletorId === currentUser.id) {
                        incluir = true;
                        razao.push(`coletorId (${ponto.coletorId}) = usuarioId (${currentUser.id})`);
                    }
                    
                    // Critério 2: criadoPor igual ao ID do usuário
                    if (ponto.criadoPor && ponto.criadoPor === currentUser.id) {
                        incluir = true;
                        razao.push(`criadoPor (${ponto.criadoPor}) = usuarioId (${currentUser.id})`);
                    }
                    
                    // Critério 3: ecopontoId do usuário igual ao ID do ponto
                    if (currentUser.ecopontoId && currentUser.ecopontoId === ponto.id) {
                        incluir = true;
                        razao.push(`ecopontoId (${currentUser.ecopontoId}) = pontoId (${ponto.id})`);
                    }
                    
                    if (incluir) {
                        console.log(`   ✅ Incluindo ponto: ${ponto.nome} (ID: ${ponto.id})`);
                        console.log(`      Razões: ${razao.join(', ')}`);
                    }
                    
                    return incluir;
                });
                
                console.log(`📊 RESULTADO DO FILTRO:`);
                console.log(`   Total de pontos no sistema: ${pontos.length}`);
                console.log(`   Pontos FILTRADOS para este coletor: ${pontosRelevantes.length}`);
                
                if (pontosRelevantes.length === 0) {
                    console.log(`❌ NENHUM PONTO ENCONTRADO!`);
                    console.log(`   Verificações:`);
                    console.log(`   - Pontos com coletorId = ${currentUser.id}: ${pontos.filter(p => p.coletorId === currentUser.id).length}`);
                    console.log(`   - Pontos com criadoPor = ${currentUser.id}: ${pontos.filter(p => p.criadoPor === currentUser.id).length}`);
                    console.log(`   - Pontos com ID = ${currentUser.ecopontoId}: ${currentUser.ecopontoId ? pontos.filter(p => p.id === currentUser.ecopontoId).length : 0}`);
                }
                  } else if (currentUser.tipoUsuario === 'doador') {
                // Para doadores - mostrar apenas pontos onde ELES fizeram agendamentos
                console.log('👥 APLICANDO FILTRO PARA DOADOR:');
                console.log(`   Usuário: ${currentUser.nome} (ID: ${currentUser.id})`);
                console.log(`   Email: ${currentUser.email}`);
                
                pontosRelevantes = pontos.filter(ponto => {
                    if (!ponto.agenda || ponto.agenda.length === 0) return false;
                    
                    // Verificar se tem algum agendamento deste doador específico
                    const temAgendamentoDoUsuario = ponto.agenda.some(agenda => 
                        agenda.idUsuarioAgendamento === currentUser.id
                    );
                    
                    if (temAgendamentoDoUsuario) {
                        const qtdAgendamentos = ponto.agenda.filter(agenda => 
                            agenda.idUsuarioAgendamento === currentUser.id
                        ).length;
                        console.log(`   ✅ Incluindo ponto: ${ponto.nome} (ID: ${ponto.id}) - ${qtdAgendamentos} agendamentos do usuário`);
                    }
                    
                    return temAgendamentoDoUsuario;
                });
                
                console.log(`📊 RESULTADO DO FILTRO DOADOR:`);
                console.log(`   Total de pontos no sistema: ${pontos.length}`);
                console.log(`   Pontos com agendamentos do doador: ${pontosRelevantes.length}`);
                
                if (pontosRelevantes.length === 0) {
                    console.log(`ℹ️ Doador não possui agendamentos em nenhum ponto`);
                }
                
            } else {
                // Tipo de usuário não identificado
                console.log('⚠️ Tipo de usuário não identificado, não aplicando filtro');
                pontosRelevantes = [];
            }            // Processar agendamentos dos pontos filtrados
            this.schedules = [];
            let agendamentosProcessados = 0;
            
            pontosRelevantes.forEach(ponto => {
                if (ponto.agenda && ponto.agenda.length > 0) {
                    // Filtrar agendamentos baseado no tipo de usuário
                    let agendamentosRelevantes = [];
                    
                    if (currentUser.tipoUsuario === 'coletor') {
                        // Coletores veem todos os agendamentos dos seus pontos
                        agendamentosRelevantes = ponto.agenda;
                        console.log(`📅 [COLETOR] Processando ${ponto.agenda.length} agendamentos do ponto: ${ponto.nome}`);
                    } else if (currentUser.tipoUsuario === 'doador') {
                        // Doadores veem apenas seus próprios agendamentos
                        agendamentosRelevantes = ponto.agenda.filter(agenda => 
                            agenda.idUsuarioAgendamento === currentUser.id
                        );
                        console.log(`📅 [DOADOR] Processando ${agendamentosRelevantes.length} agendamentos próprios do ponto: ${ponto.nome}`);
                    }
                    
                    agendamentosRelevantes.forEach(agendamento => {
                        // Encontrar dados do doador
                        const doador = usuarios.find(u => u.id === agendamento.idUsuarioAgendamento);
                        
                        if (doador) {
                            agendamentosProcessados++;
                            
                            // Converter formato da data
                            const dataAgendamento = new Date(agendamento.dataHoraInicio);
                            const dataFormatada = dataAgendamento.toISOString().split('T')[0];
                            const horaFormatada = dataAgendamento.toTimeString().slice(0, 5);

                            this.schedules.push({
                                id: agendamento.idAgenda || `agenda-${Date.now()}-${Math.random()}`,
                                point: ponto.nome,
                                pointId: ponto.id,
                                collector: doador.nome,
                                collectorEmail: doador.email,
                                collectorPhone: doador.telefone || 'Não informado',
                                date: dataFormatada,
                                time: horaFormatada,
                                materials: Array.isArray(agendamento.materiais) ? agendamento.materiais : 
                                          (agendamento.materiais ? agendamento.materiais.split(' ') : []),
                                status: agendamento.status || 'agendado',
                                priority: this.determinePriority(agendamento),
                                notes: agendamento.observacoes || agendamento.descricao || '',
                                tipo: agendamento.tipo || 'coleta_regular',
                                enderecoPonto: ponto.endereco,
                                contatoResponsavel: agendamento.contatoResponsavel || doador.nome,
                                dataFim: agendamento.dataHoraFim ? new Date(agendamento.dataHoraFim) : null,
                                coletorResponsavel: this.getColetorResponsavel(ponto, usuarios),
                                isFromMyPoint: true
                            });
                        }
                    });
                }
            });

            // Ordenar por data e hora
            this.schedules.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA - dateB;
            });

            this.filteredSchedules = [...this.schedules];
            this.updateStatistics();
            this.updateCharts();

            console.log(`✅ CARREGAMENTO CONCLUÍDO:`);
            console.log(`   Pontos filtrados: ${pontosRelevantes.length}`);
            console.log(`   Agendamentos processados: ${agendamentosProcessados}`);
            console.log(`   Agendamentos finais: ${this.schedules.length}`);

        } catch (error) {
            console.error('❌ Erro ao carregar agendamentos:', error);
            alert('Erro ao carregar agendamentos. Verifique o console para mais detalhes.');
            this.loadMockData(); // Fallback
        }
    };
    
    console.log('✅ Filtro corrigido aplicado com sucesso!');
    
    // Recarregar os dados com o novo filtro
    if (window.scheduleManager.schedules && window.scheduleManager.schedules.length > 0) {
        console.log('🔄 Reaplicando filtro nos dados existentes...');
        window.scheduleManager.loadSchedules();
    }
} else {
    console.log('⚠️ scheduleManager não encontrado. O filtro será aplicado quando disponível.');
}

// Função auxiliar para forçar recarregamento
window.aplicarFiltroColetores = function() {
    console.log('🔄 Forçando recarregamento com filtro corrigido...');
    if (window.scheduleManager && window.scheduleManager.loadSchedules) {
        window.scheduleManager.loadSchedules();
    }
};

console.log('🚀 Correção do filtro carregada. Use aplicarFiltroColetores() para forçar recarregamento.');
