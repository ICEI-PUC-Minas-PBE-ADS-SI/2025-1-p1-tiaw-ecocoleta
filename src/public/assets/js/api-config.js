// Configuração central da API - EcoColeta
// Este arquivo centraliza todas as configurações de URL da API

// URL base da API
const API_CONFIG = {
  BASE_URL: 'https://two025-1-p1-tiaw-ecocoleta.onrender.com',
  API_ENDPOINT: 'https://two025-1-p1-tiaw-ecocoleta.onrender.com/api',
  
  // Endpoints específicos
  ENDPOINTS: {
    USUARIOS: '/usuarios',
    PONTOS_COLETA: '/pontosDeColeta',
    COMUNIDADES: '/comunidades',
    DONATIONS: '/donations',
    AGENDAMENTOS: '/agendamentos'
  },
  
  // Método helper para construir URLs completas
  getUrl: function(endpoint) {
    return this.API_ENDPOINT + (this.ENDPOINTS[endpoint] || endpoint);
  },
  
  // Método helper para URLs de arquivos estáticos
  getStaticUrl: function(path) {
    return this.BASE_URL + '/' + path;
  }
};

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
} else if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
