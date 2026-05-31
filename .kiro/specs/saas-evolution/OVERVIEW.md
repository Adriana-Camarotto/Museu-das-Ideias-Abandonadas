# 🎯 OVERVIEW: Evolução SaaS - Museu das Ideias Abandonadas

## 📊 RESUMO EXECUTIVO

Transformar o "Museu das Ideias Abandonadas" de um MVP em uma **plataforma SaaS completa** com:

- 🕯️ **Sistema de Gamificação**: Velas acesas como interação principal
- 🏆 **Ranking Global**: Leaderboard em tempo real baseado em engajamento
- 📧 **Notificações**: Email assíncrono com opt-in/opt-out
- ⚡ **UI Reativa**: Atualizações instantâneas sem refresh
- 📊 **Análise**: Rastreamento de eventos para insights

---

## 🎮 SISTEMA DE GAMIFICAÇÃO

### Regra de Pontuação

```
+1 ponto  → Vela acesa em ideia própria
+2 pontos → Vela acesa em ideia de outro usuário
+5 pontos → Ideia viral (top 10%)
+10 pontos → Ideia no ranking semanal
```

### Intensidade da Vela (Visual)

```
🕯️ low      → < 5 velas
🕯️ medium   → 5-20 velas
🔥 high     → 20-50 velas
⭐ viral    → 50+ velas
```

---

## 🕯️ FLUXO: ACENDER VELA

```
1. Usuário clica em "Acender Vela"
   ↓
2. Frontend: POST /api/ideas/:id/candle
   ↓
3. Backend:
   - Incrementa honor_count
   - Registra evento em idea_events
   - Calcula novo score do usuário
   - Atualiza ranking cache
   ↓
4. Frontend:
   - Anima vela
   - Invalida queries (React Query)
   - Atualiza UI instantaneamente
   ↓
5. Resultado: +2 pontos, ranking atualizado
```

---

## 🏆 RANKING GLOBAL

### Endpoint: GET /api/ranking/global

```json
{
  "ranking": [
    {
      "position": 1,
      "username": "João Silva",
      "totalIdeas": 12,
      "totalCandles": 245,
      "score": 350,
      "topIdea": { "nome": "App de Meditação", "honor_count": 85 },
      "badge": "🏆 Lendário"
    }
  ],
  "pagination": { "total": 1250, "limit": 50, "offset": 0 }
}
```

### Características

- ✅ Atualizado em tempo real
- ✅ Paginação (50 usuários por página)
- ✅ Filtro por período (all, week, month)
- ✅ Cache em Redis (TTL: 5min)
- ✅ Polling a cada 30s no frontend

---

## 📧 SISTEMA DE EMAIL

### Eventos que Disparam Email

| Evento | Condição | Email |
|--------|----------|-------|
| Ideia criada | Sempre (se opt-in) | "Sua ideia nasceu no museu" |
| Ideia trending | honor_count >= 10 | "Sua ideia está sendo lembrada" |
| Ranking atualizado | Entrou top 100 | "Você entrou no ranking do museu" |
| Milestone | 50, 100, 500 velas | "Sua ideia atingiu X velas" |

### Características

- ✅ Assíncrono (não bloqueia API)
- ✅ Fila com retry automático (3 tentativas)
- ✅ Opt-in/opt-out por usuário
- ✅ Templates HTML responsivos
- ✅ Enviado em < 5s

---

## 📊 NOVAS TABELAS

### idea_events

```sql
id | idea_id | user_id | type | points | created_at
```

Rastreia: velas acesas, criação, arquivamento, visualizações

### user_preferences

```sql
id | user_id | email_on_idea_created | email_on_trending | ...
```

Preferências de notificação por usuário

---

## 🧩 DTOs ATUALIZADAS

### IdeaCardDTO

```typescript
{
  id, nome, categoria, survival_percentage,
  cause_of_death_summary, ai_verdict,
  honor_count,
  
  // NOVO
  candle_intensity: "low" | "medium" | "high" | "viral",
  ui: {
    emoji: "🕯️" | "🔥" | "⭐",
    badge_color: "blue" | "orange" | "red" | "gold",
    label: "Novo" | "Popular" | "Viral" | "Lendário"
  }
}
```

### UserRankingDTO

```typescript
{
  position, userId, username,
  totalIdeas, totalCandles, score,
  topIdea, badge, percentile
}
```

---

## ⚡ FRONTEND - REATIVIDADE

### React Query

```javascript
// Hooks customizados
useIdeas()        // Lista de ideias
useRanking()      // Ranking global
useCandle()       // Acender vela (mutação)
useUserStats()    // Estatísticas do usuário

// Invalidação automática após mutação
queryClient.invalidateQueries({ queryKey: ['ideas'] });
queryClient.invalidateQueries({ queryKey: ['ranking'] });
```

### Componentes Novos

- `CandleButton.jsx` - Botão de acender vela
- `RankingLeaderboard.jsx` - Leaderboard
- `NotificationPreferences.jsx` - Preferências de email
- `Ranking.jsx` - Página de ranking
- `Settings.jsx` - Página de configurações

---

## 🔌 NOVOS ENDPOINTS

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/ideas/:id/candle` | Acender vela |
| GET | `/api/ranking/global` | Ranking global |
| GET | `/api/user/preferences` | Preferências do usuário |
| PUT | `/api/user/preferences` | Atualizar preferências |

---

## 🔧 NOVOS SERVIÇOS

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

## 📋 FASES DE IMPLEMENTAÇÃO

### Fase 1: Backend - Gamificação (12h)
- Criar tabelas (idea_events, user_preferences)
- Implementar RankingService
- Implementar EventService
- Criar endpoints de vela e ranking
- Implementar EmailService

### Fase 2: Frontend - Reatividade (11h)
- Instalar React Query
- Criar hooks customizados
- Criar componentes (CandleButton, RankingLeaderboard)
- Criar páginas (Ranking, Settings)
- Implementar polling

### Fase 3: Testes & Otimizações (6.5h)
- Testes de integração
- Otimizar performance
- Documentação

### Fase 4: Deploy (2.5h)
- Configurar variáveis de ambiente
- Docker Compose
- Monitoramento

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

## 🔐 SEGURANÇA

- ✅ JWT obrigatório em rotas protegidas
- ✅ user_id extraído do token (nunca do body)
- ✅ Acesso cruzado bloqueado
- ✅ Rate limiting em endpoints críticos
- ✅ Validação de entrada
- ✅ SQL injection prevenido (Supabase)
- ✅ CORS configurado

---

## 📚 DOCUMENTAÇÃO

- `requirements.md` - Requisitos detalhados
- `design.md` - Arquitetura técnica
- `tasks.md` - Tarefas de implementação
- `OVERVIEW.md` - Este documento

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Revisar este documento
2. 🔄 Começar Task 1.1 (Criar Tabelas no Supabase)
3. 🔄 Implementar Fase 1 sequencialmente
4. 🔄 Implementar Fase 2 em paralelo
5. 🔄 Testes e otimizações
6. 🔄 Deploy em produção

---

## 📞 CONTATO & SUPORTE

Para dúvidas sobre a implementação, consulte:
- `requirements.md` - Requisitos
- `design.md` - Arquitetura
- `tasks.md` - Tarefas específicas

---

**Versão**: 1.0.0  
**Data**: Maio 2026  
**Status**: 📋 Planejamento
