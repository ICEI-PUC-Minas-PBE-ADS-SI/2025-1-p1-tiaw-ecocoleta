// Função para obter usuário logado
function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}

// Função para buscar dados completos do usuário logado na API
async function buscarUsuarioCompleto(id) {
  const res = await fetch(`http://localhost:3000/api/usuarios/${id}`);
  if (!res.ok) throw new Error("Usuário não encontrado");
  return res.json();
}

// Função para obter histórico de resgates do localStorage
function getHistoricoResgates() {
  return JSON.parse(localStorage.getItem('historicoResgates')) || [];
}

// Função para salvar histórico de resgates no localStorage
function setHistoricoResgates(historico) {
  localStorage.setItem('historicoResgates', JSON.stringify(historico));
}

// Função para adicionar um novo resgate ao histórico
function adicionarResgateAoHistorico(nomeRecompensa, pontosNecessarios) {
  const historico = getHistoricoResgates();
  historico.unshift({
    recompensa: nomeRecompensa,
    pontos: pontosNecessarios,
    data: new Date().toISOString()
  });
  setHistoricoResgates(historico);
}

// Função para exibir o histórico de resgates na tela
function exibirHistoricoResgates() {
  const ul = document.getElementById('historico-resgates');
  if (!ul) return;
  const historico = getHistoricoResgates();
  ul.innerHTML = '';
  if (historico.length === 0) {
    ul.innerHTML = '<li class="recompensas-historico-vazio">Nenhum resgate realizado ainda.</li>';
    return;
  }
  historico.forEach(item => {
    const li = document.createElement('li');
    li.className = 'recompensas-historico-item';
    li.innerHTML = `
      <span class="recompensas-historico-recompensa">${item.recompensa}</span>
      <span class="recompensas-historico-pontos">-${item.pontos} pts</span>
      <span class="recompensas-historico-data">${new Date(item.data).toLocaleString('pt-BR')}</span>
    `;
    ul.appendChild(li);
  });
}

// Atualiza ecopontos ao carregar e exibe histórico
async function atualizarEcopontos() {
  const usuarioLogado = getUsuarioLogado();
  if (!usuarioLogado) return;
  try {
    const usuario = await buscarUsuarioCompleto(usuarioLogado.id);
    document.getElementById("ecopontos-usuario").textContent = usuario.ecopontos || 0;
  } catch (e) {
    document.getElementById("ecopontos-usuario").textContent = "-";
  }
  exibirHistoricoResgates();
}

document.addEventListener("DOMContentLoaded", atualizarEcopontos);

// Função para trocar recompensa e atualizar backend
async function trocarRecompensa(pontosNecessarios, nomeRecompensa, recompensaId) {
  const usuarioLogado = getUsuarioLogado();
  if (!usuarioLogado) return alert("Faça login para resgatar recompensas.");
  let usuario;
  try {
    usuario = await buscarUsuarioCompleto(usuarioLogado.id);
  } catch {
    return alert("Erro ao buscar dados do usuário.");
  }
  if ((usuario.ecopontos || 0) < pontosNecessarios) {
    alert("Você não possui ecopontos suficientes para esta recompensa.");
    return;
  }
  // Chama o endpoint seguro do backend para deduzir ecopontos e decrementar quantidade
  const resposta = await fetch(`http://localhost:3000/api/usuarios/${usuario.id}/resgatar-recompensa`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pontosNecessarios, nomeRecompensa, recompensaId })
  });
  if (!resposta.ok) {
    const erro = await resposta.json();
    alert(erro.error || "Erro ao resgatar recompensa.");
    return;
  }
  const dados = await resposta.json();
  document.getElementById("ecopontos-usuario").textContent = dados.ecopontos;
  adicionarResgateAoHistorico(nomeRecompensa, pontosNecessarios);
  exibirHistoricoResgates();
  // Atualiza quantidade no card
  await renderizarRecompensas();
  alert(`Você resgatou: ${nomeRecompensa}!\nSeus ecopontos agora: ${dados.ecopontos}`);
}

// Função para buscar recompensas do backend
async function buscarRecompensas() {
  const res = await fetch('http://localhost:3000/api/recompensas');
  if (!res.ok) return [];
  return res.json();
}

// Função para renderizar cards de recompensas dinamicamente
async function renderizarRecompensas() {
  const recompensas = await buscarRecompensas();
  const usuarioLogado = getUsuarioLogado();
  const admin = usuarioLogado && usuarioLogado.admin === true;
  const cardsContainer = document.querySelector('.recompensas-cards');
  cardsContainer.innerHTML = '';
  if (!recompensas.length) {
    cardsContainer.innerHTML = '<p>Nenhuma recompensa cadastrada.</p>';
    return;
  }
  recompensas.forEach((r, idx) => {
    const card = document.createElement('div');
    card.className = 'recompensas-card';
    card.innerHTML = `
      <img src="${r.imagem}" alt="${r.nome}" class="recompensas-card-img">
      <div class="recompensas-card-content">
        <h2 class="recompensas-card-title">${r.nome}</h2>
        <p class="recompensas-card-desc">${r.descricao}</p>
        <p class="recompensas-card-points recompensas-verde">${r.pontosNecessarios} pontos</p>
        <p class="recompensas-card-quantidade">Disponível: <span class="quantidade-restante">${r.quantidade || 0}</span></p>
        <button class="recompensas-card-btn" data-idx="${idx}">
          ${r.nome.toLowerCase().includes('doe') ? 'Doar' : 'Resgatar'}
        </button>
        ${admin ? `<button class=\"recompensas-card-btn recompensas-excluir-btn\" data-id=\"${r.id}\" style=\"background:#d32f2f;margin-top:8px;\">Excluir</button>` : ''}
      </div>
    `;
    cardsContainer.appendChild(card);
  });
  // Adiciona eventos aos botões
  document.querySelectorAll('.recompensas-card-btn:not(.recompensas-excluir-btn)').forEach((btn, idx) => {
    btn.addEventListener('click', function () {
      const recompensa = recompensas[idx];
      trocarRecompensa(recompensa.pontosNecessarios, recompensa.nome, recompensa.id);
    });
  });
  // Evento de exclusão para admin
  if (admin) {
    document.querySelectorAll('.recompensas-excluir-btn').forEach(btn => {
      btn.addEventListener('click', async function () {
        if (confirm('Tem certeza que deseja excluir esta recompensa?')) {
          const id = btn.getAttribute('data-id');
          await fetch(`http://localhost:3000/api/recompensas/${id}`, { method: 'DELETE' });
          renderizarRecompensas();
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', renderizarRecompensas);