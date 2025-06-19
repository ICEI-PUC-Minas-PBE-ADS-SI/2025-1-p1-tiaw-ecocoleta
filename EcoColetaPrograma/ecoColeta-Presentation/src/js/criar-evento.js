// Criar Evento - JavaScript
// Lógica de upload/preview/remover imagem refeita seguindo criar-comunidade.js

document.addEventListener("DOMContentLoaded", () => {
    // Verificar se o usuário está logado
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const autorSection = document.getElementById('autorSection');
    if (!usuario) {
        autorSection.innerHTML = '<p style="color:#c00">Você precisa estar logado para criar um evento.</p>';
        document.getElementById('formCriarEvento').querySelector('button[type="submit"]').disabled = true;
        return;
    }
    // Preencher dados do autor
    let fotoAutor = usuario.foto || usuario.imagem;
    if (!fotoAutor || fotoAutor === 'null' || fotoAutor === 'undefined') {
        fotoAutor = 'https://placehold.co/80';
    }
    autorSection.innerHTML = `
        <div class="autor-info">
          <div class="autor-avatar"><img src="${fotoAutor}" alt="Avatar"></div>
          <div class="autor-dados">
            <h3>${usuario.nome}</h3>
            <p>${usuario.email || ''}</p>
          </div>
        </div>
    `;

    // Upload/Preview/Remover imagem (padrão criar-comunidade.js)
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('bannerComunidade');
    const bannerPreview = document.getElementById('bannerPreview');
    const previewImage = document.getElementById('previewImage');

    // Click na área de upload
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
            };
        };
        reader.onerror = (error) => {
            mostrarMensagem('Erro ao processar a imagem. Tente novamente.', 'error');
        };
        reader.readAsDataURL(file);
    }

    // Função global para remover banner (igual criar-comunidade.js)
    window.removeBanner = function() {
        bannerPreview.style.display = 'none';
        uploadArea.style.display = 'block';
        fileInput.value = '';
        previewImage.src = '';
    };

    // Submissão do formulário
    document.getElementById('formCriarEvento').addEventListener('submit', async e => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('.btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
        try {
            // Validação básica
            const titulo = document.getElementById('tituloEvento').value.trim();
            const descricao = document.getElementById('descricaoEvento').value.trim();
            const data = document.getElementById('dataEvento').value;
            const hora = document.getElementById('horaEvento').value;
            if (!titulo || !descricao || !data || !hora) {
                mostrarMensagem('Preencha todos os campos obrigatórios.', 'error');
                return;
            }
            // Validação de data e hora
            const agora = new Date();
            const dataHoraEvento = new Date(`${data}T${hora}`);
            if (dataHoraEvento < agora) {
                mostrarMensagem('Não é possível criar um evento com data ou horário no passado.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                return;
            }
            // Obter imagem
            let imagem = '';
            if (previewImage && previewImage.src && !previewImage.src.includes('placehold')) {
                imagem = previewImage.src;
            }
            // Montar objeto evento
            const evento = {
                titulo,
                descricao,
                data,
                hora,
                imagem,
                autor: {
                    nome: usuario.nome,
                    email: usuario.email,
                    foto: usuario.foto || usuario.imagem || 'https://placehold.co/80'
                }
            };
            // Enviar para API
            const API_BASE_URL = 'https://two025-1-p1-tiaw-ecocoleta.onrender.com/api';
            const response = await fetch(`${API_BASE_URL}/eventos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(evento)
            });
            if (!response.ok) throw new Error('Erro ao criar evento');
            mostrarMensagem('Evento criado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'comunidade.html';
            }, 1500);
        } catch (err) {
            mostrarMensagem('Erro ao criar evento. Tente novamente.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // Mensagem de feedback
    function mostrarMensagem(texto, tipo) {
        // Remove mensagens existentes
        const mensagensExistentes = document.querySelectorAll('.success-message, .error-message');
        mensagensExistentes.forEach(msg => msg.remove());
        // Cria nova mensagem
        const mensagem = document.createElement('div');
        mensagem.className = tipo === 'success' ? 'success-message' : 'error-message';
        mensagem.textContent = texto;
        mensagem.style.display = 'block';
        // Insere no início do formulário
        document.getElementById('formCriarEvento').insertBefore(mensagem, document.getElementById('formCriarEvento').firstChild);
        // Auto-remove após 5s
        setTimeout(() => {
            if (mensagem.parentNode) mensagem.remove();
        }, 5000);
        mensagem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
