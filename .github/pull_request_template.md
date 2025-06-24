---
name: 📋 Template para Pull Request
about: Template padrão para Pull Requests no EcoColeta
title: ''
labels: []
assignees: []
---

## 📋 Descrição
Descreva as mudanças implementadas neste PR de forma clara e concisa.

## 🎯 Tipo de Mudança
Marque o tipo de mudança que este PR representa:
- [ ] 🐛 Bug fix (mudança que corrige um problema)
- [ ] ✨ Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📚 Documentação (mudanças apenas em documentação)
- [ ] 🎨 Estilo (formatação, ponto e vírgula faltando, etc.)
- [ ] ♻️ Refatoração (mudança de código que não corrige bug nem adiciona funcionalidade)
- [ ] ⚡ Performance (mudança que melhora performance)
- [ ] ✅ Testes (adição ou correção de testes)
- [ ] 🔧 Build/CI (mudanças em sistema de build ou CI)

## 🔗 Issue Relacionada
Fixes #(issue number)
Closes #(issue number)
Related to #(issue number)

## 🧪 Como Testar
Descreva como revisar e testar as mudanças:

1. Faça checkout da branch
2. Execute `npm install` se houver mudanças em dependências
3. Execute `npm start` para iniciar a aplicação
4. Teste as seguintes funcionalidades:
   - [ ] Funcionalidade A
   - [ ] Funcionalidade B
   - [ ] Funcionalidade C

## 📱 Screenshots/GIFs
Se as mudanças afetam a UI, adicione screenshots ou GIFs demonstrando antes e depois:

### Antes
<!-- Adicione screenshot/gif aqui -->

### Depois
<!-- Adicione screenshot/gif aqui -->

## 📊 Impacto
Descreva o impacto das mudanças:

### 🌱 Impacto Ambiental
Como estas mudanças contribuem para a missão de sustentabilidade do EcoColeta?

### 👥 Usuários Afetados
- [ ] Administradores
- [ ] Coletores
- [ ] Usuários finais
- [ ] Desenvolvedores

### 📈 Métricas Impactadas
- [ ] Performance
- [ ] Usabilidade
- [ ] Acessibilidade
- [ ] SEO
- [ ] Segurança

## ✅ Checklist
Antes de submeter o PR, verifique se:

### Código
- [ ] Meu código segue as diretrizes de estilo do projeto
- [ ] Realizei uma auto-revisão do meu código
- [ ] Comentei áreas complexas ou não óbvias
- [ ] Removi console.logs e códigos de debug
- [ ] Não há código morto ou comentado

### Testes
- [ ] Testei manualmente todas as mudanças
- [ ] Testei em diferentes navegadores
- [ ] Testei responsividade em mobile
- [ ] Verifiquei compatibilidade com funcionalidades existentes

### Documentação
- [ ] Atualizei documentação relevante
- [ ] Atualizei comentários no código se necessário
- [ ] Adicionei/atualizei README se aplicável

### Dependências
- [ ] Não adicionei dependências desnecessárias
- [ ] Documentei novas dependências se adicionadas
- [ ] Verifiquei licenças de novas dependências

### Segurança
- [ ] Não expus informações sensíveis
- [ ] Validei entradas de usuário
- [ ] Considerei implicações de segurança

## 🔄 Breaking Changes
Se este PR contém breaking changes, descreva:
- O que mudou
- Por que mudou
- Como migrar da versão anterior

## 📝 Notas Adicionais
Adicione quaisquer notas, preocupações ou considerações especiais para os revisores.

## 🎯 Next Steps
O que deve ser feito após este PR ser merged?
- [ ] Deploy para staging
- [ ] Testes de aceitação
- [ ] Atualização de documentação
- [ ] Comunicação com usuários

---

**Para Revisores:**
- Verifiquem se o código atende aos padrões do projeto
- Testem as funcionalidades em diferentes cenários
- Considerem o impacto na performance e usabilidade
- Validem se a solução atende aos requisitos da issue
