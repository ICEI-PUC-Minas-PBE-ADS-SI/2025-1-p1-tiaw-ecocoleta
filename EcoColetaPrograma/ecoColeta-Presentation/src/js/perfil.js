// perfil.js - Gerencia o perfil do usuário logado na EcoColeta
// Busca dados do usuário, permite edição, atualização e logout
// Adapte a URL do JSON Server conforme necessário

const API_BASE_URL = "https://two025-1-p1-tiaw-ecocoleta.onrender.com/api";

const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) {
  window.location.href = "autent.html";
}

// Elementos do DOM
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const form = document.querySelector(".profile-form");
const editarBtn = document.querySelector(".btn-primary");
const salvarBtn = document.querySelector(".btn-secondary");
const logoutBtn = document.getElementById("logoutBtn");
const imagemInput = document.createElement("input");
imagemInput.type = "file";
imagemInput.accept = "image/*";
imagemInput.style.display = "none";
document.body.appendChild(imagemInput);
const imagemPreview = document.getElementById("perfilImagemPreview");

// Avatares pré-definidos
const defaultAvatars = [
  "assets/img/AvatarArthurzin.jpg",
  "assets/img/avatarCaique.jpg",
  "assets/img/AvatarThiagão.jpg",
  "assets/img/AvatarScrollMaster.jpg",
  "assets/img/Avatarfenomeno.jpg",
  "assets/img/AvatarMatheus.jpg",
  "assets/img/AvatarKauan.jpg"
];

// Função para mostrar feedback visual
function showFeedback(element, message, type = "success") {
  const formGroup = element.closest(".form-group");
  formGroup.classList.remove("success", "error");
  formGroup.classList.add(type);

  let feedback = formGroup.querySelector(".feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "feedback";
    formGroup.appendChild(feedback);
  }

  feedback.textContent = message;

  setTimeout(() => {
    formGroup.classList.remove(type);
    feedback.textContent = "";
  }, 3000);
}

// Função para validar formulário
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll("input[required], textarea[required]");

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      showFeedback(input, "Este campo é obrigatório", "error");
      isValid = false;
    }
  });

  return isValid;
}
// Função para mostrar loading
function showLoading(element) {
  element.classList.add("loading");
}
function hideLoading(element) {
  element.classList.remove("loading");
}
// Função para alternar entre as tabs com animação
function switchTab(tabName) {
  const content = document.querySelector(".tab-content");
  content.style.opacity = "0";

  setTimeout(() => {
    // Remove classe active de todas as tabs
    tabButtons.forEach((button) => {
      button.classList.remove("active");
      if (button.textContent.toLowerCase().includes(tabName.toLowerCase())) {
        button.classList.add("active");
      }
    });

    // Atualiza o conteúdo da tab
    content.innerHTML = "";    switch (tabName.toLowerCase()) {      case "configurações da conta":
      case "Configurações da Conta":
        content.innerHTML = `
          <form class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Primeiro Nome</label>
                <input type="text" class="form-input" name="perfilNomeFirst" value="${
                  usuarioLogado.nome?.split(" ")[0] || ""
                }" />
              </div>
              <div class="form-group">
                <label class="form-label">Segundo nome</label>
                <input type="text" class="form-input" name="perfilNomeLast" value="${
                  usuarioLogado.nome?.split(" ").slice(1).join(" ") || ""
                }" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" name="perfilEmail" value="${
                  usuarioLogado.email || ""
                }" />
              </div>
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input type="text" class="form-input" name="perfilTelefone" value="${
                  usuarioLogado.telefone || ""
                }" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-textarea" name="perfilBio">${
                usuarioLogado.bio || ""
              }</textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar configurações</button>
            </div>
          </form>
        `;
        break;      case "securança":  
      case "segurança":
        content.innerHTML = `
          <form class="profile-form">
            <div class="form-group">
              <label class="form-label">Senha Atual</label>
              <input type="password" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Nova Senha</label>
              <input type="password" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar Nova Senha</label>
              <input type="password" class="form-input" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Alterar Senha</button>
            </div>
          </form>
        `;
        break;      case "notificações":
      case "Notificações":
        content.innerHTML = `
          <form class="profile-form">
            <div class="form-group">
              <label class="form-label">Notificações por Email</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" ${
                    usuarioLogado.notificacoes?.email ? "checked" : ""
                  } />
                  Receber atualizações por email
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" ${
                    usuarioLogado.notificacoes?.marketing ? "checked" : ""
                  } />
                  Receber ofertas e promoções
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Notificações Push</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" ${
                    usuarioLogado.notificacoes?.push ? "checked" : ""
                  } />
                  Ativar notificações push
                </label>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Preferências</button>
            </div>
          </form>
        `;
        break;      case "pagamento":
      case "Pagamento":
        content.innerHTML = `
          <form class="profile-form payment-form">
            <div class="form-group">
              <label class="form-label">Escolha a forma de pagamento</label>
              <div class="payment-methods">
                <div class="payment-method">
                  <input type="radio" name="paymentType" id="credit" value="credit" checked />
                  <label for="credit">Cartão de Crédito</label>
                </div>
                <div class="payment-method">
                  <input type="radio" name="paymentType" id="pix" value="pix" />
                  <label for="pix">PIX</label>
                </div>
              </div>
            </div>
            <div class="form-group credit-fields">
              <label class="form-label">Número do Cartão</label>
              <input type="text" class="form-input" name="cardNumber" placeholder="0000 0000 0000 0000" maxlength="19" required />
              <label class="form-label">Nome impresso no cartão</label>
              <input type="text" class="form-input" name="cardName" placeholder="Nome completo" required />
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Validade</label>
                  <input type="text" class="form-input" name="cardExpiry" placeholder="MM/AA" maxlength="5" required />
                </div>
                <div class="form-group">
                  <label class="form-label">CVV</label>
                  <input type="text" class="form-input" name="cardCvv" placeholder="123" maxlength="4" required />
                </div>
              </div>
            </div>
            <div class="form-group pix-fields" style="display:none;">
              <label class="form-label">Pagamento via PIX</label>
              <div class="pix-amounts" style="display:flex; gap:1rem; justify-content:center; margin-bottom:1rem;">
                <button type="button" class="btn btn-pix-amount" data-valor="10">R$ 10,00</button>
                <button type="button" class="btn btn-pix-amount" data-valor="15">R$ 15,00</button>
                <button type="button" class="btn btn-pix-amount" data-valor="20">R$ 20,00</button>
                <button type="button" class="btn btn-pix-amount" data-valor="40">R$ 40,00</button>
              </div>
              <div id="pix-qrcode" style="margin: 1rem 0;"></div>
              <div class="pix-key-info">
                <span>Chave PIX: <b id="pix-key"></b></span>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Método</button>
            </div>
          </form>
        `;
        // Script para alternar campos e gerar QR Code
        setTimeout(() => {
          const paymentForm = document.querySelector(".payment-form");
          const creditFields = paymentForm.querySelector(".credit-fields");
          const pixFields = paymentForm.querySelector(".pix-fields");
          const radioCredit = paymentForm.querySelector("#credit");
          const radioPix = paymentForm.querySelector("#pix");
          const pixKey = paymentForm.querySelector("#pix-key");
          const pixQrDiv = paymentForm.querySelector("#pix-qrcode");
          const pixAmountBtns = paymentForm.querySelectorAll(".btn-pix-amount");

          // Chaves PIX
          const PIX_LINK_10 = "../../assets/img/papel.svg";
          const PIX_LINK_15 = "../../assets/img/papel.svg";
          const PIX_LINK_20 = "../../assets/img/papel.svg";
          const PIX_LINK_40 = "../../assets/img/papel.svg";
          const PIX_KEY_VALUE = "02275388621";

          // Valor padrão
          let valorPix = 10;

          function updatePixKeyAndQr(valor) {
            let link = PIX_LINK_10;
            if (valor === 15) link = PIX_LINK_15;
            else if (valor === 20) link = PIX_LINK_20;
            else if (valor === 40) link = PIX_LINK_40;
            pixKey.innerHTML = `<a href='${link}' target='_blank' style='color:#0369a1;text-decoration:underline;'>Clique para pagar via Nubank</a>`;
            gerarPixQrCode(link, pixQrDiv, true);
          }

          function showCredit() {
            creditFields.style.display = "";
            pixFields.style.display = "none";
          }
          function showPix() {
            creditFields.style.display = "none";
            pixFields.style.display = "";
            updatePixKeyAndQr(valorPix);
          }
          radioCredit.addEventListener("change", showCredit);
          radioPix.addEventListener("change", showPix);
          if (radioCredit.checked) showCredit();
          if (radioPix.checked) showPix();

          // Botões de valor PIX
          pixAmountBtns.forEach((btn) => {
            btn.addEventListener("click", function () {
              valorPix = parseInt(this.getAttribute("data-valor"));
              updatePixKeyAndQr(valorPix);
              pixAmountBtns.forEach((b) => b.classList.remove("active"));
              this.classList.add("active");
            });
          });
          // Ativa o botão de R$10 por padrão
          if (pixAmountBtns[0]) pixAmountBtns[0].classList.add("active");

          // Máscara simples para cartão
          paymentForm.cardNumber.addEventListener("input", function (e) {
            let v = e.target.value.replace(/\D/g, "").slice(0, 16);
            v = v.replace(/(\d{4})(?=\d)/g, "$1 ");
            e.target.value = v;
          });
          paymentForm.cardExpiry.addEventListener("input", function (e) {
            let v = e.target.value.replace(/\D/g, "").slice(0, 4);
            if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
            e.target.value = v;
          });
        }, 100);
        break;
    }

    content.style.opacity = "1";
  }, 200);
}

// Event Listeners
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.textContent);
  });
});


// Event Listeners melhorados
document.addEventListener("DOMContentLoaded", async () => {
  // Inicializa as informações de perfil e só depois inicializa o modal de avatar
  await preencherPerfil();

  // Inicializa modal de avatar com dados atualizados
  initAvatarModal();

  // Carrega a primeira tab por padrão
  switchTab("Configurações da Conta");

  // Adiciona tooltips
  document.querySelectorAll("[data-tooltip]").forEach((element) => {
    element.addEventListener("mouseenter", () => {
      const tooltip = element.getAttribute("data-tooltip");
      element.setAttribute("title", tooltip);
    });
  });

  // Troca nome da aba de Atividade para Doações recentes
  tabButtons.forEach((btn) => {
    if (btn.textContent.toLowerCase().includes("atividade")) {
      btn.textContent = "Doações recentes";
    }
  });

  // Troca título da seção
  const activityTitle = document.querySelector(".activity-title");
  if (activityTitle) activityTitle.textContent = "Doações recentes";

  // Exibe doações recentes ao carregar
  exibirDoacoesRecentes();
});

// Event Listeners para formulários melhorados
document.addEventListener("submit", async (e) => {
  if (e.target.classList.contains("profile-form") && !e.target.classList.contains("payment-form")) {
    e.preventDefault();

    if (!validateForm(e.target)) {
      return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    showLoading(submitButton);

    try {
      const form = e.target;
      const dados = {};

      // Captura os valores diretamente de cada campo
      // Tratamento de nome - junta primeiro e segundo nome
      const firstName = form.elements.namedItem("perfilNomeFirst") ? form.elements.namedItem("perfilNomeFirst").value : "";
      const lastName = form.elements.namedItem("perfilNomeLast") ? form.elements.namedItem("perfilNomeLast").value : "";
      
      if (firstName || lastName) {
        dados.nome = `${firstName} ${lastName}`.trim();
      }
      
      // Email
      if (form.elements.namedItem("perfilEmail")) {
        dados.email = form.elements.namedItem("perfilEmail").value;
      }
      
      // Telefone
      if (form.elements.namedItem("perfilTelefone")) {
        dados.telefone = form.elements.namedItem("perfilTelefone").value;
      }
      
      // Bio
      if (form.elements.namedItem("perfilBio")) {
        dados.bio = form.elements.namedItem("perfilBio").value;
      }
      
      await salvarAlteracoes(dados);
      showFeedback(submitButton, "Alterações salvas com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      showFeedback(submitButton, "Erro ao salvar alterações", "error");
    } finally {
      hideLoading(submitButton);
    }
  }
});

// Função para salvar alterações com feedback
async function salvarAlteracoes(dados) {
  // Optimistic update for localStorage, but primary source of truth will be server response
  // const usuarioAtualizadoTemporariamente = { ...usuarioLogado, ...dados };
  // localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizadoTemporariamente));

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioLogado.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados), // Envia apenas os dados alterados
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${await response.text()}`);
    }

    const dataServidor = await response.json();
    
    // Atualiza o localStorage com os dados retornados do servidor
    localStorage.setItem("usuarioLogado", JSON.stringify(dataServidor));
    // Atualiza a variável global usuarioLogado também
    Object.assign(usuarioLogado, dataServidor); // Garante que a variável global está sincronizada
    
    // Atualiza a imagem de perfil na barra lateral se ela foi alterada através deste formulário
    // (Normalmente, a imagem é alterada pelo modal, mas para consistência)
    if (dados.imagem && document.getElementById('perfilImagemPreview')) {
      document.getElementById('perfilImagemPreview').src = dataServidor.imagem;
    }
     if (dados.imagem && document.querySelector(".profile-avatar")) {
      document.querySelector(".profile-avatar").src = dataServidor.imagem;
    }

    // Atualiza o nome na barra lateral se foi alterado
    if (dados.nome && document.querySelector(".profile-name")) {
        document.querySelector(".profile-name").textContent = dataServidor.nome;
    }

    return dataServidor; // Retorna os dados atualizados do servidor
  } catch (error) {
    console.error("Erro ao salvar alterações no servidor:", error);
    // Em caso de erro, idealmente, reverteria a UI para o estado de `usuarioLogado`
    // ou informaria o usuário de forma mais clara.
    // Por agora, o localStorage já reflete o estado antes da tentativa ou o estado otimista.
    // Para garantir consistência com o servidor, podemos recarregar os dados do localStorage (que deve ser o último estado válido conhecido)
    // ou, se a falha for crítica, forçar um refresh dos dados do servidor na UI.
    // Re-setting from usuarioLogado (que não foi modificado se o PATCH falhou antes de Object.assign)
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado)); 
    preencherPerfil(); // Repopula a UI com os dados consistentes
    throw error; // Re-throw para que o chamador (submit listener) possa tratar
  }
}

// Função para preencher o formulário com os dados do usuário
async function preencherPerfil() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/usuarios/${usuarioLogado.id}`
    );
    const usuario = await response.json();
    
    // Atualiza os dados do usuário logado com os dados mais recentes do servidor
    Object.assign(usuarioLogado, usuario);
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
    
    // Atualize os elementos da interface
    // Atualizar informações do perfil
    const profileName = document.querySelector(".profile-name");
    const profileEmailElement = document.querySelector(".info-item:nth-child(1) .info-text");
    const profileTelefoneElement = document.querySelector(".info-item:nth-child(2) .info-text");
    const profileEnderecoElement = document.querySelector(".info-item:nth-child(3) .info-text");
    const profileRole = document.querySelector(".profile-role");
    
    if (profileName) {
      profileName.textContent = usuario.nome || "Usuário";
    }
    
    if (profileEmailElement) {
      profileEmailElement.textContent = usuario.email || "";
    }
    
    if (profileTelefoneElement) {
      profileTelefoneElement.textContent = usuario.telefone || "";
    }
    
    if (profileEnderecoElement) {
      // Formatação do endereço completo
      const cidade = usuario.cidade || "";
      const estado = usuario.estado || "";
      const endereco = usuario.endereco || "";
      
      const enderecoCompleto = endereco ? 
        (cidade && estado ? `${endereco}, ${cidade} - ${estado}` : endereco) : 
        (cidade && estado ? `${cidade} - ${estado}` : "");
      
      profileEnderecoElement.textContent = enderecoCompleto || "";
    }

    // Atualiza tipo de usuário
    if (profileRole) {
      // Formatar o tipo de usuário corretamente
      let tipoFormatado = usuario.tipoUsuario || "";
      if (tipoFormatado.toLowerCase() === "doador") {
        tipoFormatado = "Doador";
      } else if (tipoFormatado.toLowerCase() === "coletor") {
        tipoFormatado = "Coletor";
      } else if (tipoFormatado.toLowerCase() === "admin") {
        tipoFormatado = "Administrador";
      }
      profileRole.textContent = tipoFormatado;
    }
    
    // Se o formulário atual existir e tiver os campos necessários
    if (form) {
      // Verifica nome completo e o separa em primeiro e segundo nome
      if (usuario.nome) {
        const nomePartes = usuario.nome.split(" ");
        const primeiroNome = nomePartes[0] || "";
        const segundoNome = nomePartes.slice(1).join(" ") || "";
        
        if (form.elements.namedItem("perfilNomeFirst")) {
          form.elements.namedItem("perfilNomeFirst").value = primeiroNome;
        }
        
        if (form.elements.namedItem("perfilNomeLast")) {
          form.elements.namedItem("perfilNomeLast").value = segundoNome;
        }
      }
      
      // Preenche outros campos básicos
      if (form.elements.namedItem("perfilEmail")) {
        form.elements.namedItem("perfilEmail").value = usuario.email || "";
      }
      
      if (form.elements.namedItem("perfilTelefone")) {
        form.elements.namedItem("perfilTelefone").value = usuario.telefone || "";
      }
      
      if (form.elements.namedItem("perfilBio")) {
        form.elements.namedItem("perfilBio").value = usuario.bio || "";
      }
      
      // Verifica se há uma estrutura de endereço
      if (usuario.endereco && typeof usuario.endereco === 'object') {
        if (form.elements.namedItem("perfilRua")) form.elements.namedItem("perfilRua").value = usuario.endereco.rua || "";
        if (form.elements.namedItem("perfilNumero")) form.elements.namedItem("perfilNumero").value = usuario.endereco.numero || "";
        if (form.elements.namedItem("perfilBairro")) form.elements.namedItem("perfilBairro").value = usuario.endereco.bairro || "";
        if (form.elements.namedItem("perfilCidade")) form.elements.namedItem("perfilCidade").value = usuario.endereco.cidade || "";
        if (form.elements.namedItem("perfilEstado")) form.elements.namedItem("perfilEstado").value = usuario.endereco.estado || "";
        if (form.elements.namedItem("perfilCep")) form.elements.namedItem("perfilCep").value = usuario.endereco.cep || "";
      }
      
      // Preferências, verifica se o array preferencias existe
      if (usuario.preferencias && Array.isArray(usuario.preferencias)) {
        if (form.elements.namedItem("prefNewsletter")) 
          form.elements.namedItem("prefNewsletter").checked = usuario.preferencias.includes("newsletter");
        if (form.elements.namedItem("prefNotificacoes")) 
          form.elements.namedItem("prefNotificacoes").checked = usuario.preferencias.includes("notificacoes");
        if (form.elements.namedItem("prefTemaEscuro")) 
          form.elements.namedItem("prefTemaEscuro").checked = usuario.preferencias.includes("temas-escuros");
      }
    }
    
    // Atualiza avatar/imagem
    const profileAvatar = document.querySelector(".profile-avatar");
    if (profileAvatar) {
      if (usuario.imagem && usuario.imagem !== "") {
        profileAvatar.src = usuario.imagem;
      } else {
        // Usa um avatar padrão se não houver imagem
        profileAvatar.src = defaultAvatars[0];
      }
    }
    
    // Imagem preview (se existir)
    if (imagemPreview) {
      if (usuario.imagem) {
        imagemPreview.src = usuario.imagem;
        imagemPreview.style.display = "block";
      } else {
        imagemPreview.style.display = "none";
      }
    }
    
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}

// Torna os campos editáveis
function habilitarEdicao() {
  form
    .querySelectorAll("input, textarea")
    .forEach((input) => (input.disabled = false));
  imagemInput.style.display = "block";
  // Exibe o botão de salvar e cancelar, esconde o editar
  const btnEditar = form.querySelector(".btn-primary");
  const btnSalvar = form.querySelector('button[type="submit"]');
  const btnCancelar = form.querySelector(".btn-secondary");
  if (btnEditar) btnEditar.style.display = "none";
  if (btnSalvar) btnSalvar.style.display = "inline-block";
  if (btnCancelar) btnCancelar.style.display = "inline-block";
}

// Torna os campos não editáveis
function desabilitarEdicao() {
  form
    .querySelectorAll("input, textarea")
    .forEach((input) => (input.disabled = true));
  imagemInput.style.display = "none";
  // Exibe o editar, esconde salvar/cancelar
  const btnEditar = form.querySelector(".btn-primary");
  const btnSalvar = form.querySelector('button[type="submit"]');
  const btnCancelar = form.querySelector(".btn-secondary");
  if (btnEditar) btnEditar.style.display = "inline-block";
  if (btnSalvar) btnSalvar.style.display = "none";
  if (btnCancelar) btnCancelar.style.display = "none";
}

// Evento para editar perfil
if (editarBtn) {
  editarBtn.addEventListener("click", function (e) {
    e.preventDefault();
    habilitarEdicao();
  });
}

// Evento para cancelar edição
form.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-secondary")) {
    e.preventDefault();
    desabilitarEdicao();
    preencherPerfil(); // Restaura dados originais
  }
});

// Preview da imagem com feedback
imagemInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      showFeedback(imagemInput, "A imagem deve ter no máximo 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      imagemPreview.src = evt.target.result;
      imagemPreview.style.display = "block";
      showFeedback(imagemInput, "Imagem carregada com sucesso!", "success");
    };
    reader.readAsDataURL(file);
  }
});

// Editar perfil
editarBtn.addEventListener("click", habilitarEdicao);

// Salvar alterações
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  // Coleta preferências
  const preferencias = [];
  if (form.prefNewsletter.checked) preferencias.push("newsletter");
  if (form.prefNotificacoes.checked) preferencias.push("notificacoes");
  if (form.prefTemaEscuro.checked) preferencias.push("temas-escuros");
  // Monta objeto atualizado
  const usuarioAtualizado = {
    nome: form.perfilNome.value,
    email: form.perfilEmail.value,
    endereco: {
      rua: form.perfilRua.value,
      numero: form.perfilNumero.value,
      bairro: form.perfilBairro.value,
      cidade: form.perfilCidade.value,
      estado: form.perfilEstado.value,
      cep: form.perfilCep.value,
    },
    preferencias: preferencias,
    imagem: imagemPreview.src !== "#" ? imagemPreview.src : "",
  };
  try {
    const response = await fetch(
      `${API_BASE_URL}/usuarios/${usuarioLogado.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioAtualizado),
      }
    );
    if (response.ok) {
      alert("Perfil atualizado com sucesso!");
      desabilitarEdicao();
    } else {
      alert("Erro ao atualizar perfil.");
    }
  } catch (err) {
    alert("Erro de conexão com o servidor.");
  }
});

// Logout com confirmação
logoutBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (confirm("Tem certeza que deseja sair?")) {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "autent.html";
  }
});

// Função utilitária para registrar doação
function registrarDoacao(tipo, valor, detalhes) {
  const usuarioId = usuarioLogado.id;
  const key = `doacoesRecentes_${usuarioId}`;
  const doacoes = JSON.parse(localStorage.getItem(key)) || [];
  doacoes.unshift({
    tipo,
    valor,
    detalhes,
    data: new Date().toISOString(),
  });
  localStorage.setItem(key, JSON.stringify(doacoes.slice(0, 10)));
}

// Função para exibir doações recentes
function exibirDoacoesRecentes() {
  const usuarioId = usuarioLogado.id;
  const key = `doacoesRecentes_${usuarioId}`;
  const doacoes = JSON.parse(localStorage.getItem(key)) || [];
  const container = document.querySelector(".activity-items");
  if (!container) return;
  // Limpa todas as atividades antigas
  container.innerHTML = "";
  if (doacoes.length === 0) {
    container.innerHTML =
      '<div class="activity-item"><div class="activity-details"><div class="activity-text">Nenhuma doação registrada ainda.</div></div></div>';
    return;
  }
  doacoes.forEach((doacao) => {
    const data = new Date(doacao.data);
    const dataFormatada =
      data.toLocaleDateString("pt-BR") +
      " " +
      data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    container.innerHTML += `
      <div class="activity-item">
        <div class="activity-icon ${
          doacao.tipo === "PIX" ? "pix-icon" : "credit-icon"
        }">
          <i class="fas fa-donate"></i>
        </div>
        <div class="activity-details">
          <div class="activity-text">${
            doacao.tipo === "PIX" ? "Doação via PIX" : "Doação via Cartão"
          } - R$ ${Number(doacao.valor).toFixed(2)}</div>
          <div class="activity-time">${dataFormatada}</div>
        </div>
      </div>
    `;
  });
}

// DEBUG: Popular doações recentes para Matheus Augusto
(function popularDoacoesFicticias() {
  if (usuarioLogado && usuarioLogado.nome && usuarioLogado.nome.includes('Matheus')) {
    const usuarioId = usuarioLogado.id;
    const key = `doacoesRecentes_${usuarioId}`;
    const agora = new Date();
    const valores = [10, 15, 20, 40, 25, 30, 50, 60, 5, 100];
    const tipos = ['PIX', 'Cartão'];
    const doacoes = valores.map((valor, i) => ({
      tipo: tipos[i % 2],
      valor,
      detalhes: tipos[i % 2] === 'PIX' ? { link: '../../assets/img/papel.svg",e5dcf8947ec9' } : { numero: '**** **** **** 1234', nome: 'Matheus Augusto', validade: '12/25', cvv: '123' },
      data: new Date(agora.getTime() - i * 86400000).toISOString() // dias anteriores
    }));
    localStorage.setItem(key, JSON.stringify(doacoes));
  }
})();

// Ajusta nome da aba e título para 'Doações recentes'
document.addEventListener("DOMContentLoaded", () => {
  // Troca nome da aba
  tabButtons.forEach((btn) => {
    if (btn.textContent.toLowerCase().includes("atividade")) {
      btn.textContent = "Doações recentes";
    }
  });
  // Troca título da seção
  const activityTitle = document.querySelector(".activity-title");
  if (activityTitle) activityTitle.textContent = "Doações recentes";
  // Exibe doações recentes ao carregar
  exibirDoacoesRecentes();
});

// Intercepta o submit do método de pagamento
document.addEventListener("submit", async (e) => {
  if (e.target.classList.contains("payment-form")) {
    e.preventDefault();
    const form = e.target;
    const tipo = form.paymentType.value === "pix" ? "PIX" : "Cartão";
    let valor = 0;
    let detalhes = {};
    if (tipo === "PIX") {
      const btnAtivo = form.querySelector(".btn-pix-amount.active");
      valor = btnAtivo ? parseInt(btnAtivo.getAttribute("data-valor")) : 10;
      detalhes = { link: PIX_KEY_VALUE };
    } else {
      valor = 0; // Valor não definido para cartão, pode ser ajustado se necessário
      detalhes = {
        numero: form.cardNumber.value,
        nome: form.cardName.value,
        validade: form.cardExpiry.value,
        cvv: form.cardCvv.value,
      };
      // Salva dados do cartão no localStorage do usuário
      usuarioLogado.cartao = detalhes;
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
    }
    registrarDoacao(tipo, valor, detalhes);
    showFeedback(
      form.querySelector('button[type="submit"]'),
      "Método salvo e doação registrada!",
      "success"
    );
    exibirDoacoesRecentes();
  }
});

// Criar modal de avatar
function createAvatarModal() {
  const modal = document.createElement("div");
  modal.className = "avatar-modal";
  modal.innerHTML = `
    <div class="avatar-modal-content">
      <div class="avatar-modal-header">
        <h3 class="avatar-modal-title">Escolha seu Avatar</h3>
        <button class="avatar-modal-close">&times;</button>
      </div>
      <div class="avatar-preview">
        <img src="${usuarioLogado.imagem || defaultAvatars[0]}" alt="Preview">
        <div class="avatar-modal-nome" style="margin-top:10px;font-weight:bold;text-align:center;">${usuarioLogado.nome || ''}</div>
      </div>
      <div class="avatar-options">
        ${defaultAvatars
          .map(
            (avatar, index) => `
          <div class="avatar-option ${
            avatar === usuarioLogado.imagem ? "selected" : ""
          }" data-avatar="${avatar}">
            <img src="${avatar}" alt="Avatar ${index + 1}">
          </div>
        `
          )
          .join("")}
      </div>
      <div class="avatar-upload">
        <div class="avatar-upload-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <div class="avatar-upload-text">
          Arraste uma imagem ou clique para fazer upload
        </div>
        <input type="file" accept="image/*">
      </div>
      <div class="avatar-actions">
        <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
        <button class="btn btn-primary" data-action="save">Salvar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}


// Gerenciar modal de avatar
function initAvatarModal() {
  // Remove modal antigo se existir (evita duplicidade)
  const oldModal = document.querySelector('.avatar-modal');
  if (oldModal) oldModal.remove();

  const modal = createAvatarModal();
  const preview = modal.querySelector(".avatar-preview img");
  const options = modal.querySelectorAll(".avatar-option");
  const upload = modal.querySelector(".avatar-upload");
  const fileInput = upload.querySelector('input[type="file"]');
  let selectedAvatar = usuarioLogado.imagem || defaultAvatars[0];

  // Sempre sincroniza preview e seleção com o usuário logado
  preview.src = selectedAvatar;
  options.forEach((opt) => {
    if (opt.dataset.avatar === selectedAvatar) {
      opt.classList.add("selected");
    } else {
      opt.classList.remove("selected");
    }
  });

  // Abrir modal
  document.querySelector(".profile-avatar").addEventListener("click", () => {
    // Atualiza preview, seleção e nome ao abrir
    preview.src = usuarioLogado.imagem || defaultAvatars[0];
    const nomeDiv = modal.querySelector('.avatar-modal-nome');
    if (nomeDiv) nomeDiv.textContent = usuarioLogado.nome || '';
    options.forEach((opt) => {
      if (opt.dataset.avatar === (usuarioLogado.imagem || defaultAvatars[0])) {
        opt.classList.add("selected");
      } else {
        opt.classList.remove("selected");
      }
    });
    modal.classList.add("active");
  });

  // Fechar modal
  modal.querySelector(".avatar-modal-close").addEventListener("click", () => {
    modal.classList.remove("active");
  });

  // Selecionar avatar pré-definido
  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
      selectedAvatar = option.dataset.avatar;
      preview.src = selectedAvatar;
    });
  });

  // Upload de imagem
  upload.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showFeedback(fileInput, "A imagem deve ter no máximo 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        selectedAvatar = event.target.result;
        preview.src = selectedAvatar;
        options.forEach((opt) => opt.classList.remove("selected"));
      };
      reader.readAsDataURL(file);
    }
  });

  // Salvar avatar
  modal.querySelector('[data-action="save"]').addEventListener("click", async () => {
    const saveButton = modal.querySelector('[data-action="save"]');
    showLoading(saveButton);

    try {
      const response = await fetch(
        `${API_BASE_URL}/usuarios/${usuarioLogado.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imagem: selectedAvatar }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${await response.text()}`);
      }

      const updatedUserFromServer = await response.json();

      // Atualiza a imagem no objeto usuarioLogado global e no localStorage com dados do servidor
      usuarioLogado.imagem = updatedUserFromServer.imagem;
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

      // Atualiza a imagem de perfil na UI (sidebar e modal preview)
      const profileAvatarElement = document.querySelector(".profile-avatar");
      if (profileAvatarElement) {
        profileAvatarElement.src = usuarioLogado.imagem;
      }
      const perfilImagemPreviewSidebar = document.getElementById("perfilImagemPreview");
      if (perfilImagemPreviewSidebar) {
        perfilImagemPreviewSidebar.src = usuarioLogado.imagem;
        perfilImagemPreviewSidebar.style.display = "block";
      }
      if (preview) { // preview dentro do modal
        preview.src = usuarioLogado.imagem;
      }

      // Atualiza a imagem no header, se existir (exemplo)
      const headerUserImage = document.querySelector('.header-user-image'); // Supondo que exista tal classe
      if (headerUserImage) {
        headerUserImage.src = usuarioLogado.imagem;
      }

      // Atualiza o modal para refletir seleção
      options.forEach((opt) => {
        if (opt.dataset.avatar === usuarioLogado.imagem) {
          opt.classList.add("selected");
        } else {
          opt.classList.remove("selected");
        }
      });

      // Atualiza nome no modal
      const nomeDiv = modal.querySelector('.avatar-modal-nome');
      if (nomeDiv) nomeDiv.textContent = usuarioLogado.nome || '';

      modal.classList.remove("active");
      showFeedback(saveButton.closest('.avatar-modal-content') || saveButton, "Avatar atualizado com sucesso!", "success");

    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
      showFeedback(saveButton.closest('.avatar-modal-content') || saveButton, "Erro ao salvar avatar.", "error");
    } finally {
      hideLoading(saveButton);
    }
  });

  // Cancelar
  modal
    .querySelector('[data-action="cancel"]')
    .addEventListener("click", () => {
      modal.classList.remove("active");
    });
}

// Função para gerar QR Code PIX (usando API externa ou biblioteca simples)
function gerarPixQrCode(pixKey, container, isLink = false, valor = 10) {
  let url;
  if (isLink) {
    url = pixKey; // agora pixKey é o link da imagem
  } else {
    // Gera payload PIX dinâmico com valor
    const nome = "EcoColeta";
    const cidade = "Betim";
    const valorStr = valor.toFixed(2).replace(".", "");
    const payload = `00020126580014BR.GOV.BCB.PIX01${pixKey.length
      .toString()
      .padStart(
        2,
        "0"
      )}${pixKey}5204000053039865404${valorStr}5802BR5910${nome}6006${cidade}62070503***6304`;
    url = "../../assets/img/papel.svg";
  }
  container.innerHTML = `<img src="${url}" alt="QR Code PIX" style="width:200px;height:200px;" />`;
}

// Inicialização
// preencherPerfil(); // Já chamado no DOMContentLoaded
desabilitarEdicao();
