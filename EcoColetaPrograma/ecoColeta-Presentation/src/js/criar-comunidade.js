// Criar Comunidade - JavaScript
document.addEventListener("DOMContentLoaded", () => {
    // Verificar se o usuário está logado
    if (!verificarUsuarioLogado()) {
        mostrarMensagem('Você precisa estar logado para criar uma comunidade.', 'error');
        setTimeout(() => {
            window.location.href = 'autent.html';
        }, 2000);
        return;
    }

    // Elementos do DOM
    const form = document.getElementById('formCriarComunidade');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('bannerComunidade');
    const bannerPreview = document.getElementById('bannerPreview');
    const previewImage = document.getElementById('previewImage');
    
    // Elementos dos contadores de caracteres
    const nomeInput = document.getElementById('nomeComunidade');
    const descricaoTextarea = document.getElementById('descricaoComunidade');
    const regrasTextarea = document.getElementById('regrasComunidade');

    // Carregar dados do usuário (dinamicamente)
    carregarDadosUsuario();

    // Event listeners
    setupUploadArea();
    setupCharacterCounters();
    setupFormSubmission();

    // Função para verificar se o usuário está logado
    function verificarUsuarioLogado() {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado) {
            return false;
        }
        
        try {
            const userData = JSON.parse(usuarioLogado);
            return userData && userData.id && userData.nome && userData.email;
        } catch (error) {
            console.error('Erro ao verificar usuário logado:', error);
            return false;
        }
    }// Função para carregar dados do usuário
    function carregarDadosUsuario() {
        // Verificar se há usuário logado no localStorage
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        
        if (usuarioLogado) {
            try {
                const userData = JSON.parse(usuarioLogado);
                
                // Preencher elementos do autor com dados reais
                document.getElementById('autorNome').textContent = userData.nome || 'Usuário';
                document.getElementById('autorEmail').textContent = userData.email || 'usuario@exemplo.com';
                
                // Para a foto, verificar se existe e não é vazia
                const fotoUrl = userData.imagem || userData.foto || 'https://placehold.co/80';
                document.getElementById('autorFoto').src = fotoUrl;
                
                console.log('Dados do usuário carregados:', userData);
            } catch (error) {
                console.error('Erro ao parsear dados do usuário:', error);
                carregarDadosUsuarioPadrao();
            }
        } else {
            console.warn('Nenhum usuário logado encontrado');
            carregarDadosUsuarioPadrao();
        }
    }

    // Função para carregar dados padrão quando não há usuário logado
    function carregarDadosUsuarioPadrao() {
        document.getElementById('autorNome').textContent = 'Usuário';
        document.getElementById('autorEmail').textContent = 'usuario@exemplo.com';
        document.getElementById('autorFoto').src = 'https://placehold.co/80';
    }

    // Configurar área de upload
    function setupUploadArea() {
        // Click no upload area
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }    // Manipular seleção de arquivo
    function handleFileSelection(file) {
        // Validar tipo de arquivo
        if (!file.type.match(/image\/(jpeg|png|jpg|gif)/)) {
            mostrarMensagem('Apenas arquivos de imagem (JPEG, PNG, JPG, GIF) são aceitos.', 'error');
            return;
        }

        // Validar tamanho (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            mostrarMensagem('O arquivo deve ter no máximo 5MB.', 'error');
            return;
        }

        // Criar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.onload = () => {
                bannerPreview.style.display = 'block';
                uploadArea.style.display = 'none';
                console.log('Imagem carregada com sucesso:', e.target.result.substring(0, 50) + '...');
            };
        };
        reader.onerror = (error) => {
            console.error('Erro ao ler arquivo:', error);
            mostrarMensagem('Erro ao processar a imagem. Tente novamente.', 'error');
        };
        reader.readAsDataURL(file);
    }

    // Configurar contadores de caracteres
    function setupCharacterCounters() {
        addCharacterCounter(nomeInput, 50);
        addCharacterCounter(descricaoTextarea, 500);
        addCharacterCounter(regrasTextarea, 800);
    }

    // Adicionar contador de caracteres
    function addCharacterCounter(element, maxLength) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        element.parentNode.appendChild(counter);

        const updateCounter = () => {
            const currentLength = element.value.length;
            counter.textContent = `${currentLength}/${maxLength}`;
            
            if (currentLength > maxLength * 0.9) {
                counter.className = 'char-counter danger';
            } else if (currentLength > maxLength * 0.8) {
                counter.className = 'char-counter warning';
            } else {
                counter.className = 'char-counter';
            }
        };

        element.addEventListener('input', updateCounter);
        updateCounter();
    }

    // Configurar submissão do formulário
    function setupFormSubmission() {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            
            // Desabilitar botão e mostrar loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';

            try {
                // Validar formulário
                if (!validarFormulario()) {
                    return;
                }                // Coletar dados do formulário
                const dadosComunidade = coletarDadosFormulario();
                
                // Criar comunidade na API
                await criarComunidadeAPI(dadosComunidade);
                
                // Sucesso
                mostrarMensagem('Comunidade criada com sucesso!', 'success');
                
                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = 'comunidade.html';
                }, 2000);

            } catch (error) {
                console.error('Erro ao criar comunidade:', error);
                mostrarMensagem('Erro ao criar comunidade. Tente novamente.', 'error');
            } finally {
                // Reabilitar botão
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Validar formulário
    function validarFormulario() {
        const nome = nomeInput.value.trim();
        const descricao = descricaoTextarea.value.trim();
        const tipo = document.getElementById('tipoComunidade').value;

        if (!nome) {
            mostrarMensagem('O nome da comunidade é obrigatório.', 'error');
            nomeInput.focus();
            return false;
        }

        if (nome.length < 3) {
            mostrarMensagem('O nome da comunidade deve ter pelo menos 3 caracteres.', 'error');
            nomeInput.focus();
            return false;
        }

        if (!descricao) {
            mostrarMensagem('A descrição da comunidade é obrigatória.', 'error');
            descricaoTextarea.focus();
            return false;
        }

        if (descricao.length < 20) {
            mostrarMensagem('A descrição deve ter pelo menos 20 caracteres.', 'error');
            descricaoTextarea.focus();
            return false;
        }

        if (!tipo) {
            mostrarMensagem('Selecione o tipo da comunidade.', 'error');
            document.getElementById('tipoComunidade').focus();
            return false;
        }

        return true;
    }    // Coletar dados do formulário
    function coletarDadosFormulario() {
        // Obter dados do usuário logado do localStorage
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        let dadosUsuario = {};
        
        if (usuarioLogado) {
            try {
                dadosUsuario = JSON.parse(usuarioLogado);
            } catch (error) {
                console.error('Erro ao parsear dados do usuário:', error);
            }
        }

        // Obter a imagem do banner se foi carregada
        let bannerUrl = "https://placehold.co/1200x300"; // URL padrão
        const previewImage = document.getElementById('previewImage');
        if (previewImage && previewImage.src && !previewImage.src.includes('placehold')) {
            bannerUrl = previewImage.src;
        }

        const dados = {
            nome: nomeInput.value.trim(),
            descricao: descricaoTextarea.value.trim(),
            tipo: document.getElementById('tipoComunidade').value,
            regras: regrasTextarea.value.trim() || "1. Respeite todos os membros\n2. Mantenha o foco no tema da comunidade\n3. Compartilhe conhecimento de forma construtiva",
            banner: bannerUrl,
            autor: {
                id: dadosUsuario.id || 1,
                nome: dadosUsuario.nome || document.getElementById('autorNome').textContent,
                email: dadosUsuario.email || document.getElementById('autorEmail').textContent,
                foto: dadosUsuario.imagem || dadosUsuario.foto || document.getElementById('autorFoto').src
            },
            dataCriacao: new Date().toISOString(),
            status: "ativa",
            membros: [dadosUsuario.id || 1], // Agora é um array de IDs
            curtidas: 0,
            comentarios: [], // Agora é um array de objetos de comentários
            visualizacoes: 0,
            tags: [document.getElementById('tipoComunidade').value, "comunidade"]
        };

        console.log('Dados coletados para criar comunidade:', dados);
        return dados;
    }    // Criar comunidade na API
    async function criarComunidadeAPI(dados) {
        const API_BASE_URL = "http://localhost:3000/api";
        
        try {
            console.log('Enviando dados para API:', dados);
            
            const response = await fetch(`${API_BASE_URL}/comunidades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados)
            });
            
            console.log('Resposta da API:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro da API:', errorText);
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }
            
            const novaComunidade = await response.json();
            console.log('Comunidade criada com sucesso:', novaComunidade);
            
            // Armazenar a comunidade localmente para exibição imediata
            const comunidadesLocais = JSON.parse(localStorage.getItem('comunidadesLocais') || '[]');
            comunidadesLocais.unshift(novaComunidade);
            localStorage.setItem('comunidadesLocais', JSON.stringify(comunidadesLocais));
            
            return novaComunidade;
        } catch (error) {
            console.error('Erro ao criar comunidade:', error);
            
            // Verificar se é erro de conectividade
            if (error.name === 'TypeError' || error.message.includes('fetch')) {
                throw new Error('Erro de conexão. Verifique se o servidor está rodando e sua conexão com a internet.');
            }
            
            throw new Error('Falha ao criar comunidade. Tente novamente em alguns momentos.');
        }
    }

    // Mostrar mensagem
    function mostrarMensagem(texto, tipo) {
        // Remover mensagens existentes
        const mensagensExistentes = document.querySelectorAll('.success-message, .error-message');
        mensagensExistentes.forEach(msg => msg.remove());

        // Criar nova mensagem
        const mensagem = document.createElement('div');
        mensagem.className = tipo === 'success' ? 'success-message' : 'error-message';
        mensagem.textContent = texto;
        mensagem.style.display = 'block';

        // Inserir no início do formulário
        form.insertBefore(mensagem, form.firstChild);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (mensagem.parentNode) {
                mensagem.remove();
            }
        }, 5000);

        // Scroll para o topo
        mensagem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// Função global para remover banner
function removeBanner() {
    const bannerPreview = document.getElementById('bannerPreview');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('bannerComunidade');
    const previewImage = document.getElementById('previewImage');
    
    // Resetar elementos
    bannerPreview.style.display = 'none';
    uploadArea.style.display = 'block';
    fileInput.value = '';
    previewImage.src = '';
    
    console.log('Banner removido com sucesso');
}

// Função global para cancelar criação
function cancelarCriacao() {
    const confirmacao = confirm('Tem certeza que deseja cancelar? Todas as informações inseridas serão perdidas.');
    if (confirmacao) {
        window.history.back();
    }
}
