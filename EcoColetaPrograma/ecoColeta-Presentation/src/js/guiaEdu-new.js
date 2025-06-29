// Mobile Menu Toggle
const guiaMenuToggle = document.querySelector('.menu-toggle');
const guiaNavElement = document.querySelector('nav');

if (guiaMenuToggle) {
    guiaMenuToggle.addEventListener('click', () => {
        guiaNavElement.style.display = guiaNavElement.style.display === 'block' ? 'none' : 'block';
    });
}

// Window resize handler to reset nav display
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        if (guiaNavElement) guiaNavElement.style.display = 'block';
    } else {
        if (guiaNavElement) guiaNavElement.style.display = 'none';
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

// Página de detalhes dinâmica
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - Inicializando página de detalhes');
    
    // Elementos da página de detalhes
    const detailsPage = document.getElementById('detailsPage');
    const backButton = document.getElementById('backButton');
    const detailsTitle = document.getElementById('detailsTitle');
    const detailsIcon = document.getElementById('detailsIcon');
    const detailsDescription = document.getElementById('detailsDescription');
    const recyclableItems = document.getElementById('recyclableItems');
    const nonRecyclableItems = document.getElementById('nonRecyclableItems');
    const preparationSteps = document.getElementById('preparationSteps');
    const environmentalImpact = document.getElementById('environmentalImpact');
    const importantTips = document.getElementById('importantTips');
    
    // Botões "Saiba mais"
    const learnMoreButtons = document.querySelectorAll('.learn-more');
    
    console.log('Elementos encontrados:', {
        detailsPage: !!detailsPage,
        backButton: !!backButton,
        learnMoreButtons: learnMoreButtons.length
    });

    // Dados dos materiais com ícones
    const materialsData = {
        vidro: {
            title: 'Vidro',
            icon: 'fas fa-wine-bottle',
            description: 'O vidro é um material 100% reciclável que pode ser reutilizado infinitas vezes sem perder qualidade, sendo fundamental para a sustentabilidade ambiental.',
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
            icon: 'fas fa-shopping-bag',
            description: 'O plástico é um dos materiais mais presentes no nosso dia a dia. Sua reciclagem é fundamental para reduzir a poluição e preservar os recursos naturais.',
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
            icon: 'fas fa-newspaper',
            description: 'O papel é um dos materiais mais fáceis de reciclar e sua reciclagem contribui significativamente para a preservação das florestas.',
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
            icon: 'fas fa-leaf',
            description: 'Os resíduos orgânicos representam uma grande parte do lixo doméstico e podem ser transformados em adubo natural através da compostagem.',
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
            icon: 'fas fa-mobile-alt',
            description: 'O lixo eletrônico é uma das categorias que mais cresce no mundo e requer cuidados especiais devido aos materiais tóxicos e valiosos que contém.',
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
            icon: 'fas fa-battery-half',
            description: 'Baterias e pilhas contêm materiais tóxicos que podem causar sérios danos ao meio ambiente se descartadas incorretamente.',
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
            const materialType = button.getAttribute('data-material');
            console.log('Clicou em:', materialType);
            showDetailsPage(materialType);
        });
    });

    // Event listener para o botão voltar
    if (backButton) {
        backButton.addEventListener('click', () => {
            hideDetailsPage();
        });
    }

    // Função para mostrar a página de detalhes
    function showDetailsPage(materialType) {
        const data = materialsData[materialType];
        if (!data) {
            console.error('Material não encontrado:', materialType);
            return;
        }

        console.log('Mostrando detalhes para:', materialType);

        // Preencher título e ícone
        detailsTitle.textContent = data.title;
        detailsIcon.innerHTML = `<i class="${data.icon}"></i>`;
        detailsDescription.textContent = data.description;

        // Preencher itens recicláveis
        recyclableItems.innerHTML = '';
        data.recyclable.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            recyclableItems.appendChild(li);
        });

        // Preencher itens não recicláveis
        nonRecyclableItems.innerHTML = '';
        data.nonRecyclable.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            nonRecyclableItems.appendChild(li);
        });

        // Preencher passos de preparação
        preparationSteps.innerHTML = '';
        data.preparation.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            preparationSteps.appendChild(li);
        });

        // Preencher impacto ambiental
        environmentalImpact.textContent = data.impact;

        // Preencher dicas importantes
        importantTips.innerHTML = '';
        data.tips.forEach(tip => {
            const tipCard = document.createElement('div');
            tipCard.className = 'tip-card';
            tipCard.innerHTML = `
                <div class="tip-icon">${tip.icon}</div>
                <div class="tip-text">${tip.text}</div>
            `;
            importantTips.appendChild(tipCard);
        });

        // Mostrar página de detalhes
        detailsPage.style.display = 'block';
        setTimeout(() => {
            detailsPage.classList.add('active');
        }, 10);

        // Desabilitar scroll da página principal
        document.body.style.overflow = 'hidden';
    }

    // Função para esconder a página de detalhes
    function hideDetailsPage() {
        console.log('Escondendo página de detalhes');
        
        detailsPage.classList.remove('active');
        
        setTimeout(() => {
            detailsPage.style.display = 'none';
        }, 300);

        // Reabilitar scroll da página principal
        document.body.style.overflow = 'auto';
    }

    // Event listener para ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailsPage.classList.contains('active')) {
            hideDetailsPage();
        }
    });
});
