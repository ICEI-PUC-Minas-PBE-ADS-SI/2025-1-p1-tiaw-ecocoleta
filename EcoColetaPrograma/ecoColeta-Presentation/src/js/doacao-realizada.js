document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'https://two025-1-p1-tiaw-ecocoleta.onrender.com';

    // Função para formatar o valor em reais
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Função para formatar a data
    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // Função para obter os parâmetros da URL
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            id: params.get('id')
        };
    }

    // Função para carregar os detalhes da doação
    async function loadDonationDetails() {
        const { id } = getUrlParams();
        
        if (!id) {
            window.location.href = 'doacoes.html';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/donations/${id}`);
            
            if (!response.ok) {
                throw new Error('Doação não encontrada');
            }

            const donation = await response.json();

            // Atualiza os elementos da página com os dados da doação
            document.getElementById('donationAmount').textContent = formatCurrency(donation.amount);
            document.getElementById('donationDate').textContent = formatDate(donation.date);

            // Adiciona animação de entrada
            const successContent = document.querySelector('.success-content');
            successContent.style.opacity = '0';
            successContent.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                successContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                successContent.style.opacity = '1';
                successContent.style.transform = 'translateY(0)';
            }, 100);

        } catch (error) {
            console.error('Erro ao carregar detalhes da doação:', error);
            alert('Não foi possível carregar os detalhes da doação. Por favor, tente novamente mais tarde.');
            window.location.href = 'doacoes.html';
        }
    }

    // Carrega os detalhes da doação quando a página é carregada
    loadDonationDetails();
});