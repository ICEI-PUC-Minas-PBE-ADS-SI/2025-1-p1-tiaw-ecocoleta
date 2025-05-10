document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/api';
    let stripe;
    let elements;
    let paymentElement;

    // Initialize Stripe
    async function initializeStripe() {
        stripe = Stripe('your_stripe_publishable_key_here');
    }

    // Seleciona todos os botões de opção
    const optionButtons = document.querySelectorAll('.option-button');
    
    // Adiciona evento de clique para cada botão de opção
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parent = this.closest('.option-buttons');
            parent.querySelectorAll('.option-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });

    // Seleciona os botões principais
    const primaryButton = document.querySelector('.primary-button');
    const secondaryButton = document.querySelector('.secondary-button');
    const rewardsButton = document.querySelector('.rewards-button');

    // Função para criar Payment Intent
    async function createPaymentIntent(amount) {
        try {
            const response = await fetch(`${API_URL.replace('/api', '')}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount })
            });

            if (!response.ok) {
                throw new Error('Erro ao criar Payment Intent');
            }

            const data = await response.json();
            return data.clientSecret;
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }

    // Função para salvar a doação
    async function saveDonation(donationData) {
        try {
            const response = await fetch(`${API_URL}/donations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(donationData)
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar a doação');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }

    // Função para redirecionar para a página de doação realizada
    function redirectToSuccessPage(donationId) {
        window.location.href = `doacao-realizada.html?id=${donationId}`;
    }

    // Função para abrir o modal de doação
    async function openDonationModal() {
        const modal = document.createElement('div');
        modal.className = 'donation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Complete sua doação</h2>
                <form id="donationForm">
                    <div class="form-group">
                        <label for="amount">Valor da doação</label>
                        <input type="number" id="amount" required min="1" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="name">Nome completo</label>
                        <input type="text" id="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">E-mail</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="cpf">CPF</label>
                        <input type="text" id="cpf" required>
                    </div>
                    <div id="payment-element"></div>
                    <div id="payment-message" class="payment-message"></div>
                    <button type="submit" class="submit-button">
                        <div class="spinner hidden" id="spinner"></div>
                        <span id="button-text">Confirmar doação</span>
                    </button>
                </form>
            </div>
        `;

        // Adiciona estilos ao modal
        const style = document.createElement('style');
        style.textContent = `
            .donation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .modal-content {
                background-color: white;
                padding: 2rem;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                position: relative;
            }

            .close-modal {
                position: absolute;
                right: 1rem;
                top: 1rem;
                font-size: 1.5rem;
                cursor: pointer;
                transition: color 0.3s;
            }

            .close-modal:hover {
                color: #059669;
            }

            .form-group {
                margin-bottom: 1rem;
            }

            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                color: #4b5563;
            }

            .form-group input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 1rem;
                transition: border-color 0.3s, box-shadow 0.3s;
            }

            .form-group input:focus {
                border-color: #059669;
                box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.1);
                outline: none;
            }

            .submit-button {
                width: 100%;
                height: 48px;
                background-color: #059669;
                color: white;
                font-size: 16px;
                border-radius: 9999px;
                margin-top: 1rem;
                transition: all 0.3s;
                position: relative;
            }

            .submit-button:hover {
                background-color: #047857;
            }

            .submit-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .spinner {
                position: absolute;
                top: 50%;
                left: 50%;
                margin: -10px 0 0 -10px;
                width: 20px;
                height: 20px;
                border: 2px solid #ffffff;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spinner 0.8s linear infinite;
                display: none;
            }

            .spinner.visible {
                display: block;
            }

            @keyframes spinner {
                to {
                    transform: rotate(360deg);
                }
            }

            .payment-message {
                color: #dc2626;
                font-size: 14px;
                margin-top: 0.5rem;
                text-align: center;
                min-height: 20px;
            }

            #payment-element {
                margin-bottom: 24px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        await initializeStripe();

        // Adiciona eventos ao modal
        const closeModal = modal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        const form = modal.querySelector('#donationForm');
        const submitButton = form.querySelector('.submit-button');
        const spinner = document.getElementById('spinner');
        const messageDiv = document.getElementById('payment-message');

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            setLoading(true);

            try {
                const formData = {
                    amount: parseFloat(document.getElementById('amount').value),
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    cpf: document.getElementById('cpf').value.replace(/\D/g, '')
                };

                // Criar Payment Intent
                const clientSecret = await createPaymentIntent(formData.amount);

                // Configurar elementos do Stripe
                const appearance = {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#059669',
                    },
                };
                
                elements = stripe.elements({ appearance, clientSecret });
                const paymentElement = elements.create('payment');
                paymentElement.mount('#payment-element');

                // Confirmar pagamento
                const { error } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: window.location.origin + '/doacao-realizada.html',
                        payment_method_data: {
                            billing_details: {
                                name: formData.name,
                                email: formData.email,
                            },
                        },
                    },
                });

                if (error) {
                    throw error;
                }

                // Salvar doação
                const donation = await saveDonation({
                    ...formData,
                    paymentId: clientSecret.split('_secret')[0],
                });

                // Redirecionar para página de sucesso
                redirectToSuccessPage(donation.id);
            } catch (error) {
                messageDiv.textContent = error.message || 'Ocorreu um erro ao processar sua doação. Por favor, tente novamente.';
                setLoading(false);
            }
        });

        // Fecha o modal ao clicar fora dele
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Adiciona máscaras aos campos
        const cpfInput = document.getElementById('cpf');
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                e.target.value = value;
            }
        });

        function setLoading(isLoading) {
            if (isLoading) {
                submitButton.disabled = true;
                spinner.classList.add('visible');
                submitButton.querySelector('#button-text').textContent = 'Processando...';
            } else {
                submitButton.disabled = false;
                spinner.classList.remove('visible');
                submitButton.querySelector('#button-text').textContent = 'Confirmar doação';
            }
        }
    }

    // Adiciona eventos aos botões principais
    if (primaryButton) {
        primaryButton.addEventListener('click', openDonationModal);
    }

    if (secondaryButton) {
        secondaryButton.addEventListener('click', function() {
            const donationOptions = document.querySelector('.donation-options');
            if (donationOptions) {
                donationOptions.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (rewardsButton) {
        rewardsButton.addEventListener('click', function() {
            const rewardLevels = document.querySelector('.reward-levels');
            if (rewardLevels) {
                rewardLevels.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}); 