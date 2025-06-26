// Variáveis globais
let pontosDeColetaData = [];
let marcadores = [];
let filtrosAtivos = new Set();

// Inicializa o mapa
var map = L.map("map").setView([-19.9677, -44.1986], 13); // Betim/MG

// Camada de mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Ícone personalizado
var iconeColeta = L.icon({
  iconUrl: "./assets/img/icone-coleta.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Função para limpar todos os marcadores do mapa
function limparMarcadores() {
  marcadores.forEach((marcador) => map.removeLayer(marcador));
  marcadores = [];
}

// Função para mostrar um ponto no painel lateral
function mostrarPontoNoPainel(ponto) {
  document.querySelector(".info-panel h2").textContent = ponto.nome;

  const infoContent = document.querySelector(".info-content");
  // Remove qualquer formulário de agendamento existente
  const formExistente = infoContent.querySelector(".formulario-agendamento");
  if (formExistente) {
    formExistente.remove();
  }

  infoContent.innerHTML = `
        <div class="info-ponto">
            <div class="endereco">
                <i class="icon-location"></i>
                <span>${ponto.endereco}</span>
            </div>
            <div class="horario">
                <i class="icon-clock"></i>
                <span>${ponto.horario}</span>
            </div>
            <div class="materiais">
                <h3>Materiais aceitos:</h3>
                <div class="tags">
                    ${ponto.materiaisAceitos
                      .map(
                        (material) => `
                        <span class="tag-${material.toLowerCase()}">${
                          material.charAt(0).toUpperCase() + material.slice(1)
                        }</span>
                    `
                      )
                      .join("")}
                </div>
            </div>
            <div class="contato">
                <i class="icon-phone"></i>
                <span>${ponto.contato}</span>
            </div>
            <button class="btn-agendar" data-id="${ponto.id}">Agendar</button>
        </div>
    `;

  // Adiciona o event listener ao botão Agendar
  const btnAgendar = infoContent.querySelector(".btn-agendar");
  if (btnAgendar) {
    btnAgendar.addEventListener("click", () =>
      abrirFormularioAgendamento(ponto.id)
    );
  }
}

// Função para filtrar pontos
function filtrarPontos(termo = "", filtros = []) {
  limparMarcadores();

  const pontosFiltrados = pontosDeColetaData.filter((ponto) => {
    // Verifica se o ponto atende aos filtros de material
    const atendeAosFiltros =
      filtros.length === 0 ||
      filtros.every((filtro) => ponto.materiaisAceitos.includes(filtro));

    // Verifica se o ponto corresponde ao termo de busca
    const termoBusca = termo.toLowerCase();
    const correspondeABusca =
      termo === "" ||
      ponto.nome.toLowerCase().includes(termoBusca) ||
      ponto.endereco.toLowerCase().includes(termoBusca);

    return atendeAosFiltros && correspondeABusca;
  });

  // Adiciona os pontos filtrados ao mapa
  pontosFiltrados.forEach((ponto) => {
    const marker = L.marker([ponto.lat, ponto.lng], { icon: iconeColeta })
      .addTo(map)
      .on("click", () => mostrarPontoNoPainel(ponto));

    marcadores.push(marker);
  });

  // Ajusta o zoom do mapa para mostrar todos os pontos
  if (marcadores.length > 0) {
    const grupo = new L.featureGroup(marcadores);
    map.fitBounds(grupo.getBounds().pad(0.1));
  }
}

// Configuração da URL base do servidor
const API_BASE_URL = "http://localhost:3000/api";

// Atualizar a função de carregamento inicial
document.addEventListener("DOMContentLoaded", () => {
  // Corrige: seleciona a área de filtros
  const areaFiltros = document.querySelector(".area-filtros");
  // Carregar dados do json-server
  fetch(`${API_BASE_URL}/pontosDeColeta`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      pontosDeColetaData = Array.isArray(data) ? data : [];
      filtrarPontos(); // Mostra todos os pontos inicialmente
    })
    .catch((error) => {
      console.error("Erro ao carregar pontos de coleta:", error);
      mostrarAlertPersonalizado(
        "Erro de Conexão",
        "Não foi possível carregar os pontos de coleta.\n\nVerifique se:\n• Sua conexão com a internet está funcionando\n• O servidor está executando na porta 3000\n• Não há bloqueios de firewall",
        "error"
      );
    });

  // Configurar busca
  const inputBusca = document.querySelector(".input-busca input");
  const btnBuscar = document.querySelector(".button-buscar");

  inputBusca.addEventListener("input", (e) => {
    filtrarPontos(e.target.value, Array.from(filtrosAtivos));
  });

  btnBuscar.addEventListener("click", () => {
    filtrarPontos(inputBusca.value, Array.from(filtrosAtivos));
  });

  // Substitui o select por um botão para abrir o modal
  areaFiltros.innerHTML = "";
  const btnMaisFiltros = document.createElement("button");
  btnMaisFiltros.className = "filtro-select";
  btnMaisFiltros.type = "button";
  btnMaisFiltros.textContent = "Mais filtros...";
  btnMaisFiltros.style.minWidth = "160px";
  areaFiltros.appendChild(btnMaisFiltros);

  // Lista de filtros disponíveis
  const filtrosDisponiveis = [
    {
      nome: "Plástico",
      valor: "plastico",
      icone: "../../assets/img/plastico.svg",
    },
    { nome: "Papel", valor: "papel", icone: "../../assets/img/papel.svg" },
    { nome: "Vidro", valor: "vidro", icone: "../../assets/img/vidro.svg" },
    { nome: "Pilhas", valor: "pilhas", icone: "../../assets/img/pilha.svg" },
    {
      nome: "Eletrônicos",
      valor: "eletronicos",
      icone: "../../assets/img/eletronicos.svg",
    },
    {
      nome: "Baterias",
      valor: "baterias",
      icone: "../../assets/img/bateria.svg",
    },
    { nome: "Óleo", valor: "oleo", icone: "../../assets/img/oleo.svg" },
    { nome: "Metal", valor: "metal", icone: "../../assets/img/metal.svg" },
  ];

  // Função para abrir o modal de filtros
  function abrirModalFiltros() {
    if (document.querySelector(".filtros-modal-overlay")) return;
    const overlay = document.createElement("div");
    overlay.className = "filtros-modal-overlay";
    overlay.innerHTML = `
      <div class="filtros-modal">
        <button class="filtros-modal-fechar" title="Fechar">&times;</button>
        <h2>Escolha os filtros</h2>
        <div class="filtros-modal-botoes"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    const botoesContainer = overlay.querySelector(".filtros-modal-botoes");
    filtrosDisponiveis.forEach((filtro) => {
      const btn = document.createElement("button");
      btn.className =
        "filtro-modal-btn" + (filtrosAtivos.has(filtro.valor) ? " ativo" : "");
      btn.type = "button";
      btn.innerHTML = `<i class=\"filtro-icon\" style=\"mask-image:url('assets/img/${filtro.icone}');-webkit-mask-image:url('assets/img/${filtro.icone}');\"></i> ${filtro.nome}`;
      btn.onclick = () => {
        if (filtrosAtivos.has(filtro.valor)) {
          filtrosAtivos.delete(filtro.valor);
          btn.classList.remove("ativo");
          // Remove botão ativo da área de filtros
          const btnAtivo = document.querySelector(
            `.filtro-button.filtro-${filtro.valor}`
          );
          if (btnAtivo) btnAtivo.remove();
        } else {
          filtrosAtivos.add(filtro.valor);
          btn.classList.add("ativo");
          // Cria botão ativo na área de filtros
          if (
            !document.querySelector(`.filtro-button.filtro-${filtro.valor}`)
          ) {
            const btnFiltro = document.createElement("button");
            btnFiltro.className = `filtro-button filtro-${filtro.valor} ativo`;
            btnFiltro.type = "button";
            btnFiltro.innerHTML = `<i class=\"filtro-icon\" style=\"mask-image:url('assets/img/${filtro.icone}');-webkit-mask-image:url('assets/img/${filtro.icone}');\"></i> <span>${filtro.nome}</span>`;
            btnFiltro.onclick = () => {
              filtrosAtivos.delete(filtro.valor);
              btnFiltro.remove();
              btn.classList.remove("ativo");
              filtrarPontos(inputBusca.value, Array.from(filtrosAtivos));
            };
            areaFiltros.insertBefore(btnFiltro, btnMaisFiltros);
          }
        }
        filtrarPontos(inputBusca.value, Array.from(filtrosAtivos));
      };
      botoesContainer.appendChild(btn);
    });
    // Fechar modal
    overlay.querySelector(".filtros-modal-fechar").onclick = () =>
      overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
  }
  btnMaisFiltros.onclick = abrirModalFiltros;
});

// Funções de validação
const validacoes = {
  nome: (valor) => {
    return valor.length >= 3 ? "" : "O nome deve ter pelo menos 3 caracteres";
  },
  email: (valor) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(valor) ? "" : "Digite um email válido";
  },
  telefone: (valor) => {
    const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return telefoneRegex.test(valor)
      ? ""
      : "Digite um telefone válido: (99) 99999-9999";
  },
  materiais: (valor) => {
    return valor.length > 0 ? "" : "Selecione pelo menos um material";
  },
  data: (valor) => {
    if (!valor) return "Selecione uma data";
    const hoje = new Date();
    const dataSelecionada = new Date(valor);
    hoje.setHours(0,0,0,0);
    if (dataSelecionada < hoje) return "A data não pode ser no passado";
    return "";
  },
};

// Máscara para telefone
function mascaraTelefone(evento) {
  let valor = evento.target.value.replace(/\D/g, "");
  if (valor.length > 11) valor = valor.slice(0, 11);
  if (valor.length > 10) {
    valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (valor.length > 6) {
    valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else if (valor.length > 2) {
    valor = valor.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  } else {
    valor = valor.replace(/(\d{0,2})/, "($1");
  }
  evento.target.value = valor.trim();
}

// Aplica a máscara ao digitar
document.addEventListener("input", function(e) {
  if (e.target && e.target.name === "telefone") {
    mascaraTelefone(e);
  }
});

// Validação em tempo real
function validarCampo(input) {
  let valor = input.value;
  const tipo = input.name;
  if (tipo === "telefone") {
    // Aplica a máscara antes de validar
    let temp = document.createElement('input');
    temp.value = valor;
    mascaraTelefone({ target: temp });
    valor = temp.value;
    input.value = valor;
  }
  const mensagemErro = validacoes[tipo](valor);

  let feedbackElement = input.nextElementSibling;
  if (!feedbackElement || !feedbackElement.classList.contains("feedback-mensagem")) {
    const novoFeedback = document.createElement("div");
    novoFeedback.classList.add("feedback-mensagem");
    input.parentNode.insertBefore(novoFeedback, input.nextSibling);
    feedbackElement = novoFeedback; // Usa o novo elemento criado
  }

  if (mensagemErro) {
    input.classList.remove("input-valido");
    input.classList.add("input-invalido");
    feedbackElement.textContent = mensagemErro;
    feedbackElement.style.color = "#f44336";
    return false;
  } else {
    input.classList.remove("input-invalido");
    input.classList.add("input-valido");
    feedbackElement.textContent = "Campo válido";
    feedbackElement.style.color = "#4CAF50";
    return true;
  }
}

// Gerenciamento de horários
function gerarHorarios() {
  const horariosContainer = document.getElementById("horarios-container");
  const dataAgendamento = document.getElementById("data").value;
  const hoje = new Date();
  const dataEscolhida = new Date(dataAgendamento);

  // Limpa os horários existentes
  horariosContainer.innerHTML = "";

  // Adiciona a legenda
  const legenda = document.createElement("div");
  legenda.classList.add("legenda-horarios");
  legenda.innerHTML = `
        <span class="horario_disponivel_exemplo">● Disponível</span>
        <span class="horario_indisponivel_exemplo">● Indisponível</span>
        <span class="horario_selecionado_exemplo">● Selecionado</span>
    `;
  horariosContainer.appendChild(legenda);

  // Cria o grid de horários
  const horariosGrid = document.createElement("div");
  horariosGrid.classList.add("horarios-grid");

  // Horários de funcionamento (8h às 17h)
  for (let hora = 8; hora <= 17; hora++) {
    const horarioDiv = document.createElement("div");
    const horarioTexto = `${hora}:00`;
    const horarioData = new Date(dataEscolhida);
    horarioData.setHours(hora, 0, 0);

    horarioDiv.textContent = horarioTexto;
    horarioDiv.classList.add("horario-option");

    // Verifica se o horário já passou
    if (horarioData < hoje) {
      horarioDiv.classList.add("horario-indisponivel");
      horarioDiv.innerHTML += '<span class="indicador-passado">✕</span>';
    } else {
      // Aqui você pode adicionar lógica para verificar horários já agendados
      const disponivel = true; // Exemplo: verificar com backend

      if (disponivel) {
        horarioDiv.classList.add("horario-disponivel");
        horarioDiv.onclick = () => selecionarHorario(horarioDiv, horarioTexto);
      } else {
        horarioDiv.classList.add("horario-indisponivel");
        horarioDiv.innerHTML += '<span class="indicador-agendado">●</span>';
      }
    }

    horariosGrid.appendChild(horarioDiv);
  }

  horariosContainer.appendChild(horariosGrid);
}

function selecionarHorario(elemento, horario) {
  const horarioInput = document.getElementById("horario");
  const todosHorarios = document.querySelectorAll(".horario-option");

  todosHorarios.forEach((h) => h.classList.remove("horario-selecionado"));
  elemento.classList.add("horario-selecionado");
  if (horarioInput) {
    horarioInput.value = horario;
    console.log('Horário selecionado:', horarioInput.value); // DEBUG
  }
}

// Função para abrir o formulário de agendamento
function abrirFormularioAgendamento(idPonto) {
  console.log('abrirFormularioAgendamento chamado', idPonto); // DEBUG
  const ponto = pontosDeColetaData.find((p) => p.id === idPonto);
  if (!ponto) return;
  const infoContent = document.querySelector(".info-content");
  // Remove formulário anterior se existir
  const formExistente = infoContent.querySelector(".formulario-agendamento");
  if (formExistente) formExistente.remove();

  // Adiciona o formulário de agendamento
  const formHtml = `
      <form class="formulario-agendamento">
        <h3>Agendar coleta em ${ponto.nome}</h3>
        <div class="form-group">
          <label for="nome">Nome completo</label>
          <input type="text" id="nome" name="nome" required />
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input type="email" id="email" name="email" required readonly />
        </div>
        <div class="form-group">
          <label for="telefone">Telefone</label>
          <input type="text" id="telefone" name="telefone" required />
        </div>
        <div class="form-group">
          <label>Produtos para coleta</label>
          <div class="produtos-lista"></div>
          <input type="hidden" name="materiais" id="materiaisSelecionados" />
        </div>
        <div class="form-group">
          <label for="data">Data</label>
          <input type="date" id="data" name="data" required min="${
            new Date().toISOString().split("T")[0]
          }" />
        </div>
        <div class="form-group">
          <label>Horário</label>
          <input type="hidden" id="horario" name="horario" />
          <div id="horarios-container"></div>
        </div>
        <button type="submit" class="btn-agendar">Confirmar Agendamento</button>
      </form>
    `;
  infoContent.innerHTML = formHtml;
  const formAgendamento = infoContent.querySelector(".formulario-agendamento");
  console.log('Form criado!', formAgendamento); // DEBUG

  // Pré-preencher formulário com dados do usuário logado
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  if (usuarioLogado.nome) {
    formAgendamento.querySelector("#nome").value = usuarioLogado.nome;
  }
  if (usuarioLogado.email) {
    formAgendamento.querySelector("#email").value = usuarioLogado.email;
  }
  if (usuarioLogado.telefone) {
    formAgendamento.querySelector("#telefone").value = usuarioLogado.telefone;
  }

  // Produtos: seleção dos materiais aceitos pelo ponto
  const produtosLista = formAgendamento.querySelector(".produtos-lista");
  const inputMateriais = formAgendamento.querySelector("#materiaisSelecionados");
  produtosLista.innerHTML = "";
  const materiaisAceitos = ponto.materiaisAceitos || [];
  function nomeAmigavel(material) {
    const nomes = {
      plastico: "Plástico",
      papel: "Papel",
      vidro: "Vidro",
      pilhas: "Pilhas",
      eletronicos: "Eletrônicos",
      baterias: "Baterias",
      oleo: "Óleo",
      metal: "Metal",
    };
    return nomes[material?.toLowerCase?.()] || material;
  }
  const preselecaoDiv = document.createElement("div");
  preselecaoDiv.className = "preselecao-produtos";
  materiaisAceitos.forEach((material) => {
    if (!material) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preselecao-produto-btn";
    btn.textContent = nomeAmigavel(material);
    btn.onclick = function () {
      btn.classList.toggle("selecionado");
      atualizarProdutosHidden();
    };
    preselecaoDiv.appendChild(btn);
  });
  produtosLista.appendChild(preselecaoDiv);

  function atualizarProdutosHidden() {
    if (!preselecaoDiv) return;
    const selecionados = Array.from(
      preselecaoDiv.querySelectorAll(".preselecao-produto-btn.selecionado")
    ).map((btn) => btn.textContent);
    inputMateriais.value = selecionados.join(",");
  }

  // Garante que o input de data chama gerarHorarios ao mudar
  const inputData = formAgendamento.querySelector('#data');
  if (inputData) {
    inputData.addEventListener('change', gerarHorarios);
  }

  // Garante que o input hidden de horário está limpo ao abrir
  const inputHorario = formAgendamento.querySelector('#horario');
  if (inputHorario) inputHorario.value = '';

  // Chama gerarHorarios ao abrir o modal
  gerarHorarios();

  // Lista de campos obrigatórios para validação
  const camposParaValidar = ["nome", "email", "telefone", "data"];

  // Adiciona o event listener de submit IMEDIATAMENTE após inserir o form
  formAgendamento.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log('Submit interceptado!'); // DEBUG
    let formValido = true;
    camposParaValidar.forEach((campo) => {
      const input = formAgendamento.querySelector(`#${campo}`);
      if (!input) return;
      if (!validarCampo(input)) {
        formValido = false;
      }
    });
    if (!inputMateriais.value || inputMateriais.value.split(",").filter((p) => p.trim() !== "").length === 0) {
      formValido = false;
      mostrarAlertPersonalizado("Atenção", "Selecione pelo menos um material para coleta", "warning");
      return;
    }
    const horario = formAgendamento.querySelector("#horario").value;
    if (!horario) {
      formValido = false;
      mostrarAlertPersonalizado("Atenção", "Selecione um horário para a coleta", "warning");
      return;
    }
    if (formValido) {
      // Verificar se o usuário está logado
      const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
      
      if (!usuarioLogado.email) {
        mostrarAlertPersonalizado("Login Necessário", "Você precisa estar logado para fazer um agendamento.", "error", () => {
          window.location.href = 'autent.html';
        });
        return;
      }
      
      // Monta objeto de agendamento conforme esperado pela API
      const agendamento = {
        pontoColetaId: idPonto,
        doadorEmail: usuarioLogado.email, // Usar email do usuário logado
        dataAgendamento: formAgendamento.querySelector("#data").value,
        horarioAgendamento: formAgendamento.querySelector("#horario").value,
        tipoMaterial: inputMateriais.value.split(",").map(m => m.trim()).join(", "),
        observacoes: `Nome: ${formAgendamento.querySelector("#nome").value}, Telefone: ${formAgendamento.querySelector("#telefone").value}`
      };
      
      console.log("Enviando agendamento:", agendamento); // DEBUG
      
      try {
        // Usar EcoColetaService para criar o agendamento
        const data = await EcoColetaService.agendamentos.criar(agendamento);
        
        console.log('Agendamento salvo:', data); // DEBUG
        
        // Exibir mensagem de sucesso com detalhes
        const dataFormatada = new Date(formAgendamento.querySelector("#data").value).toLocaleDateString('pt-BR');
        const horarioFormatado = formAgendamento.querySelector("#horario").value;
        const materiais = inputMateriais.value;
        
        mostrarAlertPersonalizado(
          "Agendamento Confirmado!", 
          `Seu agendamento foi realizado com sucesso!\n\n📅 Data: ${dataFormatada}\n⏰ Horário: ${horarioFormatado}\n📦 Materiais: ${materiais}\n📍 Local: ${ponto.nome}\n\nVocê receberá uma confirmação em breve.`,
          "success",
          () => {
            // Limpar o formulário
            formAgendamento.reset();
            // Fechar o formulário e voltar aos detalhes do ponto
            mostrarPontoNoPainel(ponto);
          }
        );
        
      } catch (err) {
        console.error("Erro ao salvar agendamento:", err);
        mostrarAlertPersonalizado("Erro", `Não foi possível salvar o agendamento: ${err.message}\n\nPor favor, tente novamente.`, "error");
      }
    }
  });
}

// Função para criar e exibir modal personalizado
function mostrarAlertPersonalizado(titulo, mensagem, tipo = 'info', callback = null) {
  // Remove modal existente se houver
  const modalExistente = document.getElementById('modal-alert-personalizado');
  if (modalExistente) {
    modalExistente.remove();
  }

  // Define ícones e cores para cada tipo
  const tiposConfig = {
    success: {
      icon: '✅',
      color: '#4CAF50',
      backgroundColor: '#E8F5E8',
      borderColor: '#4CAF50'
    },
    error: {
      icon: '❌',
      color: '#F44336',
      backgroundColor: '#FFEBEE',
      borderColor: '#F44336'
    },
    warning: {
      icon: '⚠️',
      color: '#FF9800',
      backgroundColor: '#FFF3E0',
      borderColor: '#FF9800'
    },
    info: {
      icon: 'ℹ️',
      color: '#2196F3',
      backgroundColor: '#E3F2FD',
      borderColor: '#2196F3'
    }
  };

  const config = tiposConfig[tipo] || tiposConfig.info;

  // Criar estrutura do modal
  const modalHtml = `
    <div 
      id="modal-alert-personalizado" 
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6));
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
        animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      "
    >
      <div 
        class="modal-content"
        style="
          background: white;
          border-radius: 16px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-top: 5px solid ${config.borderColor};
          position: relative;
        "
      >
        <!-- Header com gradiente -->
        <div 
          style="
            background: linear-gradient(135deg, ${config.backgroundColor}, ${config.backgroundColor}f0);
            padding: 24px 28px 20px;
            border-radius: 11px 11px 0 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            position: relative;
            overflow: hidden;
          "
        >
          <!-- Decoração de fundo -->
          <div style="
            position: absolute;
            top: -50%;
            right: -30%;
            width: 100px;
            height: 100px;
            background: ${config.color}20;
            border-radius: 50%;
            transform: scale(2);
          "></div>
          
          <div style="display: flex; align-items: center; gap: 16px; position: relative;">
            <div style="
              font-size: 32px;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
              animation: bounce 0.6s ease-out 0.2s both;
            ">${config.icon}</div>
            <h3 
              style="
                margin: 0;
                color: ${config.color};
                font-size: 22px;
                font-weight: 700;
                font-family: 'Poppins', sans-serif;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
              "
            >
              ${titulo}
            </h3>
          </div>
        </div>

        <!-- Conteúdo -->
        <div style="padding: 28px;">
          <p 
            style="
              margin: 0 0 28px 0;
              color: #2c3e50;
              font-size: 16px;
              line-height: 1.6;
              font-family: 'Poppins', sans-serif;
              white-space: pre-line;
              font-weight: 400;
            "
          >
            ${mensagem}
          </p>

          <!-- Botões -->
          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button 
              id="btn-fechar-modal"
              style="
                background: linear-gradient(135deg, ${config.color}, ${config.color}dd);
                color: white;
                border: none;
                padding: 14px 28px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: 'Poppins', sans-serif;
                box-shadow: 0 4px 12px ${config.color}40;
                position: relative;
                overflow: hidden;
              "
              onmouseover="
                this.style.transform='translateY(-2px) scale(1.02)';
                this.style.boxShadow='0 6px 20px ${config.color}50';
              "
              onmouseout="
                this.style.transform='translateY(0) scale(1)';
                this.style.boxShadow='0 4px 12px ${config.color}40';
              "
              onmousedown="this.style.transform='translateY(0) scale(0.98)'"
              onmouseup="this.style.transform='translateY(-2px) scale(1.02)'"
            >
              <span style="position: relative; z-index: 1;">
                ${tipo === 'success' ? '✨ Continuar' : tipo === 'error' ? '🔄 Tentar Novamente' : 'Entendi'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from { 
          opacity: 0;
        }
        to { 
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(40px) scale(0.9);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0,0,0) scale(1);
        }
        40%, 43% {
          transform: translate3d(0,-8px,0) scale(1.1);
        }
        70% {
          transform: translate3d(0,-4px,0) scale(1.05);
        }
        90% {
          transform: translate3d(0,-1px,0) scale(1.02);
        }
      }

      @media (max-width: 480px) {
        .modal-content {
          width: 95% !important;
          margin: 20px !important;
        }
      }
    </style>
  `;

  // Adicionar modal ao body
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Event listeners
  const modal = document.getElementById('modal-alert-personalizado');
  const btnFechar = document.getElementById('btn-fechar-modal');

  function fecharModal() {
    const modalElement = document.getElementById('modal-alert-personalizado');
    const modalContent = modalElement.querySelector('.modal-content');
    
    // Animação de saída
    modalElement.style.animation = 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    modalContent.style.animation = 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
      modalElement.remove();
      if (callback && typeof callback === 'function') {
        callback();
      }
    }, 300);
  }

  // Fechar ao clicar no botão
  btnFechar.addEventListener('click', fecharModal);

  // Fechar ao clicar fora do modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      fecharModal();
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('modal-alert-personalizado')) {
      fecharModal();
    }
  });

  // Adicionar animações de saída
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeOut {
      from { 
        opacity: 1;
      }
      to { 
        opacity: 0;
      }
    }

    @keyframes slideDown {
      from { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
    }
  `;
  document.head.appendChild(style);
}

console.log('Script carregado!');
