document.addEventListener("DOMContentLoaded", () => {
  const containerContribuintes = document.querySelector(".contribuintes-container");
  const containerHistorias = document.querySelector(".historias-container");

  // Configuração da API
  const API_BASE_URL = "http://localhost:3000/api";

  // Função para carregar comunidades da API
  async function carregarComunidades() {
    try {
      const response = await fetch(`${API_BASE_URL}/comunidades`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const comunidades = await response.json();
      exibirComunidades(comunidades);
    } catch (error) {
      console.error("Erro ao carregar comunidades:", error);
      // Fallback para dados estáticos em caso de erro
      const comunidadesFallback = [
        {
          id: 1,
          nome: "Mutirão de Reciclagem no Bairro Verde",
          descricao: "Conseguimos reciclar mais de 1 tonelada de materiais em um único dia!",
          tipo: "projeto-comunitario",
          autor: { nome: "Carlos Lima", foto: "https://placehold.co/80" },
          banner: "https://placehold.co/300x150",
          curtidas: 89,
          comentarios: 23,
          membros: 127
        }
      ];
      exibirComunidades(comunidadesFallback);
    }
  }
  // Função para exibir comunidades
  function exibirComunidades(comunidades) {
    containerHistorias.innerHTML = "";
    comunidades.forEach(h => {
     
      const nomeAutor = h.autor && h.autor.nome ? h.autor.nome : "Autor desconhecido";
      const fotoAutor = h.autor && h.autor.foto ? h.autor.foto : "https://placehold.co/50";

      containerHistorias.innerHTML += `
        <a href="detalhe-comunidade.html?id=${h.id}" class="historia-card">
          <img src="${h.banner || h.imagemCapa}" alt="Imagem do projeto"/>
          <div class="historia-card-content">
            <h3>${h.nome}</h3>
            <p>${h.descricao}</p>
          </div>
          <div class="autor-card-footer">
            <img src="${fotoAutor}" alt="Foto de ${nomeAutor}">
            <span>Por ${nomeAutor}</span>
          </div>
        </a>
      `;
    });
  }

  // Função para formatar o tipo da comunidade
  function formatarTipo(tipo) {
    const tipos = {
      'projeto-comunitario': 'Projeto Comunitário',
      'educacao': 'Educação',
      'sustentabilidade': 'Sustentabilidade',
      'economia-local': 'Economia Local',
      'saude': 'Saúde'
    };
    return tipos[tipo] || tipo;
  }

  // Função para adicionar nova comunidade
  async function adicionarComunidade(dadosComunidade) {
    // Se não houver imagem definida, usa TelaBranca.png
    if (!dadosComunidade.imagemCapa || dadosComunidade.imagemCapa.trim() === '') {
      dadosComunidade.imagemCapa = 'assets/img/TelaBranca.png';
    }
    try {
      const response = await fetch(`${API_BASE_URL}/comunidades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosComunidade)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const novaComunidade = await response.json();
      console.log('Comunidade criada com sucesso:', novaComunidade);
      
      // Recarregar a lista de comunidades
      carregarComunidades();
      
      return novaComunidade;
    } catch (error) {
      console.error('Erro ao criar comunidade:', error);
      throw error;
    }
  }

  // Expor função globalmente para uso em outras páginas
  window.adicionarComunidade = adicionarComunidade;

  // Função para carregar top contribuintes dinamicamente
  async function carregarTopContribuintes() {
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios?_sort=ecopontos&_order=desc`);
      if (!res.ok) throw new Error('Erro ao buscar contribuintes');
      const usuarios = await res.json();
      exibirTopContribuintes(usuarios);
    } catch (e) {
      // Exibe mensagem de erro na interface
      if (containerContribuintes) {
        containerContribuintes.innerHTML = `<div class="erro-contribuintes" style="color: #fff; background: #e74c3c; padding: 12px; border-radius: 8px; text-align: center; margin: 16px 0; font-weight: bold;">Não foi possível carregar os top contribuintes no momento.</div>`;
      }
    }
  }

  function exibirTopContribuintes(lista) {
    if (!containerContribuintes) return;
    containerContribuintes.innerHTML = '';
    lista.filter(c => c.ecopontos && c.ecopontos > 0).forEach((c, index) => {
      // Pega apenas o primeiro e segundo nome
      const nomes = c.nome.split(' ');
      const nome1 = nomes[0] || '';
      const nome2 = nomes[1] || '';
      // Formata pontos com sufixo
      const pontosFormatados = formatarPontuacao(c.ecopontos);
      containerContribuintes.innerHTML += `
        <div class="contribuinte">
          <div class="contribuinte-img-wrapper">
            <img src="${c.imagem || 'assets/img/AvatarThiagão.jpg'}" alt="Foto de ${nome1} ${nome2}" class="img-contribuinte">
          </div>
          <div class="contribuinte-info">
            <p class="nome-contribuinte"><span>${nome1}</span><br><span>${nome2}</span></p>
            <p class="pontos-contribuinte">${pontosFormatados} pontos</p>
          </div>
        </div>
      `;
    });
  }

  function formatarPontuacao(pontos) {
    if (pontos >= 1_000_000) return (pontos / 1_000_000).toFixed(1).replace('.0','') + 'M';
    if (pontos >= 1_000) return (pontos / 1_000).toFixed(1).replace('.0','') + 'K';
    return pontos.toLocaleString('pt-BR');
  }

  // Carregar e exibir comunidades da API
  carregarComunidades();
  carregarTopContribuintes();
});

// Função para carregar eventos do db.json e exibir na seção de eventos
async function carregarEventos() {
  const containerEventos = document.querySelector('.eventos-container');
  if (!containerEventos) return;
  // Corrige escopo da variável de API
  const API_BASE_URL = "http://localhost:3000/api";
  try {
    const response = await fetch(`${API_BASE_URL}/eventos`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const eventos = await response.json();
    exibirEventos(eventos);
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    // Fallback para dados estáticos em caso de erro
    const eventosFallback = [
      {
        titulo: "Evento Exemplo",
        descricao: "Este é um evento de exemplo exibido como fallback.",
        data: "2025-06-30",
        hora: "14:00",
        imagem: "assets/img/calendar.svg",
        autor: { nome: "Equipe EcoColeta", foto: "https://placehold.co/32" }
      }
    ];
    exibirEventos(eventosFallback);
  }
}

// Função para exibir eventos
function exibirEventos(eventos) {
  console.log('Eventos recebidos:', eventos);
  const containerEventos = document.querySelector('.eventos-container');
  containerEventos.innerHTML = '';
  if (!eventos.length) {
    containerEventos.innerHTML = '<p style="text-align:center;color:#888">Nenhum evento encontrado.</p>';
    return;
  }
  eventos.forEach(evento => {
    const autor = evento.autor && evento.autor.nome ? evento.autor.nome : 'Autor desconhecido';
    const autorFoto = evento.autor && evento.autor.foto ? evento.autor.foto : 'https://placehold.co/32';
    // Formatar data para o padrão brasileiro
    let dataFormatada = evento.data;
    let statusEvento = '';
    let dataEvento = null;
    if (evento.data && evento.data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = evento.data.split('-');
      dataFormatada = `${dia}/${mes}/${ano}`;
      dataEvento = new Date(`${evento.data}T${evento.hora || '00:00'}`);
    }
    // Status do evento
    if (dataEvento) {
      const agora = new Date();
      const fimEvento = new Date(dataEvento.getTime() + 2 * 60 * 60 * 1000); // evento dura 2h
      if (agora < dataEvento) {
        statusEvento = '<span class="evento-status status-breve">Acontecerá em breve</span>';
      } else if (agora >= dataEvento && agora <= fimEvento) {
        statusEvento = '<span class="evento-status status-agora">Acontecendo agora</span>';
      } else {
        // Não renderiza eventos passados
        return;
      }
    }
    containerEventos.innerHTML += `
      <div class="evento-card" data-id="${evento.id}" style="cursor:pointer;">
        <img src="${evento.imagem || 'assets/img/TelaBranca.png'}" alt="Imagem do Evento" class="evento-img">
        <div class="evento-info">
          <h3 class="evento-titulo">${evento.titulo}</h3>
          <div class="evento-detalhes">
            <span class="evento-data"><i class="fa-regular fa-calendar"></i> ${dataFormatada}</span>
            <span class="evento-hora"><i class="fa-regular fa-clock"></i> ${evento.hora || ''}</span>
          </div>
          ${statusEvento}
          <p class="evento-descricao">${evento.descricao}</p>
        </div>
        <div class="evento-autor-footer">
          <img src="${autorFoto}" alt="${autor}" class="evento-autor-img">
          <span class="evento-autor-nome">${autor}</span>
        </div>
      </div>
    `;
  });
  // Adiciona interação de clique nos cards de evento
  setTimeout(() => {
    document.querySelectorAll('.evento-card').forEach(card => {
      card.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        if (id) {
          window.location.href = `detalhe-evento.html?id=${id}`;
        }
      });
    });
  }, 100);
}

// Chamar ao carregar página
window.addEventListener('DOMContentLoaded', () => {
  carregarEventos();
});

// --- Busca Unificada (ajuste para filtros dropdown) ---
(function() {
  const input = document.getElementById('buscaUnificadaInput');
  const resultados = document.getElementById('buscaUnificadaResultados');
  const btnFiltros = document.getElementById('btnFiltros');
  const filtrosDropdown = document.getElementById('buscaFiltrosDropdown');
  let radios = filtrosDropdown.querySelectorAll('input[name="buscaTipo"]');
  let dados = { contribuintes: [], comunidades: [], eventos: [] };
  let carregou = { contribuintes: false, comunidades: false, eventos: false };

  // Mostra/oculta filtros ao clicar no botão
  btnFiltros.addEventListener('click', function(e) {
    e.stopPropagation();
    filtrosDropdown.style.display = filtrosDropdown.style.display === 'block' ? 'none' : 'block';
  });
  // Fecha filtros ao clicar fora
  document.addEventListener('click', function(e) {
    if (!filtrosDropdown.contains(e.target) && e.target !== btnFiltros) {
      filtrosDropdown.style.display = 'none';
    }
  });

  // Carrega todos os dados necessários para busca
  async function carregarDadosBusca() {
    try {
      const resC = await fetch('http://localhost:3000/api/usuarios?_sort=ecopontos&_order=desc');
      dados.contribuintes = await resC.json();
      carregou.contribuintes = true;
    } catch {}
    try {
      const resCom = await fetch('http://localhost:3000/api/comunidades');
      dados.comunidades = await resCom.json();
      carregou.comunidades = true;
    } catch {}
    try {
      const resE = await fetch('http://localhost:3000/api/eventos');
      dados.eventos = await resE.json();
      carregou.eventos = true;
    } catch {}
  }

  function normaliza(str) {
    return (str||'').toLowerCase().normalize('NFD').replace(/[^\w\s\-@.]/g, '');
  }

  function filtrarResultados(texto, tipo) {
    const t = normaliza(texto);
    let res = [];
    if (tipo === 'todos' || tipo === 'contribuinte') {
      res = res.concat(dados.contribuintes.filter(u =>
        normaliza(u.nome).includes(t) || normaliza(u.email).includes(t)
      ).map(u => ({
        tipo: 'Top Contribuinte',
        nome: u.nome,
        desc: u.email,
        img: u.imagem || 'assets/img/AvatarThiagão.jpg',
        link: '#',
        id: u.id
      })));
    }
    if (tipo === 'todos' || tipo === 'comunidade') {
      res = res.concat(dados.comunidades.filter(c =>
        normaliza(c.nome).includes(t) || normaliza(c.descricao).includes(t) || normaliza((c.autor && c.autor.nome) || '').includes(t)
      ).map(c => ({
        tipo: 'Comunidade',
        nome: c.nome,
        desc: c.descricao,
        img: c.banner || c.imagemCapa || 'assets/img/TelaBranca.png',
        link: `detalhe-comunidade.html?id=${c.id}`,
        id: c.id
      })));
    }
    if (tipo === 'todos' || tipo === 'evento') {
      res = res.concat(dados.eventos.filter(e =>
        normaliza(e.titulo).includes(t) || normaliza(e.descricao).includes(t) || normaliza((e.autor && e.autor.nome) || '').includes(t)
      ).map(e => ({
        tipo: 'Evento',
        nome: e.titulo,
        desc: e.descricao,
        img: e.imagem || 'assets/img/TelaBranca.png',
        link: `detalhe-evento.html?id=${e.id}`,
        id: e.id
      })));
    }
    return res;
  }

  function renderResultados(lista) {
    if (!lista.length) {
      resultados.innerHTML = '<div class="busca-unificada-item">Nenhum resultado encontrado.</div>';
      resultados.classList.add('ativa');
      return;
    }
    resultados.innerHTML = lista.map(item => `
      <div class="busca-unificada-item" tabindex="0" data-link="${item.link}">
        <img class="busca-unificada-img" src="${item.img}" alt="${item.nome}">
        <div class="busca-unificada-info">
          <div class="busca-unificada-tipo">${item.tipo}</div>
          <div class="busca-unificada-nome">${item.nome}</div>
          <div class="busca-unificada-desc">${item.desc ? item.desc.substring(0, 60) : ''}</div>
        </div>
      </div>
    `).join('');
    resultados.classList.add('ativa');
    resultados.querySelectorAll('.busca-unificada-item').forEach(el => {
      el.addEventListener('click', function() {
        const link = this.getAttribute('data-link');
        if (link && link !== '#') window.location.href = link;
      });
    });
  }

  function atualizarBusca() {
    const texto = input.value;
    const tipo = filtrosDropdown.querySelector('input[name="buscaTipo"]:checked').value;
    if (!texto.trim()) {
      resultados.classList.remove('ativa');
      resultados.innerHTML = '';
      return;
    }
    const lista = filtrarResultados(texto, tipo);
    renderResultados(lista);
  }

  input.addEventListener('input', atualizarBusca);
  filtrosDropdown.querySelectorAll('input[name="buscaTipo"]').forEach(r => r.addEventListener('change', atualizarBusca));
  document.addEventListener('click', e => {
    if (!resultados.contains(e.target) && e.target !== input) {
      resultados.classList.remove('ativa');
    }
  });
  input.addEventListener('focus', atualizarBusca);

  carregarDadosBusca();
})();
// --- Fim Busca Unificada ---
