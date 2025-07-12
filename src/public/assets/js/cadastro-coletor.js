// Script para manipulação do formulário de cadastro de coletor
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("cadastroColetorForm");
  const cepInput = document.getElementById("cep");
  const API_BASE_URL = "https://two025-1-p1-tiaw-ecocoleta.onrender.com/api";

  // Função para buscar coordenadas baseadas no CEP
  async function buscarCoordenadas(cep, endereco, cidade, estado) {
    try {
      // Remove formatação do CEP
      const cepLimpo = cep.replace(/\D/g, "");

      // Monta o endereço completo para geocoding
      const enderecoCompleto = `${endereco}, ${cidade}, ${estado}, ${cepLimpo}, Brasil`;

      // Usa a API do OpenStreetMap Nominatim (gratuita)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          enderecoCompleto
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      } else {
        // Coordenadas padrão para Betim, MG caso não encontre
        console.warn(
          "Não foi possível encontrar coordenadas exatas, usando coordenadas padrão de Betim"
        );
        return {
          lat: -19.9677,
          lng: -44.1986,
        };
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
      // Coordenadas padrão para Betim, MG em caso de erro
      return {
        lat: -19.9677,
        lng: -44.1986,
      };
    }
  }

  // Função para buscar dados do CEP
  async function buscarCEP(cep) {
    try {
      const cepLimpo = cep.replace(/\D/g, "");
      if (cepLimpo.length !== 8) return;

      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      const data = await response.json();

      if (data && !data.erro) {
        document.getElementById("endereco").value = data.logradouro || "";
        document.getElementById("cidade").value = data.localidade || "";
        document.getElementById("estado").value = data.uf || "";
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }

  // Auto-preenchimento do CEP
  cepInput.addEventListener("blur", function () {
    const cep = this.value;
    if (cep) {
      buscarCEP(cep);
    }
  });

  // Máscara para CEP
  cepInput.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "");
    if (value.length > 5) {
      value = value.substring(0, 5) + "-" + value.substring(5, 8);
    }
    this.value = value;
  });

  // Máscara para CNPJ
  const cnpjInput = document.getElementById("cnpj");
  cnpjInput.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "");
    if (value.length > 14) value = value.substring(0, 14);

    if (value.length > 12) {
      value = value.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    } else if (value.length > 8) {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "$1.$2.$3/$4");
    } else if (value.length > 5) {
      value = value.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{3})/, "$1.$2");
    }
    this.value = value;
  });

  // Máscara para telefone
  const telefoneInput = document.getElementById("telefone");
  telefoneInput.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "");
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 6) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{5})/, "($1) $2");
    }
    this.value = value;
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Validação de campos obrigatórios
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const endereco = document.getElementById("endereco").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const estado = document.getElementById("estado").value;
    const razaoSocial = document.getElementById("razaoSocial").value.trim();
    const cnpj = document.getElementById("cnpj").value.trim();
    const areaAtuacao = document.getElementById("areaAtuacao").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;
    const coletaDomiciliar = document.getElementById("coletaDomiciliar").value;
    const horarioColeta = document.getElementById("horarioColeta").value.trim();

    // Validação das senhas
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem. Por favor, verifique.");
      return;
    }

    // Validação dos materiais coletados
    const materiaisColeta = Array.from(
      document.querySelectorAll("input[name='materiaisColeta']:checked")
    ).map((checkbox) => checkbox.value);

    if (materiaisColeta.length === 0) {
      alert("Selecione pelo menos um material que você coleta.");
      return;
    }

    // Validação dos termos
    const termosAceitos = document.getElementById("termos").checked;
    if (!termosAceitos) {
      alert(
        "Você deve concordar com os Termos de Uso e Política de Privacidade."
      );
      return;
    }

    // Desabilita o botão de submit para evitar duplicação
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Cadastrando...";

    try {
      // Primeiro, verifica se o email já está em uso
      const emailCheckResponse = await fetch(
        `https://two025-1-p1-tiaw-ecocoleta.onrender.com/api/usuarios?email=${encodeURIComponent(email)}`
      );
      const usuariosExistentes = await emailCheckResponse.json();

      if (usuariosExistentes.length > 0) {
        alert(
          "Este email já está cadastrado no sistema. Tente fazer login ou use outro email."
        );
        return;
      }

      // Busca coordenadas para o ecoponto
      const coordenadas = await buscarCoordenadas(
        cep,
        endereco,
        cidade,
        estado
      );

      // Dados do usuário coletor
      const usuarioData = {
        nome,
        email,
        telefone,
        cep,
        endereco,
        cidade,
        estado,
        tipoUsuario: "coletor",
        razaoSocial,
        cnpj,
        areaAtuacao,
        coletaDomiciliar,
        horarioColeta: horarioColeta || "A combinar",
        materiaisColeta,
        senha,
        imagem: "",
        emailVerificado: false,
        dataCadastro: new Date().toISOString(),
      };

      // Cadastra o usuário coletor
      const usuarioResponse = await fetch(
        "https://two025-1-p1-tiaw-ecocoleta.onrender.com/api/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(usuarioData),
        }
      );

      if (!usuarioResponse.ok) {
        throw new Error("Erro ao cadastrar usuário");
      }

      const novoUsuario = await usuarioResponse.json();

      // Dados do ecoponto
      const ecopontoData = {
        nome: `Ecoponto ${razaoSocial}`,
        lat: coordenadas.lat,
        lng: coordenadas.lng,
        endereco: `${endereco}, ${cidade} - ${estado}`,
        horario: horarioColeta || "A combinar",
        materiaisAceitos: materiaisColeta,
        contato: telefone,
        coletaDomiciliar: coletaDomiciliar === "sim",
        agenda: [],
        coletorId: novoUsuario.id,
        status: "ativo",
      };

      // Cadastra o ecoponto
      const ecopontoResponse = await fetch(
        "https://two025-1-p1-tiaw-ecocoleta.onrender.com/api/pontosDeColeta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ecopontoData),
        }
      );

      if (!ecopontoResponse.ok) {
        throw new Error("Erro ao cadastrar ecoponto");
      }

      const novoEcoponto = await ecopontoResponse.json();

      // Atualiza o usuário com o ID do ecoponto
      await fetch(`https://two025-1-p1-tiaw-ecocoleta.onrender.com/api/usuarios/${novoUsuario.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ecopontoId: novoEcoponto.id }),
      });

      // Salva o usuário no localStorage para manter a sessão
      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          tipoUsuario: novoUsuario.tipoUsuario,
          imagem: novoUsuario.imagem || "",
          ecopontoId: novoEcoponto.id,
        })
      );

      // Exibe mensagem de sucesso
      const msgDiv = document.createElement("div");
      msgDiv.innerHTML = `
                <strong>Cadastro realizado com sucesso!</strong><br>
                Seu ecoponto "${novoEcoponto.nome}" foi criado.<br>
                Redirecionando para o perfil...
            `;
      msgDiv.style.cssText = `
                background: #10b981;
                color: #fff;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                position: fixed;
                top: 32px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            `;
      document.body.appendChild(msgDiv);

      // Redireciona após 3 segundos
      setTimeout(() => {
        msgDiv.remove();
        window.location.href = "perfil.html";
      }, 3000);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert(
        "Erro ao realizar cadastro. Verifique sua conexão e tente novamente."
      );
    } finally {
      // Reabilita o botão
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
