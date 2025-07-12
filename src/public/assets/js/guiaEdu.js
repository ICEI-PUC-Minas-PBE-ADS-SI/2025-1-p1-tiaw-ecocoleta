// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
    });
}

// Window resize handler to reset nav display
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        if (nav) nav.style.display = 'block';
    } else {
        if (nav) nav.style.display = 'none';
    }
});

// Quiz functionality
const options = document.querySelectorAll('.option');
if (options.length) {
    options.forEach(option => {
        option.addEventListener('click', () => {
            // Clear previous selections
            options.forEach(opt => {
                opt.style.backgroundColor = '';
                opt.querySelector('input').checked = false;
            });
            
            // Select current option
            option.style.backgroundColor = '#e2f8ef';
            option.querySelector('input').checked = true;
        });
    });
}

// Search functionality
const searchInput = document.querySelector('.search-container input');
const searchBtn = document.querySelector('.search-btn');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

function performSearch(query) {
    if (!query) return;
    
    // In a real application, this would search the database
    // For this demo, we'll just log the search query
    console.log('Searching for:', query);
    alert(`Buscando por: ${query}`);
    
    // Clear the search input
    if (searchInput) searchInput.value = '';
}

// Create placeholder logo
function createPlaceholderLogo() {
    const logoImgs = document.querySelectorAll('.logo img');
    
    logoImgs.forEach(img => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = 40;
        canvas.height = 40;
        
        // Draw recycling symbol
        ctx.fillStyle = '#0D9F6F';
        ctx.beginPath();
        ctx.arc(20, 20, 18, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(15, 10);
        ctx.lineTo(25, 10);
        ctx.lineTo(20, 20);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(10, 25);
        ctx.lineTo(15, 15);
        ctx.lineTo(25, 25);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(30, 15);
        ctx.lineTo(25, 25);
        ctx.lineTo(15, 25);
        ctx.closePath();
        ctx.fill();
        
        // Set the image source to the canvas data URL
        img.src = canvas.toDataURL();
    });
}

// Create placeholder hero image
function createPlaceholderHeroImage() {
    const heroImg = document.querySelector('.hero-image img');
    
    if (heroImg) {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = 500;
        canvas.height = 400;
        
        // Draw background
        ctx.fillStyle = '#e2f8ef';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw recycling bins
        drawRecyclingBin(ctx, 100, 250, '#0D9F6F');
        drawRecyclingBin(ctx, 200, 250, '#3B82F6');
        drawRecyclingBin(ctx, 300, 250, '#F59E0B');
        
        // Draw recycling symbol
        ctx.fillStyle = '#0D9F6F';
        ctx.beginPath();
        ctx.arc(250, 150, 50, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(230, 120);
        ctx.lineTo(270, 120);
        ctx.lineTo(250, 150);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(210, 180);
        ctx.lineTo(230, 150);
        ctx.lineTo(270, 180);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(290, 150);
        ctx.lineTo(270, 180);
        ctx.lineTo(230, 180);
        ctx.closePath();
        ctx.fill();
        
        // Set the image source to the canvas data URL
        heroImg.src = canvas.toDataURL();
    }
}

function drawRecyclingBin(ctx, x, y, color) {
    // Bin body
    ctx.fillStyle = color;
    ctx.fillRect(x - 30, y - 60, 60, 80);
    
    // Bin lid
    ctx.fillStyle = darkenColor(color, 20);
    ctx.beginPath();
    ctx.moveTo(x - 35, y - 60);
    ctx.lineTo(x + 35, y - 60);
    ctx.lineTo(x + 30, y - 70);
    ctx.lineTo(x - 30, y - 70);
    ctx.closePath();
    ctx.fill();
    
    // Recycling symbol on bin
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y - 30, 10, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = color;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♻️', x, y - 30);
}

// Helper function to darken a color
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (
        0x1000000 +
        (R < 0 ? 0 : R) * 0x10000 +
        (G < 0 ? 0 : G) * 0x100 +
        (B < 0 ? 0 : B)
    ).toString(16).slice(1);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize placeholder images
    createPlaceholderLogo();
    createPlaceholderHeroImage();
    
    // Modal "Saiba Mais" functionality
    const modal = document.getElementById('materialModal');
    const modalTitle = document.getElementById('modalTitle');
    const closeModal = document.getElementById('closeModal');
    const learnMoreButtons = document.querySelectorAll('.learn-more');
    
    console.log('Modal elements found:', {
        modal: !!modal,
        modalTitle: !!modalTitle,
        closeModal: !!closeModal,
        learnMoreButtons: learnMoreButtons.length
    });

// Dados dos materiais
const materialsData = {
    vidro: {
        title: 'Vidro',
        recyclable: [
            'Garrafas de bebidas (água, refrigerante, cerveja)',
            'Potes de conserva e geleia',
            'Frascos de perfume e cosméticos',
            'Copos de vidro',
            'Embalagens de medicamentos',
            'Vidros de janela (sem tinta)'
        ],
        nonRecyclable: [
            'Espelhos',
            'Vidros temperados',
            'Lâmpadas fluorescentes',
            'Tubos de TV e monitores',
            'Vidros de carro',
            'Cristais e porcelanas',
            'Vidros com tinta ou decoração'
        ],
        preparation: [
            'Remova tampas e rótulos quando possível',
            'Lave os recipientes para remover restos de alimentos',
            'Não é necessário retirar pequenos rótulos colados',
            'Separe por cores se solicitado pela coleta local',
            'Embale vidros quebrados em papel jornal'
        ],
        impact: 'O vidro é 100% reciclável e pode ser reciclado infinitas vezes sem perder qualidade. A reciclagem do vidro economiza energia (30% menos que a produção de vidro novo), reduz a emissão de CO2 e preserva recursos naturais como areia, calcário e barrilha.',
        tips: [
            {
                icon: '♻️',
                text: 'O vidro pode ser reciclado infinitas vezes mantendo sua qualidade'
            },
            {
                icon: '⚡',
                text: 'A reciclagem economiza 30% da energia necessária para produzir vidro novo'
            },
            {
                icon: '🌍',
                text: 'Cada tonelada de vidro reciclado evita a extração de 1,2 toneladas de matéria-prima'
            }
        ]
    },
    plastico: {
        title: 'Plástico',
        recyclable: [
            'Garrafas PET (refrigerante, água)',
            'Embalagens de produtos de limpeza',
            'Potes de margarina e sorvete',
            'Sacolas plásticas',
            'Tampas plásticas',
            'Embalagens de xampu e condicionador',
            'Copos descartáveis'
        ],
        nonRecyclable: [
            'Plásticos sujos com restos de comida',
            'Fraldas descartáveis',
            'Embalagens metalizadas (salgadinhos)',
            'Espuma (isopor)',
            'Cabos de panela',
            'Brinquedos quebrados',
            'Plásticos misturados com outros materiais'
        ],
        preparation: [
            'Lave as embalagens para remover restos de alimentos',
            'Retire tampas e rótulos quando possível',
            'Amasse garrafas PET para economizar espaço',
            'Junte sacolas plásticas em uma sacola maior',
            'Verifique o símbolo de reciclagem no produto'
        ],
        impact: 'A reciclagem do plástico reduz significativamente a poluição ambiental, especialmente nos oceanos. Economiza petróleo (matéria-prima), reduz emissões de gases do efeito estufa e diminui o tempo de decomposição no meio ambiente (que pode levar até 400 anos).',
        tips: [
            {
                icon: '🌊',
                text: 'Evite que plásticos cheguem aos oceanos - cada minuto 1 caminhão de lixo plástico é despejado no mar'
            },
            {
                icon: '⏰',
                text: 'Plásticos podem levar até 400 anos para se decomper na natureza'
            },
            {
                icon: '🛢️',
                text: 'Reciclar 1 tonelada de plástico economiza até 2 toneladas de petróleo'
            }
        ]
    },
    papel: {
        title: 'Papel',
        recyclable: [
            'Jornais e revistas',
            'Papelão limpo',
            'Papel de escritório',
            'Cadernos e livros',
            'Embalagens de papel',
            'Envelopes (sem janela plástica)',
            'Caixas de cereal e medicamentos'
        ],
        nonRecyclable: [
            'Papel higiênico usado',
            'Papel carbono',
            'Papel plastificado',
            'Papel parafinado',
            'Guardanapos e lenços usados',
            'Papel sujo com gordura',
            'Fitas adesivas coladas no papel'
        ],
        preparation: [
            'Remova grampos, espirais e clipes metálicos',
            'Tire fitas adesivas quando possível',
            'Não amasse o papel desnecessariamente',
            'Separe papéis por tipo se solicitado',
            'Mantenha o papel seco'
        ],
        impact: 'A reciclagem do papel preserva florestas, economiza água (60% menos) e energia (50% menos), reduz a poluição do ar em 74% e a poluição da água em 35%. Cada tonelada de papel reciclado evita o corte de 15 a 20 árvores.',
        tips: [
            {
                icon: '🌳',
                text: 'Cada tonelada de papel reciclado preserva 15-20 árvores'
            },
            {
                icon: '💧',
                text: 'A reciclagem economiza 60% da água necessária para produzir papel novo'
            },
            {
                icon: '📄',
                text: 'O papel pode ser reciclado de 5 a 7 vezes antes de perder qualidade'
            }
        ]
    },
    organico: {
        title: 'Orgânico',
        recyclable: [
            'Cascas de frutas e verduras',
            'Restos de comida (sem tempero excessivo)',
            'Borra de café e chá',
            'Cascas de ovos',
            'Aparas de grama e folhas',
            'Galhos pequenos e serragem',
            'Papel toalha usado (sem produtos químicos)'
        ],
        nonRecyclable: [
            'Carnes e ossos',
            'Laticínios',
            'Óleos e gorduras',
            'Fezes de animais',
            'Plantas doentes',
            'Cinzas de carvão',
            'Produtos com agrotóxicos em excesso'
        ],
        preparation: [
            'Separe em recipiente próprio com tampa',
            'Misture materiais secos e úmidos',
            'Corte restos grandes em pedaços menores',
            'Mantenha equilibrio entre carbono e nitrogênio',
            'Revire o material periodicamente'
        ],
        impact: 'A compostagem de resíduos orgânicos reduz em até 40% o lixo doméstico, diminui a emissão de metano em aterros, produz adubo natural rico em nutrientes e melhora a estrutura do solo, contribuindo para a sustentabilidade agrícola.',
        tips: [
            {
                icon: '🌱',
                text: 'Resíduos orgânicos representam cerca de 40% do lixo doméstico'
            },
            {
                icon: '🏠',
                text: 'Você pode fazer compostagem em casa, mesmo em apartamentos pequenos'
            },
            {
                icon: '🌾',
                text: 'O composto orgânico é um excelente adubo natural para plantas'
            }
        ]
    },
    eletronicos: {
        title: 'Eletrônicos',
        recyclable: [
            'Celulares e smartphones',
            'Computadores e notebooks',
            'Televisores',
            'Fios e cabos',
            'Carregadores',
            'Eletrodomésticos pequenos',
            'Componentes eletrônicos'
        ],
        nonRecyclable: [
            'Equipamentos com vazamento de substâncias',
            'Dispositivos com materiais radioativos',
            'Equipamentos militares',
            'Dispositivos médicos implantáveis'
        ],
        preparation: [
            'Faça backup e delete dados pessoais',
            'Remova baterias quando possível',
            'Mantenha os equipamentos inteiros',
            'Procure pontos de coleta especializados',
            'Guarde manuais e acessórios junto'
        ],
        impact: 'O e-lixo é uma das categorias de resíduo que mais cresce no mundo. Contém metais preciosos recuperáveis (ouro, prata, cobre) e substâncias tóxicas que podem contaminar solo e água. A reciclagem adequada recupera materiais valiosos e evita poluição.',
        tips: [
            {
                icon: '📱',
                text: 'O e-lixo é a categoria de resíduo que mais cresce no mundo'
            },
            {
                icon: '⚠️',
                text: 'Contém substâncias tóxicas que podem contaminar o meio ambiente'
            },
            {
                icon: '💎',
                text: 'Celulares contêm mais ouro por tonelada que minérios de ouro'
            }
        ]
    },
    baterias: {
        title: 'Baterias',
        recyclable: [
            'Pilhas alcalinas',
            'Baterias de celular',
            'Baterias de notebook',
            'Pilhas recarregáveis',
            'Baterias de carro',
            'Baterias de relógio',
            'Pilhas de controle remoto'
        ],
        nonRecyclable: [
            'Baterias vazando ácido',
            'Baterias danificadas fisicamente',
            'Baterias de dispositivos médicos (procure descarte especializado)'
        ],
        preparation: [
            'Mantenha os polos protegidos com fita',
            'Não misture tipos diferentes de bateria',
            'Armazene em local seco',
            'Leve para pontos de coleta específicos',
            'Nunca desmonte as baterias'
        ],
        impact: 'Baterias contêm metais pesados (mercúrio, chumbo, cádmio) que são altamente tóxicos ao meio ambiente e à saúde humana. O descarte inadequado contamina solo e lençóis freáticos. A reciclagem recupera metais valiosos e evita contaminação.',
        tips: [
            {
                icon: '☠️',
                text: 'Uma pilha pode contaminar até 20 mil litros de água'
            },
            {
                icon: '🔋',
                text: 'Baterias recarregáveis duram mais e geram menos resíduo'
            },
            {
                icon: '🏪',
                text: 'Muitas lojas que vendem pilhas têm pontos de coleta'
            }
        ]
    }
};

// Event listeners para os botões "Saiba mais"
learnMoreButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Botão clicado!', button);
        const materialType = button.getAttribute('data-material');
        console.log('Material type:', materialType);
        openModal(materialType);
    });
});

// Event listener para fechar modal
if (closeModal) {
    closeModal.addEventListener('click', () => {
        closeModalFunction();
    });
}

// Event listener para fechar modal clicando fora
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunction();
        }
    });
}

// Event listener para fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModalFunction();
    }
});

function openModal(materialType) {
    console.log('openModal chamada com:', materialType);
    const data = materialsData[materialType];
    if (!data) {
        console.error('Dados não encontrados para:', materialType);
        return;
    }
    
    console.log('Dados encontrados:', data);
    
    // Preencher título
    if (modalTitle) {
        modalTitle.textContent = data.title;
        console.log('Título definido:', data.title);
    } else {
        console.error('modalTitle não encontrado');
    }
    
    // Preencher itens recicláveis
    const recyclableList = document.getElementById('recyclable-items');
    if (recyclableList) {
        recyclableList.innerHTML = '';
        data.recyclable.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            recyclableList.appendChild(li);
        });
        console.log('Itens recicláveis adicionados');
    } else {
        console.error('recyclable-items não encontrado');
    }
    
    // Preencher itens não recicláveis
    const nonRecyclableList = document.getElementById('non-recyclable-items');
    if (nonRecyclableList) {
        nonRecyclableList.innerHTML = '';
        data.nonRecyclable.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            nonRecyclableList.appendChild(li);
        });
        console.log('Itens não recicláveis adicionados');
    } else {
        console.error('non-recyclable-items não encontrado');
    }
    
    // Preencher passos de preparação
    const preparationList = document.getElementById('preparation-steps');
    if (preparationList) {
        preparationList.innerHTML = '';
        data.preparation.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            preparationList.appendChild(li);
        });
        console.log('Passos de preparação adicionados');
    } else {
        console.error('preparation-steps não encontrado');
    }
    
    // Preencher impacto ambiental
    const impactP = document.getElementById('environmental-impact');
    if (impactP) {
        impactP.textContent = data.impact;
        console.log('Impacto ambiental adicionado');
    } else {
        console.error('environmental-impact não encontrado');
    }
    
    // Preencher dicas importantes
    const tipsDiv = document.getElementById('important-tips');
    if (tipsDiv) {
        tipsDiv.innerHTML = '';
        data.tips.forEach(tip => {
            const tipCard = document.createElement('div');
            tipCard.className = 'tip-card';
            tipCard.innerHTML = `
                <span class="tip-icon">${tip.icon}</span>
                ${tip.text}
            `;
            tipsDiv.appendChild(tipCard);
        });
        console.log('Dicas importantes adicionadas');
    } else {
        console.error('important-tips não encontrado');
    }
    
    // Mostrar modal
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Modal mostrado');
    } else {
        console.error('modal não encontrado');
    }
}

function closeModalFunction() {
    console.log('closeModalFunction chamada');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Modal fechado');
    } else {
        console.error('modal não encontrado para fechar');
    }
}

}); // Fim do DOMContentLoaded