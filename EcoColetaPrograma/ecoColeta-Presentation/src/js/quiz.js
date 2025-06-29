// Perguntas do quiz sobre ecocoleta e reciclagem
const quizQuestions = [
    {
        question: "Onde deve ser descartado um copo de vidro quebrado?",
        options: [
            { text: "Contêiner de vidros", correct: false },
            { text: "Lixo comum (rejeitos)", correct: true },
            { text: "Lixo orgânico", correct: false }
        ],
        explanation: "O vidro quebrado deve ser descartado como rejeito (lixo comum) por questões de segurança para os coletores."
    },
    {
        question: "Qual cor de lixeira é destinada ao descarte de papel?",
        options: [
            { text: "Vermelha", correct: false },
            { text: "Amarela", correct: false },
            { text: "Azul", correct: true }
        ],
        explanation: "Na coleta seletiva, a cor azul é destinada para o descarte de papel e papelão."
    },
    {
        question: "Embalagens longa vida (Tetra Pak) devem ser descartadas em qual lixeira?",
        options: [
            { text: "Vermelha (plástico)", correct: false },
            { text: "Amarela (metal)", correct: false },
            { text: "Vermelha ou amarela, dependendo da política local", correct: true }
        ],
        explanation: "Embalagens longa vida são compostas de papel, plástico e alumínio, e normalmente são recicladas junto com plásticos ou metais, dependendo da política local de coleta."
    },
    {
        question: "O que deve ser feito com óleos de cozinha usados?",
        options: [
            { text: "Descartar na pia", correct: false },
            { text: "Armazenar em garrafas PET e levar a pontos de coleta", correct: true },
            { text: "Misturar com outros resíduos orgânicos", correct: false }
        ],
        explanation: "Óleo de cozinha usado deve ser armazenado em garrafas PET e levado a pontos de coleta para ser reciclado, evitando contaminação da água."
    },
    {
        question: "Por que é importante separar os resíduos orgânicos dos recicláveis?",
        options: [
            { text: "Não é importante, tudo pode ser separado nos centros de triagem", correct: false },
            { text: "Para facilitar o processo de compostagem dos resíduos orgânicos", correct: true },
            { text: "Apenas por questões estéticas", correct: false }
        ],
        explanation: "A separação facilita o processo de compostagem dos orgânicos e evita a contaminação dos materiais recicláveis."
    },
    {
        question: "Qual desses itens NÃO é reciclável?",
        options: [
            { text: "Garrafa de vidro", correct: false },
            { text: "Papel higiênico usado", correct: true },
            { text: "Lata de alumínio", correct: false }
        ],
        explanation: "Papel higiênico usado não é reciclável por questões sanitárias e deve ser descartado como rejeito."
    },
    {
        question: "Como devem ser descartados eletrônicos velhos, como celulares e computadores?",
        options: [
            { text: "No lixo comum", correct: false },
            { text: "Em pontos de coleta específicos para lixo eletrônico", correct: true },
            { text: "Junto com outros materiais recicláveis", correct: false }
        ],
        explanation: "Eletrônicos contêm materiais tóxicos e devem ser descartados em pontos específicos de coleta para lixo eletrônico."
    },
    {
        question: "Qual a importância da compostagem para a redução do lixo?",
        options: [
            { text: "Reduz o volume de resíduos enviados para aterros", correct: true },
            { text: "Apenas produz adubo, sem outros benefícios", correct: false },
            { text: "Não tem impacto significativo na redução de resíduos", correct: false }
        ],
        explanation: "A compostagem reduz significativamente o volume de resíduos enviados para aterros, além de produzir adubo orgânico."
    },
    {
        question: "O que significa o conceito dos 5Rs da sustentabilidade?",
        options: [
            { text: "Reciclar, Reduzir, Reutilizar, Repensar e Recusar", correct: true },
            { text: "Reagir, Reduzir, Recolher, Reformar e Reciclar", correct: false },
            { text: "Renovar, Reunir, Recriar, Reconhecer e Refazer", correct: false }
        ],
        explanation: "Os 5Rs são: Reciclar (transformar em novo produto), Reduzir (consumo), Reutilizar (dar novo uso), Repensar (hábitos) e Recusar (produtos com grande impacto ambiental)."
    },
    {
        question: "Qual a destinação correta para pilhas e baterias usadas?",
        options: [
            { text: "Lixo comum", correct: false },
            { text: "Pontos de coleta específicos", correct: true },
            { text: "Lixeiras de metal", correct: false }
        ],
        explanation: "Pilhas e baterias contêm metais pesados tóxicos e devem ser levadas a pontos de coleta específicos."
    }
];

// Variáveis para controle do quiz
let currentQuestionIndex = 0;
let score = 0;
let quizStarted = false;

// DOM Elements - serão inicializados no DOMContentLoaded
let quizContainer;
let progressContainer;
let progressText;
let progressBar;
let questionElement;
let optionsContainer;
let startButton;

// Inicializar o quiz
function initializeQuiz() {
    if (!quizContainer) return;
    
    // Esconder o quiz até que o usuário comece
    if (startButton) {
        startButton.addEventListener('click', startQuiz);
    }
    
    // Carregar a primeira pergunta imediatamente
    loadQuestion();
    
    // Preparar a interface inicial
    updateProgressDisplay();
}

// Iniciar o quiz
function startQuiz() {
    quizStarted = true;
    score = 0;
    currentQuestionIndex = 0;
    
    // Scroll para a seção do quiz
    const knowledgeSection = document.querySelector('.knowledge-test');
    if (knowledgeSection) {
        knowledgeSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Carregar a primeira pergunta
    loadQuestion();
}

// Carregar pergunta atual
function loadQuestion() {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    
    // Atualizar a pergunta
    if (questionElement) {
        questionElement.textContent = currentQuestion.question;
    }
    
    // Limpar opções anteriores
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        // Adicionar novas opções
        currentQuestion.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.id = `option${index + 1}`;
            input.name = 'answer';
            input.value = index;
            
            const label = document.createElement('label');
            label.setAttribute('for', `option${index + 1}`);
            label.textContent = `${String.fromCharCode(65 + index)}) ${option.text}`;
            
            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            
            // Adicionar evento de clique
            optionDiv.addEventListener('click', () => {
                // Limpar seleções anteriores
                document.querySelectorAll('.option').forEach(opt => {
                    opt.style.backgroundColor = '';
                    opt.querySelector('input').checked = false;
                });
                
                // Selecionar opção atual
                optionDiv.style.backgroundColor = '#e2f8ef';
                input.checked = true;
            });
            
            optionsContainer.appendChild(optionDiv);
        });
        
        // Adicionar botão de confirmar
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirmar Resposta';
        confirmButton.classList.add('btn-confirm');
        confirmButton.addEventListener('click', checkAnswer);
        
        optionsContainer.appendChild(confirmButton);
    }
    
    // Atualizar progresso
    updateProgressDisplay();
}

// Verificar resposta
function checkAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    
    if (!selectedOption) {
        showWarningModal();
        return;
    }
    
    const selectedOptionIndex = parseInt(selectedOption.value);
    const currentQuestion = quizQuestions[currentQuestionIndex];
    
    // Verificar se a resposta está correta
    if (currentQuestion.options[selectedOptionIndex].correct) {
        score++;
    }
    
    // Mostrar explicação
    showExplanation(currentQuestion, selectedOptionIndex);
}

// Mostrar explicação da resposta
function showExplanation(question, selectedIndex) {
    if (!optionsContainer) return;
    
    // Limpar opções
    optionsContainer.innerHTML = '';
    
    // Criar div de resultado
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('explanation');
    
    // Verificar se a resposta está correta
    const isCorrect = question.options[selectedIndex].correct;
    
    // Adicionar resultado
    const resultTitle = document.createElement('h3');
    resultTitle.textContent = isCorrect ? '✅ Resposta Correta!' : '❌ Resposta Incorreta';
    resultTitle.style.color = isCorrect ? '#0D9F6F' : '#ef4444';
    resultDiv.appendChild(resultTitle);
    
    // Adicionar explicação
    const explanationText = document.createElement('p');
    explanationText.textContent = question.explanation;
    resultDiv.appendChild(explanationText);
    
    // Adicionar botão para próxima pergunta
    const nextButton = document.createElement('button');
    nextButton.textContent = currentQuestionIndex < quizQuestions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultados';
    nextButton.classList.add('btn-next');
    nextButton.addEventListener('click', () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            showFinalResults();
        }
    });
    
    resultDiv.appendChild(nextButton);
    optionsContainer.appendChild(resultDiv);
}

// Mostrar resultados finais
function showFinalResults() {
    if (!quizContainer) return;
    
    // Limpar container do quiz
    quizContainer.innerHTML = '';
    
    // Criar div de resultados
    const resultsDiv = document.createElement('div');
    resultsDiv.classList.add('quiz-results');
    
    // Adicionar título
    const resultsTitle = document.createElement('h2');
    resultsTitle.textContent = 'Resultados do Quiz';
    resultsDiv.appendChild(resultsTitle);
    
    // Adicionar pontuação
    const scoreText = document.createElement('p');
    scoreText.classList.add('score');
    scoreText.textContent = `Você acertou ${score} de ${quizQuestions.length} perguntas!`;
    resultsDiv.appendChild(scoreText);
    
    // Adicionar mensagem baseada na pontuação
    const messageText = document.createElement('p');
    
    if (score === quizQuestions.length) {
        messageText.textContent = 'Parabéns! Você é um especialista em reciclagem e coleta seletiva!';
    } else if (score >= quizQuestions.length * 0.7) {
        messageText.textContent = 'Muito bom! Você tem um ótimo conhecimento sobre coleta seletiva.';
    } else if (score >= quizQuestions.length * 0.5) {
        messageText.textContent = 'Bom trabalho! Continue aprendendo sobre práticas sustentáveis.';
    } else {
        messageText.textContent = 'Continue estudando! A reciclagem correta é essencial para o meio ambiente.';
    }
    
    resultsDiv.appendChild(messageText);
    
    // Adicionar botão para reiniciar o quiz
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Refazer o Quiz';
    restartButton.classList.add('btn-restart');
    restartButton.addEventListener('click', resetQuiz);
    
    resultsDiv.appendChild(restartButton);
    quizContainer.appendChild(resultsDiv);
}

// Reiniciar o quiz
function resetQuiz() {
    // Recarregar a página para começar de novo
    location.reload();
}

// Atualizar a exibição do progresso
function updateProgressDisplay() {
    if (!progressText || !progressBar) return;
    
    const progressSpans = progressText.querySelectorAll('span');
    
    if (progressSpans.length === 2) {
        progressSpans[1].textContent = `${currentQuestionIndex + 1}/${quizQuestions.length}`;
    }
    
    const progressPercent = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
}

// Funções para modal de aviso
function showWarningModal() {
    const modal = document.getElementById('warningModal');
    if (modal) {
        modal.style.display = 'block';
        // Adicionar classe para animação
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

function closeWarningModal() {
    const modal = document.getElementById('warningModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Fechar modal clicando fora dele
document.addEventListener('click', function(event) {
    const modal = document.getElementById('warningModal');
    if (event.target === modal) {
        closeWarningModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeWarningModal();
    }
});

// Inicializar o quiz quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando quiz');
    
    // Inicializar todos os elementos DOM
    quizContainer = document.querySelector('.quiz-container');
    progressContainer = document.querySelector('.progress-container');
    progressText = document.querySelector('.progress-text');
    progressBar = document.querySelector('.progress-bar .progress');
    questionElement = document.querySelector('.question p');
    optionsContainer = document.querySelector('.options');
    startButton = document.querySelector('.btn-primary');
    
    console.log('Quiz container encontrado:', quizContainer);
    console.log('Question element encontrado:', questionElement);
    console.log('Options container encontrado:', optionsContainer);
    
    // Inicializar o quiz apenas se os elementos principais foram encontrados
    if (quizContainer && questionElement && optionsContainer) {
        console.log('Todos os elementos necessários encontrados, inicializando quiz');
        initializeQuiz();
    } else {
        console.error('Elementos do quiz não encontrados:', {
            quizContainer,
            questionElement,
            optionsContainer
        });
    }
});