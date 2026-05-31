# 📋 TASKS: Implementação SaaS

**Status**: 📋 Planejamento  
**Versão**: 1.0.0

---

## FASE 1: Backend - Gamificação & Ranking

### Task 1.1: Criar Tabelas no Supabase
**Descrição**: Criar tabelas `idea_events` e `user_preferences`  
**Prioridade**: 🔴 Alta  
**Estimativa**: 30min  
**Dependências**: Nenhuma

**Checklist**:
- [ ] Criar tabela `idea_events` com índices
- [ ] Criar tabela `user_preferences` com RLS
- [ ] Adicionar coluna `candle_intensity` em `ideas`
- [ ] Criar índices para performance
- [ ] Testar RLS policies
- [ ] Documentar schema

**Entregáveis**:
- SQL migration file
- Documentação de schema

---

### Task 1.2: Criar RankingService
**Descrição**: Implementar serviço de cálculo de ranking  
**Prioridade**: 🔴 Alta  
**Estimativa**: 2h  
**Dependências**: Task 1.1

**Checklist**:
- [ ] Criar classe `RankingService`
- [ ] Implementar `calculateUserScore(userId)`
- [ ] Implementar `getGlobalRanking(limit, offset, period)`
- [ ] Implementar `updateRankingCache()`
- [ ] Implementar `getUserRankPosition(userId)`
- [ ] Implementar `detectViralIdeas()`
- [ ] Adicionar logging
- [ ] Testes unitários

**Entregáveis**:
- `backend/src/services/RankingService.js`
- Testes

---

### Task 1.3: Criar EventService
**Descrição**: Implementar serviço de eventos  
**Prioridade**: 🔴 Alta  
**Estimativa**: 1h  
**Dependências**: Task 1.1

**Checklist**:
- [ ] Criar classe `EventService`
- [ ] Implementar `registerEvent(ideaId, userId, type, points, metadata)`
- [ ] Implementar `getIdeaEvents(ideaId, limit, offset)`
- [ ] Implementar `getUserEvents(userId, limit, offset)`
- [ ] Validação de tipos de evento
- [ ] Testes unitários

**Entregáveis**:
- `backend/src/services/EventService.js`
- Testes

---

### Task 1.4: Criar Endpoint POST /api/ideas/:id/candle
**Descrição**: Implementar endpoint para acender vela  
**Prioridade**: 🔴 Alta  
**Estimativa**: 1.5h  
**Dependências**: Task 1.2, 1.3

**Checklist**:
- [ ] Criar controller method `lightCandle()`
- [ ] Validar JWT
- [ ] Validar ideia existe
- [ ] Incrementar honor_count
- [ ] Registrar evento
- [ ] Calcular score
- [ ] Atualizar ranking cache
- [ ] Retornar dados atualizados
- [ ] Testes de integração

**Entregáveis**:
- Endpoint implementado
- Testes

---

### Task 1.5: Criar Endpoint GET /api/ranking/global
**Descrição**: Implementar endpoint de ranking global  
**Prioridade**: 🔴 Alta  
**Estimativa**: 1.5h  
**Dependências**: Task 1.2

**Checklist**:
- [ ] Criar controller method `getGlobalRanking()`
- [ ] Implementar paginação
- [ ] Implementar filtro por período
- [ ] Usar cache (Redis ou em memória)
- [ ] Retornar UserRankingDTO
- [ ] Testes de integração

**Entregáveis**:
- Endpoint implementado
- Testes

---

### Task 1.6: Atualizar IdeaService
**Descrição**: Atualizar `incrementHonor()` para registrar eventos  
**Prioridade**: 🟡 Média  
**Estimativa**: 30min  
**Dependências**: Task 1.3

**Checklist**:
- [ ] Modificar `incrementHonor()` para chamar `EventService`
- [ ] Registrar evento com tipo `candle_light`
- [ ] Calcular pontos baseado em regra
- [ ] Atualizar `candle_intensity`
- [ ] Testes

**Entregáveis**:
- IdeaService atualizado
- Testes

---

### Task 1.7: Criar EmailService
**Descrição**: Implementar serviço de email assíncrono  
**Prioridade**: 🟡 Média  
**Estimativa**: 2h  
**Dependências**: Task 1.1

**Checklist**:
- [ ] Criar classe `EmailService`
- [ ] Implementar `sendIdeaCreatedEmail()`
- [ ] Implementar `sendIdeaTrendingEmail()`
- [ ] Implementar `sendRankingUpdateEmail()`
- [ ] Implementar `sendMilestoneEmail()`
- [ ] Criar fila de email (em memória)
- [ ] Implementar retry automático
- [ ] Configurar Nodemailer
- [ ] Testes

**Entregáveis**:
- `backend/src/services/EmailService.js`
- `backend/src/queues/emailQueue.js`
- Testes

---

### Task 1.8: Criar Templates de Email
**Descrição**: Criar templates HTML para emails  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Task 1.7

**Checklist**:
- [ ] Criar `ideaCreated.html`
- [ ] Criar `ideaTrending.html`
- [ ] Criar `rankingUpdate.html`
- [ ] Criar `milestone.html`
- [ ] Responsivo (mobile-friendly)
- [ ] Testes de renderização

**Entregáveis**:
- Templates HTML em `backend/src/templates/`

---

### Task 1.9: Criar Endpoints de Preferências
**Descrição**: Implementar GET/PUT /api/user/preferences  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Task 1.1

**Checklist**:
- [ ] Criar controller `UserPreferencesController`
- [ ] Implementar GET /api/user/preferences
- [ ] Implementar PUT /api/user/preferences
- [ ] Validar JWT
- [ ] Testes de integração

**Entregáveis**:
- Endpoints implementados
- Testes

---

### Task 1.10: Integrar EmailService com Eventos
**Descrição**: Disparar emails quando eventos ocorrem  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Task 1.7, 1.4

**Checklist**:
- [ ] Disparar email ao criar ideia
- [ ] Disparar email ao atingir 10 velas
- [ ] Disparar email ao entrar no ranking
- [ ] Disparar email em milestones (50, 100, 500)
- [ ] Respeitar preferências do usuário
- [ ] Testes

**Entregáveis**:
- Integração completa
- Testes

---

## FASE 2: Frontend - Reatividade & UI

### Task 2.1: Instalar React Query
**Descrição**: Adicionar React Query ao projeto  
**Prioridade**: 🔴 Alta  
**Estimativa**: 30min  
**Dependências**: Nenhuma

**Checklist**:
- [ ] `npm install @tanstack/react-query`
- [ ] Configurar QueryClientProvider em App.jsx
- [ ] Configurar opções padrão
- [ ] Testes básicos

**Entregáveis**:
- Dependência instalada
- Configuração em App.jsx

---

### Task 2.2: Criar Hooks Customizados
**Descrição**: Criar hooks para React Query  
**Prioridade**: 🔴 Alta  
**Estimativa**: 1.5h  
**Dependências**: Task 2.1

**Checklist**:
- [ ] Criar `useIdeas.js`
- [ ] Criar `useIdea.js`
- [ ] Criar `useCandle.js`
- [ ] Criar `useRanking.js`
- [ ] Criar `useUserStats.js`
- [ ] Testes

**Entregáveis**:
- Hooks em `frontend/src/hooks/`
- Testes

---

### Task 2.3: Criar Componente CandleButton
**Descrição**: Implementar botão de acender vela  
**Prioridade**: 🔴 Alta  
**Estimativa**: 1h  
**Dependências**: Task 2.2

**Checklist**:
- [ ] Criar `CandleButton.jsx`
- [ ] Usar `useCandle()` hook
- [ ] Animar vela (CSS)
- [ ] Mostrar contador
- [ ] Mostrar feedback visual
- [ ] Testes

**Entregáveis**:
- `frontend/src/components/CandleButton.jsx`
- Testes

---

### Task 2.4: Criar Componente RankingLeaderboard
**Descrição**: Implementar leaderboard de ranking  
**Prioridade**: 🔴 Alta  
**Estimativa**: 1.5h  
**Dependências**: Task 2.2

**Checklist**:
- [ ] Criar `RankingLeaderboard.jsx`
- [ ] Usar `useRanking()` hook
- [ ] Exibir top 50 usuários
- [ ] Paginação
- [ ] Destaque da posição do usuário
- [ ] Testes

**Entregáveis**:
- `frontend/src/components/RankingLeaderboard.jsx`
- Testes

---

### Task 2.5: Criar Página de Ranking
**Descrição**: Implementar página /ranking  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Task 2.4

**Checklist**:
- [ ] Criar `Ranking.jsx`
- [ ] Usar `RankingLeaderboard`
- [ ] Adicionar filtros (período)
- [ ] Responsivo
- [ ] Testes

**Entregáveis**:
- `frontend/src/pages/Ranking.jsx`
- Testes

---

### Task 2.6: Atualizar IdeaCard
**Descrição**: Adicionar vela ao componente IdeaCard  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Task 2.3

**Checklist**:
- [ ] Adicionar `CandleButton` ao IdeaCard
- [ ] Mostrar `candle_intensity`
- [ ] Mostrar badge (Novo, Popular, Viral)
- [ ] Atualizar estilos
- [ ] Testes

**Entregáveis**:
- IdeaCard atualizado
- Testes

---

### Task 2.7: Criar Componente NotificationPreferences
**Descrição**: Implementar UI de preferências de email  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Task 1.9

**Checklist**:
- [ ] Criar `NotificationPreferences.jsx`
- [ ] Checkboxes para cada tipo de email
- [ ] Salvar preferências
- [ ] Feedback visual
- [ ] Testes

**Entregáveis**:
- `frontend/src/components/NotificationPreferences.jsx`
- Testes

---

### Task 2.8: Criar Página de Settings
**Descrição**: Implementar página /settings  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Task 2.7

**Checklist**:
- [ ] Criar `Settings.jsx`
- [ ] Usar `NotificationPreferences`
- [ ] Adicionar outras configurações
- [ ] Responsivo
- [ ] Testes

**Entregáveis**:
- `frontend/src/pages/Settings.jsx`
- Testes

---

### Task 2.9: Implementar Polling de Ranking
**Descrição**: Atualizar ranking a cada 30s  
**Prioridade**: 🟡 Média  
**Estimativa**: 30min  
**Dependências**: Task 2.2

**Checklist**:
- [ ] Configurar `refetchInterval` em `useRanking()`
- [ ] Testar atualização automática
- [ ] Otimizar para não travar UI

**Entregáveis**:
- Polling implementado
- Testes

---

### Task 2.10: Atualizar App.jsx
**Descrição**: Integrar novos componentes e rotas  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Task 2.5, 2.8

**Checklist**:
- [ ] Adicionar rota /ranking
- [ ] Adicionar rota /settings
- [ ] Atualizar navegação
- [ ] Testes

**Entregáveis**:
- App.jsx atualizado
- Testes

---

## FASE 3: Testes & Otimizações

### Task 3.1: Testes de Integração Backend
**Descrição**: Testes end-to-end dos endpoints  
**Prioridade**: 🟡 Média  
**Estimativa**: 2h  
**Dependências**: Fase 1 completa

**Checklist**:
- [ ] Testar POST /api/ideas/:id/candle
- [ ] Testar GET /api/ranking/global
- [ ] Testar GET/PUT /api/user/preferences
- [ ] Testar fluxo completo
- [ ] Testes de erro

**Entregáveis**:
- Testes em `backend/tests/`

---

### Task 3.2: Testes de Integração Frontend
**Descrição**: Testes dos componentes React  
**Prioridade**: 🟡 Média  
**Estimativa**: 2h  
**Dependências**: Fase 2 completa

**Checklist**:
- [ ] Testar CandleButton
- [ ] Testar RankingLeaderboard
- [ ] Testar NotificationPreferences
- [ ] Testar hooks
- [ ] Testes de integração

**Entregáveis**:
- Testes em `frontend/tests/`

---

### Task 3.3: Otimizar Performance
**Descrição**: Otimizar queries e cache  
**Prioridade**: 🟡 Média  
**Estimativa**: 1.5h  
**Dependências**: Fase 1 e 2 completas

**Checklist**:
- [ ] Adicionar índices no banco
- [ ] Otimizar queries
- [ ] Configurar cache Redis
- [ ] Testar performance
- [ ] Documentar

**Entregáveis**:
- Índices criados
- Queries otimizadas
- Documentação

---

### Task 3.4: Documentação
**Descrição**: Documentar API e componentes  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Todas as fases

**Checklist**:
- [ ] Documentar endpoints
- [ ] Documentar hooks
- [ ] Documentar componentes
- [ ] Criar guia de uso
- [ ] Exemplos de código

**Entregáveis**:
- Documentação em `docs/`

---

## FASE 4: Deploy & Monitoramento

### Task 4.1: Configurar Variáveis de Ambiente
**Descrição**: Adicionar novas variáveis de ambiente  
**Prioridade**: 🟡 Média  
**Estimativa**: 30min  
**Dependências**: Nenhuma

**Checklist**:
- [ ] Adicionar SMTP_* em .env
- [ ] Adicionar REDIS_URL
- [ ] Adicionar RANKING_CACHE_TTL
- [ ] Documentar em .env.example

**Entregáveis**:
- .env.example atualizado

---

### Task 4.2: Configurar Docker
**Descrição**: Criar Docker Compose para deploy  
**Prioridade**: 🟡 Média  
**Estimativa**: 1h  
**Dependências**: Task 4.1

**Checklist**:
- [ ] Criar Dockerfile para backend
- [ ] Criar Dockerfile para frontend
- [ ] Criar docker-compose.yml
- [ ] Testar build local

**Entregáveis**:
- Dockerfiles
- docker-compose.yml

---

### Task 4.3: Configurar Monitoramento
**Descrição**: Adicionar logs e métricas  
**Prioridade**: 🟢 Baixa  
**Estimativa**: 1h  
**Dependências**: Nenhuma

**Checklist**:
- [ ] Configurar logger
- [ ] Adicionar métricas
- [ ] Configurar alertas
- [ ] Documentar

**Entregáveis**:
- Logger configurado
- Métricas implementadas

---

## RESUMO DE DEPENDÊNCIAS

```
Fase 1 (Backend):
  1.1 → 1.2, 1.3, 1.6, 1.7, 1.9
  1.2 → 1.4, 1.5
  1.3 → 1.4, 1.6, 1.10
  1.4 → 1.10
  1.7 → 1.8, 1.10
  1.8 → 1.10

Fase 2 (Frontend):
  2.1 → 2.2
  2.2 → 2.3, 2.4, 2.9
  2.3 → 2.6
  2.4 → 2.5
  2.5 → 2.10
  2.7 → 2.8
  2.8 → 2.10

Fase 3 (Testes):
  Fase 1 completa → 3.1
  Fase 2 completa → 3.2
  3.1, 3.2 → 3.3

Fase 4 (Deploy):
  Independente
```

---

## TIMELINE ESTIMADA

| Fase | Tarefas | Horas | Dias |
|------|---------|-------|------|
| 1 | 10 tasks | 12h | 2 dias |
| 2 | 10 tasks | 11h | 2 dias |
| 3 | 4 tasks | 6.5h | 1 dia |
| 4 | 3 tasks | 2.5h | 0.5 dia |
| **Total** | **27 tasks** | **32h** | **5.5 dias** |

---

## PRÓXIMOS PASSOS

1. ✅ Revisar requirements.md
2. ✅ Revisar design.md
3. ✅ Revisar tasks.md
4. 🔄 Começar Task 1.1 (Criar Tabelas)
5. 🔄 Implementar Fase 1 sequencialmente
6. 🔄 Implementar Fase 2 em paralelo
7. 🔄 Testes e otimizações
8. 🔄 Deploy
