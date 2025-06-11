// Script de teste final para validar filtros de doadores e coletores
console.log('🎯 TESTE FINAL COMPLETO - Filtros Doadores e Coletores');

async function testeCompletoFiltros() {
    try {
        // Carregar dados
        const [pontosResponse, usuariosResponse] = await Promise.all([
            fetch('http://localhost:3000/api/pontosDeColeta'),
            fetch('http://localhost:3000/api/usuarios')
        ]);

        const pontos = await pontosResponse.json();
        const usuarios = await usuariosResponse.json();

        console.log(`📊 Sistema carregado: ${pontos.length} pontos, ${usuarios.length} usuários`);

        // Teste 1: Doador Samuel (ID: 5)
        console.log('\n🧪 TESTE 1: DOADOR Samuel (ID: 5)');
        await testarUsuario(5, pontos, usuarios);

        // Teste 2: Coletor Samuel (ID: 7)
        console.log('\n🧪 TESTE 2: COLETOR Samuel (ID: 7)');
        await testarUsuario(7, pontos, usuarios);

        // Teste 3: Outro doador (ID: 2)
        console.log('\n🧪 TESTE 3: DOADOR Matheus (ID: 2)');
        await testarUsuario(2, pontos, usuarios);

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

async function testarUsuario(userId, pontos, usuarios) {
    const usuario = usuarios.find(u => u.id === userId);
    if (!usuario) {
        console.log(`❌ Usuário ${userId} não encontrado`);
        return;
    }

    console.log(`👤 Usuário: ${usuario.nome} (${usuario.tipoUsuario})`);

    let pontosRelevantes = [];
    let agendamentosRelevantes = 0;

    if (usuario.tipoUsuario === 'doador') {
        // Filtro para doadores: apenas pontos onde têm agendamentos
        pontosRelevantes = pontos.filter(ponto => {
            if (!ponto.agenda || ponto.agenda.length === 0) return false;
            return ponto.agenda.some(agenda => agenda.idUsuarioAgendamento === usuario.id);
        });

        // Contar apenas agendamentos do próprio doador
        pontosRelevantes.forEach(ponto => {
            const agendamentosDoUsuario = ponto.agenda.filter(agenda => 
                agenda.idUsuarioAgendamento === usuario.id
            );
            agendamentosRelevantes += agendamentosDoUsuario.length;
        });

    } else if (usuario.tipoUsuario === 'coletor') {
        // Filtro para coletores: pontos onde são responsáveis
        pontosRelevantes = pontos.filter(ponto => {
            return (ponto.coletorId === usuario.id) ||
                   (ponto.criadoPor === usuario.id) ||
                   (usuario.ecopontoId === ponto.id);
        });

        // Coletores veem todos os agendamentos dos seus pontos
        pontosRelevantes.forEach(ponto => {
            agendamentosRelevantes += ponto.agenda ? ponto.agenda.length : 0;
        });
    }

    console.log(`   📍 Pontos relevantes: ${pontosRelevantes.length}`);
    console.log(`   📅 Agendamentos: ${agendamentosRelevantes}`);

    pontosRelevantes.forEach(ponto => {
        const totalAgendamentos = ponto.agenda ? ponto.agenda.length : 0;
        const agendamentosDoUsuario = usuario.tipoUsuario === 'doador' 
            ? ponto.agenda.filter(agenda => agenda.idUsuarioAgendamento === usuario.id).length
            : totalAgendamentos;

        console.log(`      ✅ ${ponto.nome} (ID: ${ponto.id}) - ${agendamentosDoUsuario}/${totalAgendamentos} agendamentos`);
    });

    if (pontosRelevantes.length === 0) {
        console.log(`   ℹ️ Nenhum ponto relevante encontrado`);
    }
}

// Função para configurar usuário específico
function configurarUsuario(userId, nome, email, tipo, ecopontoId = null) {
    const user = { id: userId, nome, email, tipoUsuario: tipo };
    if (ecopontoId) user.ecopontoId = ecopontoId;
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log(`✅ Usuário configurado: ${nome} (${tipo})`);
    return user;
}

// Funções para configurar usuários específicos
window.configurarSamuelDoador = () => configurarUsuario(5, "Samuel Doador", "samuelfigsre@gmail.com", "doador");
window.configurarSamuelColetor = () => configurarUsuario(7, "Samuel Coletor", "samuelsilvamaciel02@gmail.com", "coletor", 31);
window.configurarMatheusDoador = () => configurarUsuario(2, "Matheus Doador", "matheusaagd2@gmail.com", "doador");

// Função para recarregar agendas
window.recarregarAgendas = () => {
    if (window.scheduleManager && typeof window.scheduleManager.loadSchedules === 'function') {
        console.log('🔄 Recarregando agendas...');
        window.scheduleManager.loadSchedules();
    } else {
        console.log('⚠️ ScheduleManager não encontrado');
    }
};

// Executar teste automático
window.testeCompletoFiltros = testeCompletoFiltros;

// Executar teste quando carregado
setTimeout(() => {
    testeCompletoFiltros();
}, 2000);

console.log('✅ Script de teste carregado');
console.log('📝 Funções disponíveis:');
console.log('   - configurarSamuelDoador()');
console.log('   - configurarSamuelColetor()');
console.log('   - configurarMatheusDoador()');
console.log('   - recarregarAgendas()');
console.log('   - testeCompletoFiltros()');
