// comunidades-home.js
// Carrega até 3 comunidades e exibe na home, removendo a section se não houver

const API_BASE_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const section = document.getElementById("community-section");
  if (!section) return;

  try {
    // Buscar todas as comunidades ativas
    const res = await fetch(`${API_BASE_URL}/comunidades?status=ativa`);
    if (!res.ok) throw new Error("Erro ao buscar comunidades");
    let comunidades = await res.json();
    if (!comunidades.length) {
      section.remove();
      return;
    }
    // Mostrar no máximo 3
    comunidades = comunidades.slice(0, 3);
    renderComunidadesHome(comunidades, section);
  } catch (e) {
    // Se erro ou sem comunidades, remove a section
    section.remove();
  }
});

function renderComunidadesHome(comunidades, section) {
  section.innerHTML = `
    <div class="section-header" style="justify-content: center;">
      <h2 style="text-align:center;width:100%;font-size:2.2rem;padding:24px 0 18px 0;">Comunidades em Destaque</h2>
    </div>
    <div class="historias-container" style="justify-content:center;">
      ${comunidades.map(c => `
        <a href="detalhe-comunidade.html?id=${c.id}" class="historia-card">
          <img src="${c.banner || c.imagemCapa || 'assets/img/recycle.svg'}" alt="Imagem da comunidade" />
          <div class="historia-card-content">
            <h3>${c.nome}</h3>
            <p>${c.descricao}</p>
          </div>
          <div class="autor-card-footer">
            <img src="${(c.autor && c.autor.foto) ? c.autor.foto : 'https://placehold.co/50'}" alt="Foto do autor">
            <span>Por ${(c.autor && c.autor.nome) ? c.autor.nome : 'Autor desconhecido'}</span>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}
