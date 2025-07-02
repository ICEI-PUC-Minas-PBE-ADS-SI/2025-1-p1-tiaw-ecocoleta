// Script para adicionar recompensa

const API_BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://two025-1-p1-tiaw-ecocoleta.onrender.com';


document.getElementById('form-adicionar-recompensa').addEventListener('submit', async function(e) {
  e.preventDefault();
  const imagem = document.getElementById('imagem').value.trim() || 'assets/img/gift.svg'; // Imagem padrão
  const nome = document.getElementById('nome').value;
  const descricao = document.getElementById('descricao').value;
  const pontos = parseInt(document.getElementById('pontos').value, 10);
  const quantidade = parseInt(document.getElementById('quantidade').value, 10);

  // Garante que pontos e quantidade sejam válidos
  if (isNaN(pontos) || pontos < 1) {
    alert('Informe um valor válido para pontos necessários.');
    return;
  }
  if (isNaN(quantidade) || quantidade < 1) {
    alert('Informe uma quantidade disponível válida.');
    return;
  }

  const recompensa = {
    nome,
    descricao,
    imagem,
    pontosNecessarios: pontos,
    quantidade
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/recompensas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recompensa)
    });
    if (!res.ok) throw new Error('Erro ao salvar recompensa');
    alert('Recompensa adicionada com sucesso!');
    window.location.href = 'recompensas.html';
  } catch (err) {
    alert('Erro ao adicionar recompensa: ' + err.message);
  }
});
