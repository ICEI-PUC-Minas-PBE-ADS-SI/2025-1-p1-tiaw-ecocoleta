// assinatura.js - Lógica de assinatura Stripe para EcoColeta

// Detecta ambiente (local ou produção)
const API_BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://two025-1-p1-tiaw-ecocoleta.onrender.com';

// Função para buscar usuário logado do localStorage
function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem('usuarioLogado'));
}

function assinarPlano(plano) {
  const btns = document.querySelectorAll('.btn-stripe');
  btns.forEach(btn => btn.disabled = true);

  // Busca usuário logado
  const usuario = getUsuarioLogado();
  if (!usuario || !usuario.id || !usuario.email) {
    alert('Você precisa estar logado para assinar um plano.');
    btns.forEach(btn => btn.disabled = false);
    return;
  }

  // Chame seu backend para criar a sessão de checkout Stripe para o plano selecionado
  fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plano, userId: usuario.id, email: usuario.email })
  })
  .then(res => res.json())
  .then(data => {
    if (data.sessionId) {
      const stripe = Stripe('pk_test_51ReFqqRpNL9isTvJf9wmRFTjTlSixZY97X4WakMy3opn4a3Muma7BlZs5o79S6I5XloSNvYKthaLQ5XSwpfBfbaq00WYuDMdA7'); // Troque pela sua chave pública Stripe
      stripe.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      alert('Erro ao iniciar checkout. Tente novamente.');
      btns.forEach(btn => btn.disabled = false);
    }
  })
  .catch(() => {
    alert('Erro ao conectar ao servidor.');
    btns.forEach(btn => btn.disabled = false);
  });
}

// Torna as funções globais para uso inline no HTML
window.assinarPlano = assinarPlano;
window.getUsuarioLogado = getUsuarioLogado;
