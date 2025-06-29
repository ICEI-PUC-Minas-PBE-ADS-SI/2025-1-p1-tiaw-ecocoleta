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

// Funcionalidade de Download dos Materiais
document.addEventListener('DOMContentLoaded', function() {
    // Mapeamento dos arquivos disponíveis para download
    const downloadFiles = {
        'guia-bolso': {
            url: 'assets/downloads/guia-de-bolso-reciclagem.pdf',
            filename: 'Guia_de_Bolso_Reciclagem.pdf',
            type: 'application/pdf'
        },
        'infografico': {
            url: 'assets/downloads/infografico-reciclagem.png',
            filename: 'Infografico_Simbolos_Reciclagem.png',
            type: 'image/png'
        },
        'cartilha': {
            url: 'assets/downloads/cartilha-reciclagem-completa.pdf',
            filename: 'Cartilha_Reciclagem_Completa.pdf',
            type: 'application/pdf'
        }
    };

    // Função para criar conteúdo dinâmico dos PDFs
    function generatePDFContent(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        
        // Fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Título
        ctx.fontName = 'Arial';
        ctx.fillStyle = '#2d5a27';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        
        if (type === 'guia-bolso') {
            ctx.fillText('GUIA DE BOLSO', canvas.width/2, 60);
            ctx.fillText('RECICLAGEM', canvas.width/2, 100);
            
            ctx.font = '16px Arial';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'left';
            
            const tips = [
                '🗑️ PAPEL: Jornais, revistas, cadernos',
                '♻️ PLÁSTICO: Garrafas PET, embalagens',
                '🍾 VIDRO: Garrafas, potes, frascos',
                '🔩 METAL: Latas de alumínio, ferro',
                '🍂 ORGÂNICO: Restos de comida, folhas',
                '',
                '❌ NÃO RECICLE:',
                '• Papel higiênico usado',
                '• Vidros quebrados',
                '• Pilhas e baterias',
                '• Remédios vencidos'
            ];
            
            let y = 150;
            tips.forEach(tip => {
                ctx.fillText(tip, 50, y);
                y += 30;
            });
        }
        
        return canvas.toDataURL('image/png');
    }

    // Função para gerar imagem do infográfico
    function generateInfographic() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Fundo
        ctx.fillStyle = '#f0f8f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Título
        ctx.fillStyle = '#2d5a27';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SÍMBOLOS DA RECICLAGEM', canvas.width/2, 50);
        
        // Símbolos e descrições
        const symbols = [
            { symbol: '♻️', color: '#4CAF50', text: 'Reciclável', desc: 'Material pode ser reciclado' },
            { symbol: '🗑️', color: '#FF5722', text: 'Lixo Comum', desc: 'Descarte no lixo comum' },
            { symbol: '⚠️', color: '#FF9800', text: 'Cuidado', desc: 'Material perigoso' },
            { symbol: '🔋', color: '#9C27B0', text: 'Eletrônico', desc: 'Descarte especial' }
        ];
        
        let x = 100;
        let y = 150;
        
        symbols.forEach((item, index) => {
            if (index % 2 === 0 && index > 0) {
                y += 200;
                x = 100;
            }
            
            // Símbolo
            ctx.font = '60px Arial';
            ctx.fillText(item.symbol, x, y);
            
            // Texto
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = item.color;
            ctx.fillText(item.text, x, y + 40);
            
            ctx.font = '14px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText(item.desc, x, y + 60);
            
            x += 300;
        });
        
        return canvas.toDataURL('image/png');
    }

    // Função para download usando blob
    function downloadFile(fileKey) {
        const file = downloadFiles[fileKey];
        if (!file) return;

        let content;
        let mimeType = file.type;
        
        if (fileKey === 'infografico') {
            // Gerar infográfico
            content = generateInfographic();
            // Converter dataURL para blob
            const byteString = atob(content.split(',')[1]);
            const mimeString = content.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: 'image/png' });
            triggerDownload(blob, file.filename);
        } else {
            // Para PDFs, criar um conteúdo simples
            const pdfContent = createPDFContent(fileKey);
            const blob = new Blob([pdfContent], { type: 'text/plain' });
            triggerDownload(blob, file.filename.replace('.pdf', '.txt'));
        }
    }

    // Função para criar conteúdo de PDF como texto
    function createPDFContent(type) {
        if (type === 'guia-bolso') {
            return `GUIA DE BOLSO - RECICLAGEM
=============================

MATERIAIS RECICLÁVEIS:
• Papel: jornais, revistas, cadernos, papel de escritório
• Plástico: garrafas PET, embalagens, potes
• Vidro: garrafas, potes, frascos (sem tampa)
• Metal: latas de alumínio, latas de conserva

MATERIAIS NÃO RECICLÁVEIS:
• Papel higiênico usado
• Papel carbono
• Vidros quebrados ou temperados
• Pilhas e baterias
• Remédios vencidos

DICAS IMPORTANTES:
✓ Lave os recipientes antes de descartar
✓ Remova tampas e rótulos quando possível
✓ Separe por tipo de material
✓ Procure pontos de coleta seletiva

EcoColeta - Cuidando do Meio Ambiente`;
        } else if (type === 'cartilha') {
            return `CARTILHA COMPLETA DE RECICLAGEM
===================================

CAPÍTULO 1: INTRODUÇÃO À RECICLAGEM
A reciclagem é fundamental para a preservação do meio ambiente...

CAPÍTULO 2: TIPOS DE MATERIAIS
- Papel e Papelão
- Plásticos
- Vidros
- Metais
- Orgânicos

CAPÍTULO 3: PROCESSO DE SEPARAÇÃO
1. Identifique o material
2. Limpe adequadamente
3. Separe por categoria
4. Armazene corretamente

CAPÍTULO 4: IMPACTO AMBIENTAL
A reciclagem reduz:
- Consumo de recursos naturais
- Poluição do ar e água
- Ocupação de aterros
- Emissão de gases do efeito estufa

CAPÍTULO 5: COMO PARTICIPAR
- Encontre pontos de coleta
- Participe de campanhas
- Eduque familiares e amigos
- Use o aplicativo EcoColeta

Para mais informações, visite: www.ecocoleta.com.br
EcoColeta - Juntos por um planeta mais limpo!`;
        }
        return '';
    }

    // Função para acionar o download
    function triggerDownload(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Mostrar mensagem de sucesso
        showDownloadSuccess(filename);
    }

    // Função para mostrar mensagem de sucesso
    function showDownloadSuccess(filename) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle" style="font-size: 18px;"></i>
                <div>
                    <strong>Download Concluído!</strong><br>
                    <small>${filename}</small>
                </div>
            </div>
        `;
        
        // Adicionar animação CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Adicionar event listeners aos botões de download
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const card = this.closest('.download-card');
            const title = card.querySelector('h3').textContent;
            const description = card.querySelector('p').textContent;
            
            // Adicionar efeito visual de loading
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
            this.disabled = true;
            
            // Simular delay de processamento
            setTimeout(() => {
                generatePDF(title, description);
                
                // Restaurar botão
                this.innerHTML = originalText;
                this.disabled = false;
            }, 2000);
        });
    });
});

function generatePDF(title, description) {
    // Aguarda um pouco para garantir que a biblioteca foi carregada
    setTimeout(() => {
        try {
            // Verifica se jsPDF está disponível - versão UMD
            if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
                showErrorModal('Erro: Biblioteca PDF não carregada. Verifique sua conexão com a internet.');
                console.error('jsPDF não está disponível');
                return;
            }
            
            // Acessa jsPDF da forma correta para versão UMD
            const { jsPDF } = window.jspdf || window;
            
            if (!jsPDF) {
                throw new Error('Não foi possível acessar jsPDF');
            }
            
            const doc = new jsPDF();
            
            // Configurações do PDF
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let yPosition = 30;
            
            // Cria uma primeira página especial para a cartilha
            let splitDescription = null;
            if (title.includes('Cartilha')) {
                addCartilhaCoverPage(doc, pageWidth, pageHeight, margin);
                doc.addPage();
                yPosition = 30;
            } else {
                // Adiciona cabeçalho para outros documentos
                doc.setFontSize(20);
                doc.setTextColor(13, 159, 111); // Cor verde do EcoColeta
                doc.text('EcoColeta - Guia Educativo', margin, yPosition);
                
                yPosition += 20;
                
                // Adiciona título do documento
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text(title, margin, yPosition);
                
                yPosition += 15;
                
                // Adiciona descrição
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                
                // Quebra o texto da descrição em múltiplas linhas se necessário
                splitDescription = doc.splitTextToSize(description, pageWidth - 2 * margin);
                doc.text(splitDescription, margin, yPosition);
                
                yPosition += splitDescription.length * 7 + 15;
            }
            
            // Adiciona conteúdo específico baseado no tipo
            if (title.includes('Guia de Bolso')) {
                addGuiaBolsoContent(doc, margin, yPosition, pageWidth);
            } else if (title.includes('Infográfico')) {
                addInfograficoContent(doc, margin, yPosition, pageWidth);
            } else if (title.includes('Cartilha')) {
                addBookletContent(doc, margin, yPosition);
            }
            
            // Adiciona rodapé
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('EcoColeta © 2025 - Preservando o meio ambiente através da educação', 
                     margin, pageHeight - 10);
        
        // Salva o PDF
        const fileName = title.toLowerCase().replace(/\s+/g, '-') + '.pdf';
        doc.save(fileName);
        
        // PDF gerado com sucesso - download iniciado
        console.log('PDF gerado com sucesso:', fileName);
        showDownloadModal();
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showErrorModal('Erro ao gerar PDF: ' + error.message + '. Tente recarregar a página.');
    }
    }, 100); // Pequeno delay para garantir que a biblioteca carregou
}

function addGuiaBolsoContent(doc, margin, yPosition, pageWidth) {
    const materials = [
        {
            name: 'PAPEL',
            recyclable: ['Jornais e revistas', 'Papelão limpo', 'Papel de escritório', 'Cadernos e livros'],
            nonRecyclable: ['Papel higiênico usado', 'Papel carbono', 'Papel plastificado', 'Guardanapos usados']
        },
        {
            name: 'PLÁSTICO',
            recyclable: ['Garrafas PET', 'Embalagens de produtos de limpeza', 'Potes de iogurte', 'Sacolas plásticas'],
            nonRecyclable: ['Isopor', 'Adesivos', 'Fraldas descartáveis', 'Embalagens metalizadas']
        },
        {
            name: 'VIDRO',
            recyclable: ['Garrafas de bebidas', 'Potes de conserva', 'Frascos de perfume', 'Vidros de remédio'],
            nonRecyclable: ['Espelhos', 'Vidros de janela', 'Lâmpadas', 'Cristais']
        },
        {
            name: 'METAL',
            recyclable: ['Latas de alumínio', 'Latas de aço', 'Tampas metálicas', 'Fios de cobre'],
            nonRecyclable: ['Pilhas e baterias', 'Objetos com tinta', 'Aerossóis', 'Materiais eletrônicos']
        }
    ];
    
    materials.forEach(material => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 30;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(13, 159, 111);
        doc.text(material.name, margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 128, 0);
        doc.text('✓ PODE SER RECICLADO:', margin, yPosition);
        yPosition += 7;
        
        doc.setTextColor(0, 0, 0);
        material.recyclable.forEach(item => {
            doc.text(`• ${item}`, margin + 5, yPosition);
            yPosition += 5;
        });
        
        yPosition += 3;
        doc.setTextColor(255, 0, 0);
        doc.text('✗ NÃO PODE SER RECICLADO:', margin, yPosition);
        yPosition += 7;
        
        doc.setTextColor(0, 0, 0);
        material.nonRecyclable.forEach(item => {
            doc.text(`• ${item}`, margin + 5, yPosition);
            yPosition += 5;
        });
        
        yPosition += 15;
    });
}

function addInfograficoContent(doc, margin, yPosition, pageWidth) {
    doc.setFontSize(14);
    doc.setTextColor(13, 159, 111);
    doc.text('SÍMBOLOS DE RECICLAGEM', margin, yPosition);
    yPosition += 15;
    
    const symbols = [
        { code: '1 - PET', description: 'Garrafas de refrigerante, água, óleo' },
        { code: '2 - PEAD', description: 'Embalagens de detergente, xampu' },
        { code: '3 - PVC', description: 'Tubos, mangueiras, embalagens' },
        { code: '4 - PEBD', description: 'Sacolas plásticas, filmes' },
        { code: '5 - PP', description: 'Potes de margarina, tampas' },
        { code: '6 - PS', description: 'Copos descartáveis, isopor' },
        { code: '7 - OUTROS', description: 'Outros tipos de plástico' }
    ];
    
    doc.setFontSize(12);
    symbols.forEach(symbol => {
        doc.setTextColor(13, 159, 111);
        doc.text(symbol.code, margin, yPosition);
        doc.setTextColor(0, 0, 0);
        doc.text(symbol.description, margin + 30, yPosition);
        yPosition += 8;
    });
    
    yPosition += 15;
    doc.setFontSize(14);
    doc.setTextColor(13, 159, 111);
    doc.text('CORES DA COLETA SELETIVA', margin, yPosition);
    yPosition += 15;
    
    const colors = [
        { color: 'AZUL', material: 'Papel' },
        { color: 'VERMELHO', material: 'Plástico' },
        { color: 'VERDE', material: 'Vidro' },
        { color: 'AMARELO', material: 'Metal' },
        { color: 'MARROM', material: 'Orgânico' }
    ];
    
    doc.setFontSize(12);
    colors.forEach(item => {
        doc.setTextColor(13, 159, 111);
        doc.text(item.color, margin, yPosition);
        doc.setTextColor(0, 0, 0);
        doc.text(item.material, margin + 30, yPosition);
        yPosition += 8;
    });
}

// Funções auxiliares para conteúdo específico dos PDFs

function addBookletContent(doc, margin, yPosition) {
    // Página de conteúdo da cartilha
    doc.setFontSize(18);
    doc.setTextColor(13, 159, 111);
    doc.setFont('helvetica', 'bold');
    doc.text('MANUAL COMPLETO DE RECICLAGEM', margin, yPosition);
    yPosition += 25;
    
    const sections = [
        {
            title: '1. IMPORTÂNCIA DA RECICLAGEM',
            content: [
                'A reciclagem é fundamental para:',
                '• Preservar recursos naturais finitos',
                '• Reduzir a poluição do ar, água e solo',
                '• Economizar energia na produção',
                '• Criar empregos e renda',
                '• Diminuir resíduos em aterros sanitários',
                '• Combater as mudanças climáticas'
            ]
        },
        {
            title: '2. SEPARAÇÃO DOS MATERIAIS',
            content: [
                'Cores padronizadas da coleta seletiva:',
                '• AZUL: Papel e papelão',
                '• VERMELHO: Plástico',
                '• VERDE: Vidro',
                '• AMARELO: Metal',
                '• MARROM: Orgânico',
                '• CINZA: Resíduos não recicláveis'
            ]
        },
        {
            title: '3. PREPARAÇÃO DOS MATERIAIS',
            content: [
                'Antes de descartar os materiais:',
                '• Lave embalagens removendo restos de alimentos',
                '• Retire tampas e rótulos quando possível',
                '• Separe por tipo de material',
                '• Armazene em local limpo e seco',
                '• Não misture materiais diferentes',
                '• Evite amassar excessivamente'
            ]
        },
        {
            title: '4. MATERIAIS RECICLÁVEIS',
            content: [
                'PAPEL: Jornais, revistas, caixas, papelão limpo',
                'PLÁSTICO: Garrafas PET, embalagens, potes',
                'VIDRO: Garrafas, potes, frascos (sem tampas)',
                'METAL: Latas de alumínio, aço, tampas metálicas',
                '',
                'ATENÇÃO: Sempre verifique se estão limpos!'
            ]
        },
        {
            title: '5. MATERIAIS NÃO RECICLÁVEIS',
            content: [
                'PAPEL: Higiênico usado, carbono, plastificado',
                'PLÁSTICO: Isopor, adesivos, fraldas descartáveis',
                'VIDRO: Espelhos, lâmpadas, vidros temperados',
                'METAL: Pilhas, baterias, objetos com tinta',
                '',
                'Estes materiais necessitam descarte especial!'
            ]
        },
        {
            title: '6. IMPACTO AMBIENTAL',
            content: [
                'Benefícios da reciclagem:',
                '• 1 tonelada de papel reciclado = 20 árvores preservadas',
                '• 1 tonelada de plástico reciclado = 1 tonelada de petróleo economizada',
                '• Alumínio pode ser reciclado infinitas vezes',
                '• Vidro é 100% reciclável sem perda de qualidade',
                '• Redução de 70% no consumo de energia'
            ]
        },
        {
            title: '7. DICAS PRÁTICAS',
            content: [
                'Para o dia a dia:',
                '• Tenha recipientes separados em casa',
                '• Reutilize materiais sempre que possível',
                '• Prefira produtos com embalagens recicláveis',
                '• Participe de programas de coleta seletiva',
                '• Eduque familiares e amigos',
                '• Procure pontos de coleta especializados'
            ]
        }
    ];
    
    sections.forEach(section => {
        // Verifica se precisa de nova página
        if (yPosition > 220) {
            doc.addPage();
            yPosition = 30;
        }
        
        // Título da seção
        doc.setFontSize(14);
        doc.setTextColor(13, 159, 111);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, margin, yPosition);
        yPosition += 12;
        
        // Conteúdo da seção
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        section.content.forEach(line => {
            if (line === '') {
                yPosition += 3; // Espaço em branco
            } else if (line.startsWith('•')) {
                doc.text(line, margin + 5, yPosition);
                yPosition += 6;
            } else if (line.includes(':')) {
                // Linhas com destaque (títulos de subsecção)
                doc.setFont('helvetica', 'bold');
                doc.text(line, margin, yPosition);
                doc.setFont('helvetica', 'normal');
                yPosition += 6;
            } else {
                doc.text(line, margin, yPosition);
                yPosition += 6;
            }
        });
        
        yPosition += 10; // Espaço entre seções
    });
    
    // Adiciona uma página final com informações de contato e recursos
    doc.addPage();
    yPosition = 30;
    
    doc.setFontSize(16);
    doc.setTextColor(13, 159, 111);
    doc.setFont('helvetica', 'bold');
    doc.text('RECURSOS ADICIONAIS', margin, yPosition);
    yPosition += 20;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const additionalInfo = [
        'Para mais informações sobre reciclagem:',
        '',
        '• Visite nosso site: www.ecocoleta.com.br',
        '• Baixe nosso aplicativo móvel',
        '• Siga-nos nas redes sociais',
        '• Participe de eventos comunitários',
        '',
        'Lembre-se: Pequenas ações fazem grande diferença!',
        'Juntos podemos construir um futuro mais sustentável.'
    ];
    
    additionalInfo.forEach(line => {
        if (line === '') {
            yPosition += 6;
        } else if (line.startsWith('•')) {
            doc.text(line, margin + 5, yPosition);
            yPosition += 8;
        } else {
            doc.text(line, margin, yPosition);
            yPosition += 8;
        }
    });
}

// Função para criar página de capa da cartilha
function addCartilhaCoverPage(doc, pageWidth, pageHeight, margin) {
    // Fundo da página (cor suave)
    doc.setFillColor(240, 248, 255); // Azul muito claro
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Título principal - EcoColeta
    doc.setFontSize(28);
    doc.setTextColor(13, 159, 111); // Verde EcoColeta
    doc.setFont('helvetica', 'bold');
    const titleText = 'EcoColeta';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, 50);
    
    // Subtítulo - Guia Educativo
    doc.setFontSize(18);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    const subtitleText = 'Guia Educativo';
    const subtitleWidth = doc.getTextWidth(subtitleText);
    doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, 70);
    
    // Linha decorativa
    doc.setDrawColor(13, 159, 111);
    doc.setLineWidth(2);
    doc.line(margin, 85, pageWidth - margin, 85);
    
    // Título da cartilha
    doc.setFontSize(24);
    doc.setTextColor(45, 45, 45);
    doc.setFont('helvetica', 'bold');
    const cartilhaTitle = 'Cartilha';
    const cartilhaTitleWidth = doc.getTextWidth(cartilhaTitle);
    doc.text(cartilhaTitle, (pageWidth - cartilhaTitleWidth) / 2, 110);
    
    // Subtítulo da cartilha
    doc.setFontSize(16);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    const cartilhaSubtitle = 'Manual completo de reciclagem';
    const cartilhaSubtitleWidth = doc.getTextWidth(cartilhaSubtitle);
    doc.text(cartilhaSubtitle, (pageWidth - cartilhaSubtitleWidth) / 2, 130);
    
    // Box com informações importantes
    doc.setFillColor(13, 159, 111);
    doc.roundedRect(margin, 150, pageWidth - 2 * margin, 60, 5, 5, 'F');
    
    // Texto dentro do box
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    const boxTitle = 'APRENDA A RECICLAR CORRETAMENTE';
    const boxTitleWidth = doc.getTextWidth(boxTitle);
    doc.text(boxTitle, (pageWidth - boxTitleWidth) / 2, 170);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const boxText = [
        'Este manual contém informações essenciais sobre:',
        '• Como separar materiais recicláveis',
        '• Preparação adequada dos resíduos',
        '• Impacto ambiental da reciclagem',
        '• Dicas práticas para o dia a dia'
    ];
    
    let boxYPosition = 185;
    boxText.forEach(line => {
        if (line.startsWith('•')) {
            doc.text(line, margin + 15, boxYPosition);
        } else {
            const lineWidth = doc.getTextWidth(line);
            doc.text(line, (pageWidth - lineWidth) / 2, boxYPosition);
        }
        boxYPosition += 6;
    });
    
    // Informações do rodapé
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const footerText = 'Preservando o meio ambiente através da educação';
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 30);
    
    // Data de geração
    doc.setFontSize(9);
    const dateText = 'Gerado em: ' + new Date().toLocaleDateString('pt-BR');
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, (pageWidth - dateWidth) / 2, pageHeight - 15);
}

// Funções do Modal de Download
function showDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) {
        modal.classList.add('show');
        // Adicionar evento para fechar com ESC
        document.addEventListener('keydown', handleEscapeKey);
        // Adicionar evento para fechar clicando fora do modal
        modal.addEventListener('click', handleClickOutside);
    }
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) {
        modal.classList.remove('show');
        // Remover event listeners
        document.removeEventListener('keydown', handleEscapeKey);
        modal.removeEventListener('click', handleClickOutside);
    }
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeDownloadModal();
    }
}

function handleClickOutside(event) {
    const modalContent = document.querySelector('.download-modal-content');
    if (event.target === document.getElementById('downloadModal') && !modalContent.contains(event.target)) {
        closeDownloadModal();
    }
}

// Funções do Modal de Erro
function showErrorModal(message) {
    const modal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    if (modal && errorMessage) {
        errorMessage.textContent = message;
        modal.classList.add('show');
        // Adicionar evento para fechar com ESC
        document.addEventListener('keydown', handleErrorEscapeKey);
        // Adicionar evento para fechar clicando fora do modal
        modal.addEventListener('click', handleErrorClickOutside);
    }
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.classList.remove('show');
        // Remover event listeners
        document.removeEventListener('keydown', handleErrorEscapeKey);
        modal.removeEventListener('click', handleErrorClickOutside);
    }
}

function handleErrorEscapeKey(event) {
    if (event.key === 'Escape') {
        closeErrorModal();
    }
}

function handleErrorClickOutside(event) {
    const modalContent = document.querySelector('.error-modal-content');
    if (event.target === document.getElementById('errorModal') && !modalContent.contains(event.target)) {
        closeErrorModal();
    }
}
