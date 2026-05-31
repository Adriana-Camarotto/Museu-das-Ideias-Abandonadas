# 🏛️ SPEC: Evolução SaaS - Museu das Ideias Abandonadas

**Status**: 📋 Planejamento Completo  
**Versão**: 1.0.0  
**Data**: Maio 2026  
**Tempo Total**: ~32 horas em 3 semanas

---

## 📚 DOCUMENTAÇÃO COMPLETA

Este diretório contém a especificação completa para transformar o "Museu das Ideias Abandonadas" em uma plataforma SaaS com gamificação, ranking em tempo real e sistema de "velas acesas".

### 📖 Documentos

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| **OVERVIEW.md** | 🎯 Visão geral executiva | 5 min |
| **requirements.md** | 📋 Requisitos detalhados | 15 min |
| **design.md** | 🏗️ Arquitetura técnica | 20 min |
| **tasks.md** | 📝 Tarefas de implementação | 15 min |
| **IMPLEMENTATION_GUIDE.md** | 💻 Exemplos de código | 20 min |
| **QUICK_START.md** | 🚀 Guia rápido para começar | 10 min |
| **README.md** | 📚 Este documento | 5 min |

**Total de leitura**: ~90 minutos

---

## 🎯 OBJETIVO

Transformar o sistema em uma plataforma SaaS onde:

```
✅ Ideias são analisadas por IA
✅ Salvas automaticamente
✅ Aparecem no "Museu" instantaneamente
✅ Usuários interagem com "velas acesas"
✅ Cada interação alimenta um ranking global
✅ Usuários recebem email de notificação (opcional)
```

---

## 🕯️ SISTEMA DE GAMIFICAÇÃO

### Regra de Pontuação

```
+1 ponto  → Vela acesa em ideia própria
+2 pontos → Vela acesa em ideia de outro usuário
+5 pontos → Ideia viral (top 10%)
+10 pontos → Ideia no ranking semanal
```

### Intensidade da Vela

```
🕯️ low      → < 5 velas
🕯️ medium   → 5-20 velas
🔥 high     → 20-50 velas
⭐ viral    → 50+ velas
```

---

## 🏆 RANKING GLOBAL

### Endpoint: GET /api/ranking/global

Retorna top 50 usuários com:
- Posição no ranking
- Score total
- Número de ideias
- Número de velas
- Ideia mais popular
- Badge (Lendário, Estrela, etc)

### Características

- ✅ Atualizado em tempo real
- ✅ Cache em Redis (TTL: 5min)
- ✅ Polling a cada 30s no frontend
- ✅ Paginação
- ✅ Filtro por período

---

## 📧 SISTEMA DE EMAIL

### Eventos

| Evento | Condição | Email |
|--------|----------|-------|
| Ideia criada | Sempre (se opt-in) | "Sua ideia nasceu no museu" |
| Ideia trending | honor_count >= 10 | "Sua ideia está sendo lembrada" |
| Ranking atualizado | Entrou top 100 | "Você entrou no ranking do museu" |
| Milestone | 50, 100, 500 velas | "Sua ideia atingiu X velas" |

### Características

- ✅ Assíncrono (não bloqueia API)
- ✅ Fila com retry automático
- ✅ Opt-in/opt-out por usuário
- ✅ Templates HTML responsivos

---

## 🔌 NOVOS ENDPOINTS

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/ideas/:id/candle` | Acender vela |
| GET | `/api/ranking/global` | Ranking global |
| GET | `/api/user/preferences` | Preferências do usuário |
| PUT | `/api/user/preferences` | Atualizar preferências |

---

## 📊 NOVAS TABELAS

### idea_events

Rastreia todas as interações:
- Velas acesas
- Criação de ideias
- Arquivamento
- Visualizações

### user_preferences

Preferências de notificação por usuário:
- email_on_idea_created
- email_on_trending
- email_on_ranking_update
- email_on_milestone

---

## 🧩 NOVOS SERVIÇOS

### RankingService

```javascript
calculateUserScore(userId)      // Calcula score
getGlobalRanking(limit, offset) // Ranking global
updateRankingCache()            // Atualiza cache
getUserRankPosition(userId)     // Posição do usuário
detectViralIdeas()              // Ideias virais
```

### EventService

```javascript
registerEvent(ideaId, userId, type, points)
getIdeaEvents(ideaId, limit, offset)
getUserEvents(userId, limit, offset)
```

### EmailService

```javascript
sendIdeaCreatedEmail(userId, ideaData)
sendIdeaTrendingEmail(userId, ideaData)
sendRankingUpdateEmail(userId, rankingData)
sendMilestoneEmail(userId, ideaData, milestone)
```

---

## ⚡ FRONTEND - REATIVIDADE

### React Query

```javascript
useIdeas()        // Lista de ideias
useRanking()      // Ranking global
useCandle()       // Acender vela (mutação)
useUserStats()    // Estatísticas do usuário
```

### Componentes Novos

- `CandleButton.jsx` - Botão de acender vela
- `RankingLeaderboard.jsx` - Leaderboard
- `NotificationPreferences.jsx` - Preferências de email
- `Ranking.jsx` - Página de ranking
- `Settings.jsx` - Página de configurações

---

## 📋 FASES DE IMPLEMENTAÇÃO

### Fase 1: Backend - Gamificação (12h)

```
✅ Criar tabelas (idea_events, user_preferences)
✅ Implementar RankingService
✅ Implementar EventService
✅ Criar endpoints de vela e ranking
✅ Implementar EmailService
```

### Fase 2: Frontend - Reatividade (11h)

```
✅ Instalar React Query
✅ Criar hooks customizados
✅ Criar componentes (CandleButton, RankingLeaderboard)
✅ Criar páginas (Ranking, Settings)
✅ Implementar polling
```

### Fase 3: Testes & Otimizações (6.5h)

```
✅ Testes de integração
✅ Otimizar performance
✅ Documentação
```

### Fase 4: Deploy (2.5h)

```
✅ Configurar variáveis de ambiente
✅ Docker Compose
✅ Monitoramento
```

**Total**: 32h em 5.5 dias

---

## 🎯 MÉTRICAS DE SUCESSO

- ✅ Vela acesa registra em < 500ms
- ✅ Ranking atualiza em < 2s
- ✅ Email enviado em < 5s (assíncrono)
- ✅ UI não trava durante atualização
- ✅ 99% de uptime
- ✅ Suporta 10k+ usuários simultâneos

---

## 🚀 COMO COMEÇAR

### 1. Ler Documentação (90 min)

```
1. OVERVIEW.md (5 min) - Visão geral
2. requirements.md (15 min) - Requisitos
3. design.md (20 min) - Arquitetura
4. tasks.md (15 min) - Tarefas
5. IMPLEMENTATION_GUIDE.md (20 min) - Exemplos
6. QUICK_START.md (10 min) - Guia rápido
```

### 2. Executar Task 1.1 (30 min)

Criar tabelas no Supabase:
- idea_events
- user_preferences
- Adicionar coluna candle_intensity em ideas

### 3. Implementar Fase 1 (12h)

Seguir tasks em `tasks.md`:
- Task 1.1 até 1.10

### 4. Implementar Fase 2 (11h)

Seguir tasks em `tasks.md`:
- Task 2.1 até 2.10

### 5. Testes & Deploy (8.5h)

Seguir tasks em `tasks.md`:
- Task 3.1 até 4.2

---

## 📁 ESTRUTURA DE ARQUIVOS

```
.kiro/specs/saas-evolution/
├── README.md                    # Este arquivo
├── OVERVIEW.md                  # Visão geral executiva
├── requirements.md              # Requisitos detalhados
├── design.md                    # Arquitetura técnica
├── tasks.md                     # Tarefas de implementação
├── IMPLEMENTATION_GUIDE.md      # Exemplos de código
└── QUICK_START.md              # Guia rápido
```

---

## 🔑 VARIÁVEIS DE AMBIENTE

### Backend (.env)

```env
# Existentes
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=sua-chave-aqui
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# NOVOS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM=noreply@museu-ideias.com
RANKING_CACHE_TTL=300
EMAIL_QUEUE_INTERVAL=10000
```

---

## 🧪 TESTAR LOCALMENTE

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acessar em http://localhost:5173

---

## 📊 FLUXO: ACENDER VELA

```
Usuário clica "Acender Vela"
    ↓
Frontend: POST /api/ideas/:id/candle
    ↓
Backend:
  1. Validar JWT
  2. Incrementar honor_count
  3. Registrar evento
  4. Calcular score
  5. Atualizar ranking
    ↓
Frontend:
  1. Animar vela
  2. Invalidar queries
  3. Atualizar UI
    ↓
Resultado: +2 pontos, ranking atualizado
```

---

## 🔐 SEGURANÇA

- ✅ JWT obrigatório em rotas protegidas
- ✅ user_id extraído do token (nunca do body)
- ✅ Acesso cruzado bloqueado
- ✅ Rate limiting em endpoints críticos
- ✅ Validação de entrada
- ✅ SQL injection prevenido (Supabase)
- ✅ CORS configurado

---

## 📞 RECURSOS

- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [React Query Docs](https://tanstack.com/query/latest)
- 📖 [Express Docs](https://expressjs.com/)
- 📖 [Nodemailer Docs](https://nodemailer.com/)

---

## ✅ CHECKLIST FINAL

Quando terminar todas as tasks:

- [ ] Tabelas criadas no Supabase
- [ ] RankingService implementado
- [ ] EventService implementado
- [ ] Endpoints de vela e ranking funcionando
- [ ] EmailService implementado
- [ ] React Query instalado e configurado
- [ ] Hooks customizados criados
- [ ] Componentes novos criados
- [ ] Páginas de ranking e settings criadas
- [ ] Testes implementados
- [ ] Performance otimizada
- [ ] Documentação completa
- [ ] Deploy em produção

---

## 🎉 PRÓXIMOS PASSOS

1. ✅ Ler `OVERVIEW.md`
2. ✅ Ler `requirements.md`
3. ✅ Ler `design.md`
4. ✅ Ler `tasks.md`
5. 🔄 Começar Task 1.1 (Criar Tabelas)
6. 🔄 Implementar Fase 1 sequencialmente
7. 🔄 Implementar Fase 2 em paralelo
8. 🔄 Testes e otimizações
9. 🔄 Deploy em produção

---

## 📝 NOTAS

- Todos os exemplos de código estão em `IMPLEMENTATION_GUIDE.md`
- Guia rápido para começar em `QUICK_START.md`
- Tarefas específicas em `tasks.md`
- Arquitetura técnica em `design.md`

---

**Versão**: 1.0.0  
**Data**: Maio 2026  
**Status**: 📋 Planejamento Completo  
**Tempo Total**: ~32 horas em 5.5 dias

---

## 🙏 Obrigado!

Boa sorte com a implementação! 🚀

Se tiver dúvidas, consulte a documentação ou revise os exemplos de código.

**Vamos transformar o Museu das Ideias Abandonadas em uma plataforma SaaS incrível!** 🎉
