// Script para validação final do filtro
console.log('🚀 VALIDAÇÃO FINAL - Verificando funcionamento do filtro');

// Configurar usuário Samuel se não estiver logado
function configurarSamuelSeNecessario() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        const samuel = {
            id: 7,
            nome: "Samuel Maciel da Silva Figueiredo",
            email: "samuelsilvamaciel02@gmail.com",
            tipoUsuario: "coletor",
            ecopontoId: 31
        };
        localStorage.setItem('currentUser', JSON.stringify(samuel));
        console.log('✅ Login do Samuel configurado automaticamente');
        return samuel;
    } else {
        const user = JSON.parse(userData);
        console.log('👤 Usuário já logado:', user);
        return user;
    }
}

// Função para testar o filtro diretamente
async function testarFiltroFinal() {
    console.log('🔬 TESTE FINAL DO FILTRO');
    
    // Garantir que Samuel está logado
    const currentUser = configurarSamuelSeNecessario();
    
    try {
        // Buscar dados da API
        const [pontosResponse, usuariosResponse] = await Promise.all([
            fetch('http://localhost:3000/api/pontosDeColeta'),
            fetch('http://localhost:3000/api/usuarios')
        ]);

        const pontos = await pontosResponse.json();
        const usuarios = await usuariosResponse.json();
        
        console.log(`📊 Dados carregados: ${pontos.length} pontos, ${usuarios.length} usuários`);
        
        // Aplicar filtro para coletor Samuel
        const pontosRelevantes = pontos.filter(ponto => {
            // Critério 1: coletorId = ID do usuário
            if (ponto.coletorId === currentUser.id) return true;
            
            // Critério 2: criadoPor = ID do usuário
            if (ponto.criadoPor === currentUser.id) return true;
            
            // Critério 3: ecopontoId do usuário = ID do ponto
            if (currentUser.ecopontoId === ponto.id) return true;
            
            return false;
        });
        
        console.log(`🎯 RESULTADO DO FILTRO:`);
        console.log(`   Pontos relevantes para Samuel: ${pontosRelevantes.length}`);
        
        pontosRelevantes.forEach(ponto => {
            console.log(`   ✅ ${ponto.nome} (ID: ${ponto.id})`);
            console.log(`      ColetorId: ${ponto.coletorId}`);
            console.log(`      CriadoPor: ${ponto.criadoPor}`);
            console.log(`      Agendamentos: ${ponto.agenda?.length || 0}`);
            
            if (ponto.agenda && ponto.agenda.length > 0) {
                ponto.agenda.forEach(agenda => {
                    console.log(`        📅 ${agenda.idAgenda} - ${agenda.contatoResponsavel} - ${agenda.status}`);
                });
            }
        });
        
        // Verificar se encontrou o ponto esperado (ID 31)
        const pontoEsperado = pontosRelevantes.find(p => p.id === 31);
        if (pontoEsperado) {
            console.log('✅ SUCESSO: Ponto 31 (Ecoponto Organização EcoColeta) encontrado!');
            console.log(`   Agendamentos encontrados: ${pontoEsperado.agenda?.length || 0}`);
        } else {
            console.log('❌ ERRO: Ponto 31 não foi encontrado pelo filtro!');
        }
        
        return pontosRelevantes;
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Função para recarregar a página de agendas com filtro aplicado
function recarregarAgendas() {
    if (window.scheduleManager && typeof window.scheduleManager.loadSchedules === 'function') {
        console.log('🔄 Recarregando agendas...');
        window.scheduleManager.loadSchedules();
    } else {
        console.log('⚠️ ScheduleManager não encontrado na página');
    }
}

// Executar teste automaticamente
testarFiltroFinal();

// Disponibilizar funções globalmente
window.testarFiltroFinal = testarFiltroFinal;
window.recarregarAgendas = recarregarAgendas;
window.configurarSamuelSeNecessario = configurarSamuelSeNecessario;

console.log('✅ Script de validação carregado. Use testarFiltroFinal() para testar');
