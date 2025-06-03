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

// Função para exibir histórico de pontos
function exibirHistoricoEcopontos(historico) {
  const historicoDiv = document.getElementById("historico-ecopontos");
  if (!historicoDiv) return;
  if (!historico || historico.length === 0) {
    historicoDiv.innerHTML = '<p class="recompensas-historico-vazio">Nenhum ponto gasto ainda.</p>';
    return;
  }
  historicoDiv.innerHTML = historico.map(item => `
    <div class="recompensas-historico-item">
      <span class="recompensas-historico-recompensa">${item.recompensa}</span>
      <span class="recompensas-historico-pontos">-${item.pontos} pts</span>
      <span class="recompensas-historico-data">${new Date(item.data).toLocaleString('pt-BR')}</span>
    </div>
  `).join("");
}

// Atualiza ecopontos e histórico ao carregar
async function atualizarEcopontosEHistorico() {
  const usuarioLogado = getUsuarioLogado();
  if (!usuarioLogado) return;
  try {
    const usuario = await buscarUsuarioCompleto(usuarioLogado.id);
    document.getElementById("ecopontos-usuario").textContent = usuario.ecopontos || 0;
    exibirHistoricoEcopontos(usuario.historicoEcopontos || []);
  } catch (e) {
    document.getElementById("ecopontos-usuario").textContent = "-";
    exibirHistoricoEcopontos([]);
  }
}

document.addEventListener("DOMContentLoaded", atualizarEcopontosEHistorico);

// Ao trocar recompensa, registrar no histórico e atualizar backend
async function trocarRecompensa(pontosNecessarios, nomeRecompensa) {
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
  // Reduz ecopontos do usuário
  usuario.ecopontos = (usuario.ecopontos || 0) - pontosNecessarios;
  usuario.historicoEcopontos = usuario.historicoEcopontos || [];
  usuario.historicoEcopontos.unshift({
    recompensa: nomeRecompensa,
    pontos: pontosNecessarios,
    data: new Date().toISOString()
  });
  // Atualiza no backend
  await fetch(`http://localhost:3000/api/usuarios/${usuario.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ecopontos: usuario.ecopontos,
      historicoEcopontos: usuario.historicoEcopontos
    })
  });
  // Atualiza imediatamente o valor exibido dos ecopontos
  document.getElementById("ecopontos-usuario").textContent = usuario.ecopontos;
  atualizarEcopontosEHistorico();
  alert(`Você resgatou: ${nomeRecompensa}!\nSeus ecopontos agora: ${usuario.ecopontos}`);
}

// Atualiza evento dos botões para usar a nova função
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".recompensas-card-btn").forEach((btn, idx) => {
    btn.addEventListener("click", function () {
      const recompensas = [
        { nome: "Kit Sustentável", pontos: 500 },
        { nome: "Vale Desconto", pontos: 1000 },
        { nome: "Doe Pontos", pontos: 200 }
      ];
      const recompensa = recompensas[idx];
      trocarRecompensa(recompensa.pontos, recompensa.nome);
    });
  });
});