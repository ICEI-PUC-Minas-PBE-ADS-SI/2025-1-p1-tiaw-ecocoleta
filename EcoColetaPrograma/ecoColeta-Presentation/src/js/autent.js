// Configurações das APIs sociais
const GOOGLE_CLIENT_ID = "SEU_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const FACEBOOK_APP_ID = "SEU_FACEBOOK_APP_ID";
const API_BASE_URL = "https://two025-1-p1-tiaw-ecocoleta.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
  // Elementos principais
  const container = document.querySelector(".auth-container");
  const loginForm = document.getElementById("loginForm");
  const cadastroForm = document.getElementById("cadastroForm");
  const goToRegisterBtn = document.getElementById("go-to-register");
  const goToLoginBtn = document.getElementById("go-to-login");
  const imagemInput = document.getElementById("imagemInput");
  const imagemPreview = document.getElementById("imagemPreview");
  const imagePanel = document.getElementById("image-section");
  const loginPanel = document.getElementById("login-section");
  const registerPanel = document.getElementById("register-section");

  // Elementos do formulário de cadastro
  const senhaInput = document.getElementById("cadastroSenha");
  const confirmarSenhaInput = document.getElementById("cadastroConfirmarSenha");
  const cepInput = document.getElementById("cadastroCEP");
  const telefoneInput = document.getElementById("cadastroTelefone");
  const enderecoInput = document.getElementById("cadastroEndereco");
  const cidadeInput = document.getElementById("cadastroCidade");
  const estadoInput = document.getElementById("cadastroEstado");

  // Função para verificar parâmetros da URL e mostrar o painel correto na inicialização
  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
    if (action === "register") {
      showRegisterPanel();
    } else {
      showLoginPanel();
    }
  }

  // Funções para alternar entre os painéis
  function showLoginPanel() {
    container.classList.remove("show-register");
    container.classList.add("show-login");
    loginPanel.classList.add("active-panel");
    registerPanel.classList.remove("active-panel");
    imagePanel.classList.add("show-with-login");
    imagePanel.classList.remove("show-with-register");
  }

  function showRegisterPanel() {
    container.classList.remove("show-login");
    container.classList.add("show-register");
    registerPanel.classList.add("active-panel");
    loginPanel.classList.remove("active-panel");
    imagePanel.classList.remove("show-with-login");
    imagePanel.classList.add("show-with-register");
  }

  // Adicionar classes iniciais
  loginPanel.classList.add("active-panel");
  imagePanel.classList.add("show-with-login");

  // Event listeners para navegação
  goToRegisterBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showRegisterPanel();
  });

  goToLoginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showLoginPanel();
  });

  // Preview da imagem de perfil
  if (imagemInput) {
    imagemInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          imagemPreview.src = evt.target.result;
          imagemPreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        imagemPreview.style.display = "none";
      }
    });
  }

  // Máscaras para inputs
  if (telefoneInput) {
    telefoneInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
        value = value.replace(/(\d)(\d{4})$/, "$1-$2");
        e.target.value = value;
      }
    });
  }

  if (cepInput) {
    cepInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length <= 8) {
        value = value.replace(/^(\d{5})(\d)/, "$1-$2");
        e.target.value = value;
      }
    });

    // Busca endereço pelo CEP
    cepInput.addEventListener("blur", async function () {
      const cep = this.value.replace(/\D/g, "");
      if (cep.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await response.json();
          if (!data.erro) {
            enderecoInput.value = `${data.logradouro}, ${data.bairro}`;
            cidadeInput.value = data.localidade;
            estadoInput.value = data.uf;
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        }
      }
    });
  }

  // Validação de senha
  if (senhaInput && confirmarSenhaInput) {
    confirmarSenhaInput.addEventListener("input", function () {
      if (this.value !== senhaInput.value) {
        this.setCustomValidity("As senhas não coincidem");
      } else {
        this.setCustomValidity("");
      }
    });

    senhaInput.addEventListener("input", function () {
      if (
        confirmarSenhaInput.value &&
        this.value !== confirmarSenhaInput.value
      ) {
        confirmarSenhaInput.setCustomValidity("As senhas não coincidem");
      } else {
        confirmarSenhaInput.setCustomValidity("");
      }
    });
  }

  // Inicialização das APIs sociais
  function initSocialAPIs() {
    // Inicializa Google Sign-In
    gapi.load("auth2", function () {
      gapi.auth2
        .init({
          client_id: GOOGLE_CLIENT_ID,
          cookiepolicy: "single_host_origin",
        })
        .then(function (auth2) {
          // Personaliza o botão do Google
          const googleBtn = document.getElementById("googleLogin");
          if (googleBtn) {
            auth2.attachClickHandler(
              googleBtn,
              {},
              function (googleUser) {
                handleGoogleSignIn(googleUser);
              },
              function (error) {
                console.error("Erro no login com Google:", error);
              }
            );
          }
        });
    });

    // Inicializa Facebook SDK
    window.fbAsyncInit = function () {
      FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
    };
  }

  // Handler para login com Google
  async function handleGoogleSignIn(googleUser) {
    try {
      const profile = googleUser.getBasicProfile();
      const userData = {
        nome: profile.getName(),
        email: profile.getEmail(),
        imagem: profile.getImageUrl(),
        googleId: profile.getId(),
        provider: "google",
      };

      await handleSocialLogin(userData);
    } catch (error) {
      console.error("Erro ao processar login do Google:", error);
      alert("Não foi possível fazer login com o Google. Tente novamente.");
    }
  }

  // Handler para login com Facebook
  function handleFacebookLogin() {
    FB.login(
      async function (response) {
        if (response.authResponse) {
          try {
            const fbResponse = await FB.api("/me", {
              fields: "name,email,picture",
            });
            const userData = {
              nome: fbResponse.name,
              email: fbResponse.email,
              imagem: fbResponse.picture?.data?.url,
              facebookId: fbResponse.id,
              provider: "facebook",
            };

            await handleSocialLogin(userData);
          } catch (error) {
            console.error("Erro ao processar login do Facebook:", error);
            alert(
              "Não foi possível fazer login com o Facebook. Tente novamente."
            );
          }
        }
      },
      { scope: "public_profile,email" }
    );
  }

  // Função unificada para processar login social
  async function handleSocialLogin(userData) {
    try {      // Verifica se o usuário já existe
      const response = await fetch(
        `${API_BASE_URL}/api/usuarios?email=${encodeURIComponent(
          userData.email
        )}`
      );
      const usuarios = await response.json();

      let usuario;
      if (usuarios.length === 0) {
        // Cria novo usuário
        const createResponse = await fetch("${API_BASE_URL}/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userData,
            senha: Math.random().toString(36).slice(-8), // Senha aleatória para usuários sociais
            emailVerificado: true, // Emails de logins sociais já são verificados
          }),
        });

        if (!createResponse.ok) {
          throw new Error("Erro ao criar usuário");
        }
        usuario = await createResponse.json();
      } else {        usuario = usuarios[0];
        // Atualiza informações do usuário se necessário
        if (userData.provider === "google" && !usuario.googleId) {
          await fetch(`${API_BASE_URL}/api/usuarios/${usuario.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ googleId: userData.googleId }),
          });
        } else if (userData.provider === "facebook" && !usuario.facebookId) {
          await fetch(`${API_BASE_URL}/api/usuarios/${usuario.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ facebookId: userData.facebookId }),
          });
        }
      }

      // Salva dados do usuário na sessão
      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipoUsuario: usuario.admin === true ? 'admin' : usuario.tipoUsuario,
          imagem: usuario.imagem,
          admin: usuario.admin
        })
      );

      // Redireciona para a página principal
      window.location.href = "perfil.html";
    } catch (error) {
      console.error("Erro no login social:", error);
      alert("Ocorreu um erro durante o login. Por favor, tente novamente.");
    }
  }

  // Event Listeners para botões de login social
  const facebookBtn = document.getElementById("facebookLogin");
  if (facebookBtn) {
    facebookBtn.addEventListener("click", handleFacebookLogin);
  }

  // Inicializa as APIs sociais
  initSocialAPIs();

  // Submissão do formulário de login
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    // Use os IDs corretos dos inputs
    const email = loginForm.querySelector('#loginEmail').value;
    const senha = loginForm.querySelector('#loginSenha').value;
    try {
      const response = await fetch(
        `https://two025-1-p1-tiaw-ecocoleta.onrender.com/usuarios?email=${encodeURIComponent(email)}`
      );
      const usuarios = await response.json();
      if (usuarios.length === 0) {
        alert("Usuário não encontrado.");
        return;
      }
      const usuario = usuarios[0];
      if (usuario.senha !== senha) {
        alert("Senha incorreta.");
        return;
      }
      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipoUsuario: usuario.admin === true ? 'admin' : usuario.tipoUsuario,
          imagem: usuario.imagem,
        })
      );
      window.location.href = "perfil.html";
    } catch (err) {
      alert("Erro de conexão com o servidor.");
    }
  });

  // Submissão do formulário de cadastro
  if (cadastroForm) {
    cadastroForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (senhaInput.value !== confirmarSenhaInput.value) {
        alert("As senhas não coincidem!");
        return;
      }

      const formData = new FormData(cadastroForm);
      const tipoUsuario = formData.get("tipoUsuario");

      // Verifica se o e-mail já está cadastrado
      const email = formData.get("email");      try {
        const verificaResponse = await fetch(
          `https://two025-1-p1-tiaw-ecocoleta.onrender.com/usuarios?email=${encodeURIComponent(email)}`
        );
        const usuariosExistentes = await verificaResponse.json();
        if (usuariosExistentes.length > 0) {
          alert(
            "Este e-mail já está cadastrado. Faça login ou use outro e-mail."
          );
          return;
        }
      } catch (err) {
        alert("Erro ao verificar e-mail existente.");
        return;
      }

      // Coleta os materiais selecionados se for coletor
      let materiaisColeta = [];
      if (tipoUsuario === "coletor" || tipoUsuario === "ambos") {
        const checkboxes = document.querySelectorAll(
          'input[name="materiaisColeta"]:checked'
        );
        materiaisColeta = Array.from(checkboxes).map((cb) => cb.value);
      }

      const usuario = {
        nome: formData.get("nome"),
        email: formData.get("email"),
        telefone: formData.get("telefone"),
        cep: formData.get("cep"),
        endereco: formData.get("endereco"),
        cidade: formData.get("cidade"),
        estado: formData.get("estado"),
        tipoUsuario: tipoUsuario,
        senha: formData.get("senha"),
        imagem:
          imagemPreview && imagemPreview.src && imagemPreview.src !== "#"
            ? imagemPreview.src
            : "",
        emailVerificado: false,
      };

      // Adiciona campos específicos do coletor
      if (tipoUsuario === "coletor" || tipoUsuario === "ambos") {
        usuario.razaoSocial = formData.get("razaoSocial");
        usuario.cnpj = formData.get("cnpj");
        usuario.areaAtuacao = formData.get("areaAtuacao");
        usuario.coletaDomiciliar = formData.get("coletaDomiciliar");
        usuario.horarioColeta = formData.get("horarioColeta");
        usuario.materiaisColeta = materiaisColeta;
      }      try {
        const response = await fetch("https://two025-1-p1-tiaw-ecocoleta.onrender.com/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuario),
        });

        if (response.ok) {
          const novoUsuario = await response.json();

          // Salva o usuário no localStorage para manter a sessão
          localStorage.setItem(
            "usuarioLogado",
            JSON.stringify({
              id: novoUsuario.id,
              nome: novoUsuario.nome,
              email: novoUsuario.email,
              tipoUsuario: novoUsuario.admin === true ? 'admin' : novoUsuario.tipoUsuario,
              imagem: novoUsuario.imagem || "",
              admin: novoUsuario.admin
            })
          );

          // Exibe mensagem personalizada de sucesso
          const msgDiv = document.createElement("div");
          msgDiv.textContent =
            "Cadastro realizado com sucesso! Redirecionando para a página inicial...";
          msgDiv.style.background = "#10b981";
          msgDiv.style.color = "#fff";
          msgDiv.style.padding = "16px";
          msgDiv.style.borderRadius = "8px";
          msgDiv.style.textAlign = "center";
          msgDiv.style.position = "fixed";
          msgDiv.style.top = "32px";
          msgDiv.style.left = "50%";
          msgDiv.style.transform = "translateX(-50%)";
          msgDiv.style.zIndex = "9999";
          document.body.appendChild(msgDiv);
          setTimeout(() => {
            msgDiv.remove();
            window.location.href = "index.html";
          }, 2000);
        } else {
          alert("Erro ao cadastrar. Tente novamente.");
        }
      } catch (err) {
        alert("Erro de conexão com o servidor.");
      }
    });
  } else {
    alert(
      "Formulário de cadastro não encontrado. Verifique o id='cadastroForm' no HTML."
    );
  }

  // Verifica os parâmetros da URL na inicialização
  checkUrlParams();
});
