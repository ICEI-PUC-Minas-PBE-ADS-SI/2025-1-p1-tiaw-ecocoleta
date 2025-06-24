# 🤖 EcoColeta CI/CD Workflows

Este diretório contém os workflows do GitHub Actions para automatizar processos de desenvolvimento, testes, segurança e deploy do projeto EcoColeta.

## 🌱 Visão Geral

Os workflows foram projetados para garantir qualidade, segurança e confiabilidade do sistema EcoColeta, contribuindo para nossa missão de promover a sustentabilidade através da tecnologia.

## 📋 Workflows Disponíveis

### 1. 🔄 **CI/CD Pipeline** (`ci-cd.yml`)
**Triggers:** Push para `main`/`develop`, Pull Requests
**Função:** Pipeline principal de integração e deploy contínuo

**Jobs:**
- **Code Quality Check** - Verifica qualidade e formatação do código
- **Run Tests** - Executa testes automatizados
- **Build Application** - Gera build de produção
- **Deploy to Production** - Deploy automático na branch main
- **Notify Status** - Notificações de status

**Uso:**
```bash
# Dispara automaticamente em:
git push origin main
git push origin develop
# Ou ao abrir/atualizar Pull Request
```

### 2. 🔍 **Pull Request Check** (`pr-check.yml`)
**Triggers:** Pull Requests para `main`/`develop`
**Função:** Validação automatizada de Pull Requests

**Jobs:**
- **Analyze Changes** - Detecta arquivos modificados
- **PR Validation** - Valida título e executa testes
- **PR Comment** - Comenta resultados no PR

**Recursos:**
- ✅ Validação de título seguindo Conventional Commits
- 📊 Análise de mudanças (frontend/backend/docs)
- 💬 Comentários automáticos com resultados
- 📏 Verificação de tamanho de arquivos

### 3. 🚀 **Release Workflow** (`release.yml`)
**Triggers:** Tags `v*.*.*`, Dispatch manual
**Função:** Automatiza criação de releases

**Jobs:**
- **Create Release** - Cria release no GitHub
- **Build Release** - Gera build de produção
- **Deploy Production** - Deploy para produção
- **Notify Release** - Notificações de release

**Como usar:**
```bash
# Criar tag para trigger automático
git tag v1.0.0
git push origin v1.0.0

# Ou usar dispatch manual no GitHub Actions
```

### 4. 🔒 **Security & Dependencies** (`security.yml`)
**Triggers:** Agendado (segundas 9h), mudanças em package.json, manual
**Função:** Auditoria de segurança e dependências

**Jobs:**
- **Security Audit** - npm audit para vulnerabilidades
- **Dependencies Check** - Verifica pacotes desatualizados
- **License Check** - Analisa compatibilidade de licenças
- **Security Report** - Gera relatório consolidado
- **Security Notifications** - Alertas de segurança

**Recursos:**
- 🔍 Detecção de vulnerabilidades críticas
- 📦 Monitoramento de dependências
- 📄 Verificação de licenças
- 📊 Relatórios detalhados

### 5. 💾 **Database Backup** (`backup.yml`)
**Triggers:** Agendado (diário 2h), manual
**Função:** Backup automático do banco de dados

**Jobs:**
- **Database Backup** - Cria backup do db.json
- **Backup Verification** - Verifica integridade
- **Cleanup Old Backups** - Limpeza semanal
- **Backup Report** - Relatório de backup
- **Backup Failure Notification** - Alertas de falha

**Recursos:**
- 🗄️ Backup diário automático
- ✅ Verificação de integridade com checksums
- 📊 Estatísticas do banco de dados
- 🏷️ Retenção diferenciada (30/90 dias)

## 🔧 Configuração

### Secrets Necessários
```yaml
# Para releases automáticos
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

# Para deploy (configurar conforme provedor)
# VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
# NETLIFY_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
# AWS_ACCESS_KEY: ${{ secrets.AWS_ACCESS_KEY }}
```

### Variáveis de Ambiente
```yaml
NODE_VERSION: '18.x'          # Versão do Node.js
APP_NAME: 'ecocoleta'         # Nome da aplicação
BACKUP_RETENTION_DAYS: 30     # Retenção de backups
```

## 📊 Status Badges

Adicione estes badges ao README principal:

```markdown
![CI/CD](https://github.com/seu-usuario/eco-coleta/workflows/🌱%20EcoColeta%20CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/seu-usuario/eco-coleta/workflows/🔒%20Security%20&%20Dependencies%20Check/badge.svg)
![Backup](https://github.com/seu-usuario/eco-coleta/workflows/💾%20Database%20Backup/badge.svg)
```

## 🎯 Boas Práticas

### Para Desenvolvedores
1. **Commits:** Use Conventional Commits para títulos de PR
   ```
   feat(dashboard): add collector statistics
   fix(api): resolve data loading issue
   docs(readme): update installation guide
   ```

2. **Pull Requests:** 
   - Aguarde aprovação dos workflows antes do merge
   - Verifique comentários automáticos
   - Corrija problemas de segurança imediatamente

3. **Releases:**
   - Use versionamento semântico (v1.0.0)
   - Documente mudanças no changelog
   - Teste o build antes de criar tags

### Para Administradores
1. **Monitoramento:**
   - Verifique falhas de workflow diariamente
   - Monitore alertas de segurança
   - Mantenha dependências atualizadas

2. **Backups:**
   - Monitore relatórios de backup
   - Teste restauração periodicamente
   - Mantenha retenção adequada

## 🚨 Troubleshooting

### Problemas Comuns

**Falha no npm audit:**
```bash
cd EcoColetaPrograma/ecoColeta-Presentation
npm audit fix
```

**Build failure:**
```bash
# Verificar logs do workflow
# Testar localmente:
npm ci
npm run start
```

**Backup failure:**
```bash
# Verificar permissões e espaço
# Validar estrutura do db.json
jq empty db.json
```

## 📈 Métricas e Monitoramento

### KPIs dos Workflows
- ✅ Taxa de sucesso de builds
- ⏱️ Tempo médio de execução
- 🔒 Tempo de resolução de vulnerabilidades
- 💾 Sucesso de backups

### Relatórios Disponíveis
- 📊 Relatório de segurança (semanal)
- 💾 Relatório de backup (diário)
- 🔍 Relatório de qualidade (por PR)

## 🌱 Sustentabilidade

Nossos workflows são otimizados para:
- ⚡ Execução eficiente (reduz consumo)
- 🔄 Reutilização de caches
- 📦 Artefatos otimizados
- 🎯 Execução condicional

## 🤝 Contribuindo

Para modificar workflows:
1. Teste mudanças em branch separada
2. Valide sintaxe YAML
3. Documente alterações
4. Solicite review de administradores

## 📞 Suporte

Para problemas com workflows:
- 📋 Abra issue descrevendo o problema
- 🔗 Inclua link para workflow falhado
- 📝 Descreva passos para reproduzir

---

**🌱 Estes workflows ajudam a manter o EcoColeta funcionando de forma confiável, contribuindo para nossa missão de proteger o meio ambiente através da tecnologia!**
