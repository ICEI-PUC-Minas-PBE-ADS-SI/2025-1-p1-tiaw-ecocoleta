// detalhe-comunidade.js
// Página de detalhe de comunidade: busca dados, renderiza, controla participação e comentários

const API_BASE_URL = "https://two025-1-p1-tiaw-ecocoleta.onrender.com/api";

// Utilitário para pegar query string
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Utilitário para autenticação simulada
function getUsuarioLogado() {
    return JSON.parse(localStorage.getItem("usuarioLogado"));
}

// Busca comunidade por ID
async function fetchComunidade(id) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${id}`);
    if (!res.ok) throw new Error("Comunidade não encontrada");
    return res.json();
}

// Busca comentários da comunidade (direto do campo comentarios do objeto comunidade)
async function fetchComentarios(comunidadeId) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`);
    if (!res.ok) return [];
    const comunidade = await res.json();
    // Garante array
    return Array.isArray(comunidade.comentarios) ? comunidade.comentarios : [];
}

// Publica novo comentário ou resposta (atualiza o array de comentarios da comunidade)
async function postarComentario(comunidadeId, texto, usuario, parentId = null) {
    // Busca comunidade atual
    const res = await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`);
    if (!res.ok) return null;
    const comunidade = await res.json();
    let comentarios = Array.isArray(comunidade.comentarios) ? comunidade.comentarios : [];
    // Gera novo comentário
    const novoComentario = {
        id: Date.now(),
        texto,
        autorId: usuario.id,
        autorNome: usuario.nome,
        autorFoto: usuario.imagem || "assets/img/avatarCaique.jpg",
        data: new Date().toISOString(),
        parentId: parentId || null
    };
    // Se for resposta, insere como filho
    if (parentId) {
        function inserirResposta(lista) {
            for (let c of lista) {
                if (c.id == parentId) {
                    c.respostas = c.respostas || [];
                    c.respostas.push(novoComentario);
                    return true;
                }
                if (c.respostas && inserirResposta(c.respostas)) return true;
            }
            return false;
        }
        inserirResposta(comentarios);
    } else {
        comentarios.push(novoComentario);
    }
    // Atualiza comunidade
    await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentarios })
    });
    return novoComentario;
}

// Exclui comentário (remove do array e atualiza comunidade)
async function excluirComentario(comunidadeId, comentarioId, autorId) {
    // Busca comunidade
    const res = await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`);
    if (!res.ok) return;
    const comunidade = await res.json();
    let comentarios = Array.isArray(comunidade.comentarios) ? comunidade.comentarios : [];
    // Remove comentário (recursivo)
    function remover(lista) {
        return lista.filter(c => {
            if (c.id == comentarioId && c.autorId == autorId) return false;
            if (c.respostas) c.respostas = remover(c.respostas);
            return true;
        });
    }
    comentarios = remover(comentarios);
    await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentarios })
    });
}

// Verifica se usuário é membro
function usuarioParticipa(comunidade, usuario) {
    if (!usuario || !Array.isArray(comunidade.membros)) return false;
    return comunidade.membros.includes(usuario.id);
}

// Participar/Sair da comunidade (usando array de membros e PATCH padrão do json-server)
async function toggleParticipacao(comunidade, usuario, participando) {
    if (!usuario) return;
    // Atualiza membros localmente
    let membros = Array.isArray(comunidade.membros) ? [...comunidade.membros] : [];
    if (participando) {
        // Sair: remove usuário
        membros = membros.filter(id => id !== usuario.id);
    } else {
        // Entrar: adiciona usuário
        if (!membros.includes(usuario.id)) membros.push(usuario.id);
    }
    // PATCH padrão para json-server
    await fetch(`${API_BASE_URL}/comunidades/${comunidade.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membros })
    });
    // Atualiza objeto local
    comunidade.membros = membros;
}

// Renderiza dados da comunidade
function renderComunidade(comunidade, participando) {
    document.getElementById("comunidade-img").src = comunidade.banner || "assets/img/recycle.svg";
    document.getElementById("comunidade-nome").textContent = comunidade.nome;
    document.getElementById("comunidade-descricao").textContent = comunidade.descricao;
    // Exibir número de membros corretamente
    document.getElementById("comunidade-membros-count").textContent = Array.isArray(comunidade.membros) ? comunidade.membros.length : 0;
    // Regras
    const regrasList = document.getElementById("comunidade-regras-list");
    regrasList.innerHTML = "";
    if (comunidade.regras) {
        comunidade.regras.split(/[\n\r]+|[.;]/).forEach(r => {
            if (r.trim()) regrasList.innerHTML += `<li>${r.trim()}</li>`;
        });
    }
    // Botão participar
    const btn = document.getElementById("btn-participar");
    btn.textContent = participando ? "Sair da Comunidade" : "Participar";
    btn.classList.toggle("participando", participando);
}

// Busca usuário por ID (imagem atualizada)
async function buscarUsuarioPorId(id) {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`);
    if (!res.ok) return null;
    return res.json();
}

// Renderiza comentários aninhados
async function renderComentarios(comentarios, usuario, comunidadeId, nivel = 0, participando = false) {
    const list = nivel === 0 ? document.getElementById("comentarios-list") : document.createElement("div");
    if (nivel === 0) list.innerHTML = "";
    if (!comentarios.length && nivel === 0) {
        list.innerHTML = '<div class="comentario vazio">Nenhum comentário ainda.</div>';
        return;
    }
    for (const c of comentarios) {
        const podeExcluir = usuario && c.autorId === usuario.id;
        // Busca imagem atualizada do autor
        let autorFoto = c.autorFoto;
        let autorNome = c.autorNome;
        try {
            const autor = await buscarUsuarioPorId(c.autorId);
            if (autor) {
                autorFoto = autor.imagem || autor.foto || autorFoto;
                autorNome = autor.nome || autorNome;
            }
        } catch {}
        const comentarioDiv = document.createElement("div");
        comentarioDiv.className = "comentario" + (nivel > 0 ? " comentario-resposta" : "");
        comentarioDiv.innerHTML = `
            <div class="comentario-autor">
                <img src="${autorFoto}" alt="${autorNome}" style="width:28px;height:28px;border-radius:50%;margin-right:8px;vertical-align:middle;"> ${autorNome}
            </div>
            <div class="comentario-texto">${c.texto}</div>
            <div class="comentario-footer">
                <span>${new Date(c.data).toLocaleString('pt-BR')}</span>
                ${participando ? `<button class="btn-responder-comentario" data-id="${c.id}">Responder</button>` : ""}
                ${podeExcluir ? `<button class="btn-excluir-comentario" data-id="${c.id}">Excluir</button>` : ""}
            </div>
        `;
        // Respostas aninhadas
        if (c.respostas && c.respostas.length) {
            const respostasDiv = await renderComentarios(c.respostas, usuario, comunidadeId, nivel + 1, participando);
            comentarioDiv.appendChild(respostasDiv);
        }
        list.appendChild(comentarioDiv);
    }
    if (nivel === 0) {
        // Handler de exclusão
        list.querySelectorAll(".btn-excluir-comentario").forEach(btn => {
            btn.onclick = async () => {
                const usuario = getUsuarioLogado();
                await excluirComentario(comunidadeId, btn.dataset.id, usuario.id);
                carregarComentarios();
            };
        });
        // Handler de resposta
        if (participando) {
            list.querySelectorAll(".btn-responder-comentario").forEach(btn => {
                btn.onclick = function () {
                    const parentDiv = btn.closest('.comentario');
                    let form = parentDiv.querySelector('.form-resposta');
                    if (form) { form.remove(); return; }
                    form = document.createElement('div');
                    form.className = 'form-resposta';
                    form.innerHTML = `
                        <textarea class="input-resposta" placeholder="Responder..."></textarea>
                        <button class="btn-enviar-resposta">Enviar</button>
                    `;
                    parentDiv.appendChild(form);
                    const textarea = form.querySelector('.input-resposta');
                    const enviarBtn = form.querySelector('.btn-enviar-resposta');
                    enviarBtn.onclick = async () => {
                        const texto = textarea.value.trim();
                        if (!texto) return;
                        if (contemPalavraOfensiva(texto)) {
                            mostrarErroComentario('Comentário não publicado: sua mensagem contém palavras ofensivas.');
                            return;
                        }
                        enviarBtn.disabled = true;
                        const usuario = getUsuarioLogado();
                        await postarComentario(comunidadeId, texto, usuario, btn.dataset.id);
                        carregarComentarios();
                    };
                    // Permite enviar resposta com Enter
                    textarea.addEventListener('keydown', async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            enviarBtn.click();
                        }
                    });
                };
            });
        }
    }
    return list;
}

// Carrega e renderiza comentários
async function carregarComentarios() {
    const comunidadeId = getQueryParam("id");
    const usuario = getUsuarioLogado();
    const comunidade = await fetchComunidade(comunidadeId);
    const participando = usuarioParticipa(comunidade, usuario);
    const comentarios = await fetchComentarios(comunidadeId);
    await renderComentarios(comentarios, usuario, comunidadeId, 0, participando);
}

// Handler de comentário
function setupComentarioForm(comunidadeId, participando) {
    const usuario = getUsuarioLogado();
    const form = document.getElementById("comentario-form-container");
    if (!usuario || !participando) {
        form.style.display = "none";
        return;
    }
    form.style.display = "flex";
    const input = document.getElementById("comentario-input");
    const btn = document.getElementById("btn-comentar");
    btn.onclick = async () => {
        const texto = input.value.trim();
        if (!texto) return;
        if (contemPalavraOfensiva(texto)) {
            mostrarErroComentario('Comentário não publicado: sua mensagem contém palavras ofensivas.');
            return;
        }
        btn.disabled = true;
        await postarComentario(comunidadeId, texto, usuario);
        input.value = "";
        btn.disabled = false;
        carregarComentarios();
    };
    // Permite enviar comentário com Enter
    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            btn.click();
        }
    });
}

// Handler de participação
function setupParticiparBtn(comunidade, participando) {
    const usuario = getUsuarioLogado();
    const btn = document.getElementById("btn-participar");
    const membrosCount = document.getElementById("comunidade-membros-count");
    let feedback = document.getElementById("participacao-feedback");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.id = "participacao-feedback";
        feedback.style.marginTop = "10px";
        btn.parentNode.insertBefore(feedback, btn.nextSibling);
    }
    // Se o usuário for o autor, exibe apenas o botão de exclusão
    if (usuario && comunidade.autor && usuario.id === comunidade.autor.id) {
        btn.style.display = "none";
        mostrarBotaoExcluirComunidade(comunidade);
        return;
    } else {
        removerBotaoExcluirComunidade();
        btn.style.display = "";
    }
    btn.onclick = async () => {
        if (!usuario || !usuario.id) {
            feedback.textContent = "Você precisa estar logado para participar da comunidade.";
            feedback.style.color = "#c00";
            btn.disabled = false;
            return;
        }
        btn.disabled = true;
        try {
            await toggleParticipacao(comunidade, usuario, participando);
            if (participando) {
                comunidade.membros = comunidade.membros.filter(id => id !== usuario.id);
            } else {
                if (!comunidade.membros.includes(usuario.id)) comunidade.membros.push(usuario.id);
            }
            const novoParticipando = !participando;
            btn.textContent = novoParticipando ? "Sair da Comunidade" : "Participar";
            btn.classList.toggle("participando", novoParticipando);
            membrosCount.textContent = comunidade.membros.length;
            feedback.textContent = novoParticipando ? "Você agora é membro da comunidade!" : "Você saiu da comunidade.";
            feedback.style.color = novoParticipando ? "#080" : "#c00";
            setupParticiparBtn(comunidade, novoParticipando);
            setupComentarioForm(comunidade.id, novoParticipando);
            await carregarComentarios(); // Atualiza comentários para refletir o novo status de participação
        } catch (e) {
            feedback.textContent = "Erro ao atualizar participação. Tente novamente.";
            feedback.style.color = "#c00";
            console.error(e);
        }
        btn.disabled = false;
    };
}

// Exibe botão de exclusão apenas para o dono
function mostrarBotaoExcluirComunidade(comunidade) {
    let btnExcluir = document.getElementById("btn-excluir-comunidade");
    const btnParticipar = document.getElementById("btn-participar");
    if (!btnExcluir && btnParticipar) {
        btnExcluir = document.createElement("button");
        btnExcluir.id = "btn-excluir-comunidade";
        btnExcluir.textContent = "Excluir Comunidade";
        btnExcluir.className = "btn btn-danger btn-participar participando";
        btnExcluir.style.marginTop = "16px";
        btnParticipar.parentNode.insertBefore(btnExcluir, btnParticipar.nextSibling);
    }
    if (btnExcluir) {
        btnExcluir.onclick = async () => {
            if (confirm("Tem certeza que deseja excluir esta comunidade? Esta ação não pode ser desfeita.")) {
                await fetch(`${API_BASE_URL}/comunidades/${comunidade.id}`, { method: "DELETE" });
                alert("Comunidade excluída com sucesso!");
                window.location.href = "comunidade.html";
            }
        };
    }
}
function removerBotaoExcluirComunidade() {
    const btnExcluir = document.getElementById("btn-excluir-comunidade");
    if (btnExcluir) btnExcluir.remove();
}

// Lista de palavras ofensivas (pode ser expandida conforme necessário)
const PALAVRAS_OFENSIVAS = ['abestado', 'animal', 'anta', 'arrombada', 'arrombado', 'asno', 'babaca', 'besta', 'bicha', 'boceta', 'boçal', 'boquete', 'bosta', 'buceta', 'burra', 'burro', 'cabaço', 'cachorra', 'cachorro', 'cadela', 'cacete', 'cafajeste', 'canalha', 'caralho', 'chifrudo', 'corno', 'cretina', 'cretino', 'crápula', 'cu', 'cuzão', 'cuzona', 'débil', 'demente', 'desgraçada', 'desgraçado', 'égua', 'energúmeno', 'escrota', 'escroto', 'estrupício', 'estúpida', 'estúpido', 'fdp', 'foder', 'gentalha', 'idiota', 'ignorante', 'imbecil', 'imundo', 'lazarenta', 'lazarento', 'lesma', 'merda', 'mocorongo', 'mongol', 'nojenta', 'nojento', 'ordinária', 'ordinário', 'otária', 'otário', 'palhaço', 'parasita', 'paspalho', 'patife', 'pau', 'peste', 'pilantra', 'pinto', 'piranha', 'porco', 'porra', 'pqp', 'prostituta', 'punheta', 'puta', 'puto', 'rameira', 'retardada', 'retardado', 'rola', 'safada', 'safado', 'seboso', 'siririca', 'sórdido', 'tarada', 'tarado', 'tnc', 'traste', 'trapaceiro', 'trouxa', 'vaca', 'vagabunda', 'vagabundo', 'veado', 'verme', 'viado', 'vsf', 'xoxota'];

function contemPalavraOfensiva(texto) {
  const textoNormalizado = texto.toLowerCase();
  return PALAVRAS_OFENSIVAS.some(palavra => textoNormalizado.includes(palavra));
}

// Mensagem de erro ao publicar comentário
function mostrarErroComentario(msg) {
  const erroDiv = document.getElementById('comentario-erro');
  if (erroDiv) {
    erroDiv.textContent = msg;
    erroDiv.style.display = 'block';
    setTimeout(() => { erroDiv.style.display = 'none'; }, 4000);
  }
}

// Inicialização
window.addEventListener("DOMContentLoaded", async () => {
    const comunidadeId = getQueryParam("id");
    if (!comunidadeId) {
        alert("Comunidade não encontrada.");
        window.location.href = "comunidade.html";
        return;
    }
    let comunidade;
    try {
        comunidade = await fetchComunidade(comunidadeId);
    } catch {
        alert("Comunidade não encontrada.");
        window.location.href = "comunidade.html";
        return;
    }
    const usuario = getUsuarioLogado();
    // Verifica participação corretamente
    const participando = usuarioParticipa(comunidade, usuario);
    renderComunidade(comunidade, participando);
    setupParticiparBtn(comunidade, participando);
    setupComentarioForm(comunidadeId, participando);
    carregarComentarios();
});
