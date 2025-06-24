/**
 * 🌱 EcoColeta - Utilitários para API
 * Funções para fazer requisições HTTP com tratamento de CORS
 */

// Configuração da API
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3
};

/**
 * Classe para gerenciar requisições da API
 */
class EcoColetaAPI {
    constructor(baseUrl = API_CONFIG.BASE_URL) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Método principal para fazer requisições
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        // Log da requisição para debug
        console.log(`🌐 API Request: ${config.method} ${url}`, config);

        try {
            const response = await fetch(url, config);
            
            // Log da resposta para debug
            console.log(`📡 API Response: ${response.status} ${response.statusText}`, {
                url,
                status: response.status,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Se não houver conteúdo, retornar null
            if (response.status === 204) {
                return null;
            }

            const data = await response.json();
            console.log(`✅ API Success:`, data);
            return data;

        } catch (error) {
            console.error(`❌ API Error: ${config.method} ${url}`, error);
            throw this.handleError(error);
        }
    }

    /**
     * Tratamento de erros
     */
    handleError(error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return new Error('Erro de conectividade. Verifique se o servidor está rodando.');
        }
        if (error.message.includes('CORS')) {
            return new Error('Erro de CORS. Verifique a configuração do servidor.');
        }
        return error;
    }

    // Métodos de conveniência para HTTP verbs
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Teste de conectividade
     */
    async testConnection() {
        try {
            const response = await fetch(this.baseUrl.replace('/api', ''), {
                method: 'OPTIONS'
            });
            return {
                connected: true,
                status: response.status,
                cors: {
                    origin: response.headers.get('access-control-allow-origin'),
                    methods: response.headers.get('access-control-allow-methods'),
                    headers: response.headers.get('access-control-allow-headers')
                }
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }
}

/**
 * Instância global da API
 */
const ecoColetaAPI = new EcoColetaAPI();

/**
 * Funções específicas para entidades do EcoColeta
 */
const EcoColetaService = {
    // Usuários
    usuarios: {
        listar: () => ecoColetaAPI.get('/usuarios'),
        buscarPorId: (id) => ecoColetaAPI.get(`/usuarios/${id}`),
        criar: (usuario) => ecoColetaAPI.post('/usuarios', usuario),
        atualizar: (id, usuario) => ecoColetaAPI.put(`/usuarios/${id}`, usuario),
        excluir: (id) => ecoColetaAPI.delete(`/usuarios/${id}`)
    },

    // Comunidades
    comunidades: {
        listar: (params = {}) => ecoColetaAPI.get('/comunidades', params),
        buscarPorId: (id) => ecoColetaAPI.get(`/comunidades/${id}`),
        criar: (comunidade) => ecoColetaAPI.post('/comunidades', comunidade),
        atualizar: (id, comunidade) => ecoColetaAPI.put(`/comunidades/${id}`, comunidade),
        excluir: (id) => ecoColetaAPI.delete(`/comunidades/${id}`)
    },

    // Doações
    doacoes: {
        listar: () => ecoColetaAPI.get('/donations'),
        criar: (doacao) => ecoColetaAPI.post('/donations', doacao)
    },

    // Teste de conectividade
    testarConexao: () => ecoColetaAPI.testConnection()
};

/**
 * Função utilitária para debug - mostra informações do CORS
 */
async function debugCORS() {
    console.group('🔧 Debug CORS - EcoColeta');
    
    try {
        const conexao = await EcoColetaService.testarConexao();
        console.log('Status da conexão:', conexao);
        
        if (conexao.connected) {
            console.log('✅ Servidor conectado');
            console.log('CORS Headers:', conexao.cors);
        } else {
            console.error('❌ Falha na conexão:', conexao.error);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste de conexão:', error);
    }
    
    console.groupEnd();
}

/**
 * Exemplo de uso das funções
 */
async function exemploDeUso() {
    try {
        // Listar usuários
        const usuarios = await EcoColetaService.usuarios.listar();
        console.log('Usuários:', usuarios);

        // Criar um novo usuário
        const novoUsuario = {
            nome: 'Teste API',
            email: 'teste@example.com',
            tipoUsuario: 'doador'
        };
        const usuarioCriado = await EcoColetaService.usuarios.criar(novoUsuario);
        console.log('Usuário criado:', usuarioCriado);

        // Listar comunidades
        const comunidades = await EcoColetaService.comunidades.listar({ page: 1, limit: 5 });
        console.log('Comunidades:', comunidades);

    } catch (error) {
        console.error('Erro no exemplo:', error);
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.EcoColetaAPI = EcoColetaAPI;
    window.EcoColetaService = EcoColetaService;
    window.debugCORS = debugCORS;
    window.exemploDeUso = exemploDeUso;
}

// Auto-teste ao carregar o script
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🌱 EcoColeta API Utils carregado');
        
        // Teste automático após 2 segundos
        setTimeout(() => {
            debugCORS();
        }, 2000);
    });
}
