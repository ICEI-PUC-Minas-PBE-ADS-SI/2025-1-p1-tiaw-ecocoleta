// assinatura.js - Lógica de assinatura Stripe para EcoColeta

// Sempre usa a URL do servidor de produção
const API_BASE_URL = 'https://two025-1-p1-tiaw-ecocoleta.onrender.com';

// Função para buscar usuário logado do localStorage
function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem('usuarioLogado'));
}

function assinarPlano(plano) {
  const btns = document.querySelectorAll('.btn-stripe');
  btns.forEach(btn => {
    btn.disabled = true;
    btn.textContent = 'Processando...';
  });

  // Busca usuário logado
  const usuario = getUsuarioLogado();
  if (!usuario || !usuario.id || !usuario.email) {
    alert('Você precisa estar logado para assinar um plano.');
    btns.forEach((btn, index) => {
      btn.disabled = false;
      // Restaurar texto original do botão
      const textos = ['Assinar Básico', 'Assinar Profissional', 'Assinar Premium'];
      btn.textContent = textos[index] || 'Assinar';
    });
    return;
  }

  // Verificar se o usuário já tem uma assinatura ativa
  if (usuario.planoAtivo && usuario.statusAssinatura === 'ativa') {
    const confirmar = confirm(`Você já possui o ${usuario.planoAtivo} ativo. Deseja alterar para ${plano}?`);
    if (!confirmar) {
      btns.forEach((btn, index) => {
        btn.disabled = false;
        const textos = ['Assinar Básico', 'Assinar Profissional', 'Assinar Premium'];
        btn.textContent = textos[index] || 'Assinar';
      });
      return;
    }
  }

  // Chame seu backend para criar a sessão de checkout Stripe para o plano selecionado
  fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plano, userId: usuario.id, email: usuario.email })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Resposta inesperada do servidor.');
      }
      if (!res.ok) {
        throw new Error(data && data.error ? data.error : `HTTP error! status: ${res.status}`);
      }
      return data;
    })
    .then(data => {
      if (data && data.sessionId) {
        if (typeof Stripe !== 'function') {
          throw new Error('Stripe.js não foi carregado corretamente. Tente recarregar a página.');
        }
        const stripe = Stripe('pk_test_51ReFqqRpNL9isTvJf9wmRFTjTlSixZY97X4WakMy3opn4a3Muma7BlZs5o79S6I5XloSNvYKthaLQ5XSwpfBfbaq00WYuDMdA7'); // Troque pela sua chave pública Stripe
        stripe.redirectToCheckout({ sessionId: data.sessionId })
          .then(function(result) {
            if (result.error) {
              alert('Erro ao redirecionar para o checkout: ' + result.error.message);
            }
          });
      } else {
        throw new Error((data && data.error) || 'Erro ao iniciar checkout. Tente novamente.');
      }
    })
    .catch(error => {
      console.error('Erro no checkout:', error);
      alert(`Erro ao iniciar checkout: ${error.message}`);
      btns.forEach((btn, index) => {
        btn.disabled = false;
        const textos = ['Assinar Básico', 'Assinar Profissional', 'Assinar Premium'];
        btn.textContent = textos[index] || 'Assinar';
      });
    });
}

// Função para verificar status da assinatura
function verificarStatusAssinatura() {
  const usuario = getUsuarioLogado();
  if (!usuario || !usuario.id) return;

  fetch(`${API_BASE_URL}/api/usuarios/${usuario.id}`)
    .then(res => res.json())
    .then(data => {
      if (data.planoAtivo && data.statusAssinatura === 'ativa') {
        // Usuário tem assinatura ativa - mostrar status
        const statusDiv = document.createElement('div');
        statusDiv.className = 'alert alert-success mt-3';
        statusDiv.innerHTML = `
          <strong>✅ Assinatura Ativa:</strong> ${data.planoAtivo.charAt(0).toUpperCase() + data.planoAtivo.slice(1)}<br>
          <small>Desde: ${new Date(data.dataAssinatura).toLocaleDateString('pt-BR')}</small>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(statusDiv, container.firstChild);
        
        // Alterar botões para "Gerenciar Assinatura"
        const btns = document.querySelectorAll('.btn-stripe');
        btns.forEach(btn => {
          btn.textContent = 'Gerenciar Assinatura';
          btn.onclick = () => window.location.href = 'perfil.html';
        });
      }
    })
    .catch(error => {
      console.warn('Erro ao verificar status da assinatura:', error);
    });
}

// Verificar status ao carregar a página
document.addEventListener('DOMContentLoaded', verificarStatusAssinatura);

// Torna as funções globais para uso inline no HTML
window.assinarPlano = assinarPlano;
window.getUsuarioLogado = getUsuarioLogado;
window.verificarStatusAssinatura = verificarStatusAssinatura;
