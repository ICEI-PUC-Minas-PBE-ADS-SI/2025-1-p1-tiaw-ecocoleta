# Configuração do Stripe - EcoColeta

## Problemas Identificados e Soluções

### ❌ Problemas Encontrados:
1. **Endpoint de checkout ausente** - `/api/stripe/create-checkout-session` não existia no servidor
2. **Chave Stripe inválida** - Usando chave dummy no `.env`
3. **Falta de tratamento de webhooks** - Pagamentos não eram processados
4. **Tratamento de erros inadequado** - Interface não informava problemas

### ✅ Soluções Implementadas:

#### 1. Endpoint de Checkout Criado
- Adicionado `/api/stripe/create-checkout-session` no `server.js`
- Suporte a três planos: básico (R$ 12,99), profissional (R$ 25,99), premium (R$ 39,99)
- Criação de sessões de checkout para assinaturas mensais

#### 2. Webhook para Processar Pagamentos
- Endpoint `/api/stripe/webhook` para receber eventos do Stripe
- Processamento automático de assinaturas ativadas
- Atualização do status do usuário no banco de dados

#### 3. Melhor Tratamento de Erros
- Verificação de usuário logado
- Feedback visual durante processamento
- Mensagens de erro mais descritivas
- Verificação de assinatura existente

#### 4. Verificação de Status
- Função para verificar assinatura ativa
- Interface adaptada para usuários com assinatura
- Redirecionamento para gerenciamento

## Para Usar em Produção:

### 1. Configurar Chaves Reais do Stripe:
```env
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta_real
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook_real
```

### 2. Atualizar Chave Pública:
No arquivo `src/js/assinatura.js`, substituir:
```javascript
const stripe = Stripe('pk_live_sua_chave_publica_real');
```

### 3. Configurar Webhook no Stripe:
- URL: `https://seudominio.com/api/stripe/webhook`
- Eventos: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`

### 4. URLs de Redirecionamento:
- Sucesso: `https://seudominio.com/public/perfil.html?session_id={CHECKOUT_SESSION_ID}`
- Cancelamento: `https://seudominio.com/public/assinatura.html`

## Como Testar:

### 1. Com Chaves de Teste:
- Usar cartões de teste do Stripe
- Número: `4242 4242 4242 4242`
- Validade: qualquer data futura
- CVC: qualquer 3 dígitos

### 2. Logs do Servidor:
O servidor agora registra:
- Criação de sessões de checkout
- Eventos de webhook recebidos
- Ativação de assinaturas

### 3. Verificar no Banco:
Após pagamento bem-sucedido, o usuário deve ter:
```json
{
  "planoAtivo": "pro",
  "assinaturaStripeId": "sub_xxxxx",
  "statusAssinatura": "ativa",
  "dataAssinatura": "2025-06-29T..."
}
```

## Estrutura dos Planos:

```javascript
const planos = {
  basic: {
    preco: 1299, // R$ 12,99
    nome: "Plano Básico",
    features: ["Receber solicitações", "Perfil público", "Suporte padrão"]
  },
  pro: {
    preco: 2599, // R$ 25,99
    nome: "Plano Profissional", 
    features: ["Dashboard completo", "Relatórios", "Suporte prioritário"]
  },
  premium: {
    preco: 3999, // R$ 39,99
    nome: "Plano Premium",
    features: ["Todas as funções", "Integrações", "Suporte premium"]
  }
}
```

## Fluxo Completo:

1. **Usuário clica "Assinar"** → Verificação de login
2. **Frontend chama API** → `/api/stripe/create-checkout-session`
3. **Servidor cria sessão** → Retorna `sessionId`
4. **Redirecionamento** → Stripe Checkout
5. **Pagamento bem-sucedido** → Webhook ativado
6. **Webhook processa** → Atualiza usuário no banco
7. **Usuário é redirecionado** → Perfil com assinatura ativa

## Próximos Passos:

- [ ] Implementar cancelamento de assinatura
- [ ] Página de gerenciamento de assinatura
- [ ] Histórico de pagamentos
- [ ] Upgrade/downgrade de planos
- [ ] Notificações de renovação
