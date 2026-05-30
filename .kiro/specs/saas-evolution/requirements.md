# 🎯 SPEC: Evolução SaaS - Museu das Ideias Abandonadas

**Status**: 📋 Planejamento  
**Versão**: 1.0.0  
**Data**: Maio 2026  
**Objetivo**: Transformar o sistema em plataforma SaaS com gamificação, ranking em tempo real e sistema de "velas acesas"

---

## 📊 VISÃO GERAL

### Transformação Proposta
```
ANTES (MVP)                    DEPOIS (SaaS)
├─ Análise de ideias          ├─ Análise de ideias ✅
├─ Homenagens simples         ├─ Sistema "Velas Acesas" 🕯️
├─ Sem ranking                ├─ Ranking Global em Tempo Real 🏆
├─ Sem gamificação            ├─ Sistema de Pontuação 📊
├─ Sem notificações           ├─ Email Notifications 📩
└─ UI estática                └─ UI Reativa (React Query/Zustand) ⚡
```

### Pilares da Evolução
1. **Gamificação**: Sistema de pontos baseado em engajamento
2. **Ranking**: Leaderboard global atualizado em tempo real
3. **Velas Acesas**: Interação principal (candle_light)
4. **Notificações**: Email assíncrono com opt-in
5. **Reatividade**: UI atualiza sem refresh

---

## 🎮 SISTEMA DE GAMIFICAÇÃO

### Regra de Pontuação

| Ação | Pontos | Descrição |
|------|--------|-----------|
| 🕯️ Vela acesa em ideia própria | +1 | Engajamento básico |
| 🕯️ Vela acesa em ideia de outro | +2 | Engajamento com comunidade |
| 🔥 Ideia viral (top 10%) | +5 | Bônus por popularidade |
| ⭐ Ideia no ranking semanal | +10 | Destaque especial |

### Cálculo de Score
```javascript
totalScore = (
  (candlesOwnIdeas * 1) +
  (candlesOtherIdeas * 2) +
  (viralIdeas * 5) +
  (weeklyRankedIdeas * 10)
)
```

### Intensidade da Vela (UI)
```javascript
candle_intensity = {
  "low": honor_count < 5,
  "medium": honor_count >= 5 && honor_count < 20,
  "high": honor_count >= 20 && honor_count < 50,
  "viral": honor_count >= 50
}
```

---

## 🕯️ SISTEMA "VELA ACESA"

### Fluxo de Interação

```
Usuário clica em "Acender Vela"
    ↓
Frontend: POST /api/ideas/:id/candle
    ↓
Backend:
  1. Validar ideia existe
  2. Incrementar honor_count
  3. Registrar evento em idea_events
  4. Calcular novo score do usuário
  5. Atualizar ranking cache
  6. Retornar dados atualizados
    ↓
Frontend:
  1. Atualizar contador de velas
  2. Animar vela (efeito visual)
  3. Invalidar queries (React Query)
  4. Atualizar ranking em tempo real
```

### Endpoint: POST /api/ideas/:id/candle

**Request**:
```json
{
  "ideaId": "uuid",
  "userId": "uuid (from JWT)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "ideaId": "uuid",
    "honor_count": 42,
    "candle_intensity": "high",
    "userScore": 150,
    "userRankPosition": 5,
    "event": {
      "id": "uuid",
      "type": "candle_light",
      "points": 2,
      "created_at": "2026-05-30T10:30:00Z"
    }
  },
  "message": "Vela acesa com sucesso! +2 pontos"
}
```

---

## 🏆 RANKING GLOBAL

### Endpoint: GET /api/ranking/global

**Query Params**:
- `limit`: 10-100 (default: 50)
- `offset`: 0+ (default: 0)
- `period`: 'all' | 'week' | 'month' (default: 'all')

**Response**:
```json
{
  "success": true,
  "data": {
    "ranking": [
      {
        "position": 1,
        "userId": "uuid",
        "username": "João Silva",
        "totalIdeas": 12,
        "totalCandles": 245,
        "score": 350,
        "topIdea": {
          "id": "uuid",
          "nome": "App de Meditação",
          "honor_count": 85,
          "candle_intensity": "viral"
        },
        "badge": "🏆 Lendário"
      },
      // ... mais usuários
    ],
    "pagination": {
      "total": 1250,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    },
    "period": "all",
    "lastUpdated": "2026-05-30T10:30:00Z"
  }
}
```

### UserRankingDTO
```typescript
interface UserRankingDTO {
  position: number;
  userId: string;
  username: string;
  totalIdeas: number;
  totalCandles: number;
  score: number;
  topIdea: IdeaCardDTO;
  badge?: string;
  percentile?: number;
}
```

---

## 📧 SISTEMA DE EMAIL

### Eventos que Disparam Email

| Evento | Condição | Email |
|--------|----------|-------|
| Ideia criada | Sempre (se opt-in) | "Sua ideia nasceu no museu" |
| Ideia trending | honor_count >= 10 | "Sua ideia está sendo lembrada" |
| Ranking atualizado | Entrou top 100 | "Você entrou no ranking do museu" |
| Milestone | honor_count = 50, 100, 500 | "Sua ideia atingiu X velas" |

### EmailService

**Métodos**:
```javascript
sendIdeaCreatedEmail(userId, ideaData)
sendIdeaTrendingEmail(userId, ideaData)
sendRankingUpdateEmail(userId, rankingData)
sendMilestoneEmail(userId, ideaData, milestone)
```

**Características**:
- ✅ Assíncrono (não bloqueia API)
- ✅ Fila simples (Bull/Redis ou em memória)
- ✅ Retry automático (3 tentativas)
- ✅ Template HTML responsivo
- ✅ Opt-in/opt-out por usuário

### Tabela: user_preferences
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_on_idea_created BOOLEAN DEFAULT true,
  email_on_trending BOOLEAN DEFAULT true,
  email_on_ranking_update BOOLEAN DEFAULT true,
  email_on_milestone BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 📊 NOVA TABELA: idea_events

**Propósito**: Rastrear todas as interações com ideias para análise e ranking

```sql
CREATE TABLE idea_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'candle_light' | 'create' | 'archive' | 'view'
  points INTEGER DEFAULT 0,
  metadata JSONB, -- Dados adicionais (ex: { "from_user_id": "uuid" })
  created_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_event_type CHECK (type IN ('candle_light', 'create', 'archive', 'view'))
);

-- Índices para performance
CREATE INDEX idx_idea_events_idea_id ON idea_events(idea_id);
CREATE INDEX idx_idea_events_user_id ON idea_events(user_id);
CREATE INDEX idx_idea_events_type ON idea_events(type);
CREATE INDEX idx_idea_events_created_at ON idea_events(created_at DESC);
```

---

## 🧩 DTOs ATUALIZADAS

### IdeaCardDTO (ATUALIZADO)
```typescript
interface IdeaCardDTO {
  id: string;
  nome: string;
  categoria: string;
  survival_percentage: number;
  cause_of_death_summary: string;
  ai_verdict: string;
  honor_count: number;
  
  // NOVO: Gamificação
  candle_intensity: "low" | "medium" | "high" | "viral";
  
  // NOVO: UI
  ui: {
    emoji: string; // 🕯️ 🔥 ⭐
    badge_color: string; // "blue" | "orange" | "red" | "gold"
    label: string; // "Novo" | "Popular" | "Viral" | "Lendário"
  };
  
  // Metadados
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

### RankingEntryDTO
```typescript
interface RankingEntryDTO {
  position: number;
  userId: string;
  username: string;
  totalIdeas: number;
  totalCandles: number;
  score: number;
  topIdea: IdeaCardDTO;
  badge?: string;
  percentile?: number;
}
```

---

## ⚡ FRONTEND - REATIVIDADE

### Estratégia de Atualização

**Opção 1: React Query (Recomendado)**
```javascript
// Invalidar queries após mutação
queryClient.invalidateQueries({ queryKey: ['ideas'] });
queryClient.invalidateQueries({ queryKey: ['ranking'] });
queryClient.invalidateQueries({ queryKey: ['userStats'] });
```

**Opção 2: Zustand (Global Store)**
```javascript
// Store centralizado
const useMuseumStore = create((set) => ({
  ideas: [],
  ranking: [],
  userStats: {},
  updateIdea: (id, data) => set(state => ({
    ideas: state.ideas.map(i => i.id === id ? {...i, ...data} : i)
  }))
}));
```

### Polling vs WebSocket
- **Polling (MVP)**: GET /api/ranking/global a cada 30s
- **WebSocket (Futuro)**: Conexão persistente para atualizações em tempo real

---

## 🔁 FLUXO FINAL (EXPERIÊNCIA DO USUÁRIO)

### 1️⃣ Criar Ideia
```
Usuário preenche formulário
    ↓
Frontend valida
    ↓
POST /api/ideas/analyze (com JWT)
    ↓
Backend:
  - Valida entrada
  - Gera hash
  - Verifica duplicação
  - Chama Gemini
  - Salva no Supabase
  - Registra evento em idea_events
  - Envia email (assíncrono)
    ↓
Frontend:
  - Exibe resultado
  - Invalida queries
  - Atualiza Museu automaticamente
  - Mostra notificação de sucesso
```

### 2️⃣ Acender Vela 🕯️
```
Usuário clica em "Acender Vela"
    ↓
Frontend: POST /api/ideas/:id/candle
    ↓
Backend:
  - Incrementa honor_count
  - Registra evento (candle_light)
  - Calcula novo score do usuário
  - Atualiza ranking cache
  - Retorna dados atualizados
    ↓
Frontend:
  - Anima vela (efeito visual)
  - Atualiza contador
  - Invalida queries
  - Atualiza ranking em tempo real
  - Mostra "+2 pontos"
```

### 3️⃣ Ranking Global
```
Usuário acessa /ranking
    ↓
Frontend: GET /api/ranking/global
    ↓
Backend:
  - Calcula scores de todos os usuários
  - Ordena por score DESC
  - Retorna top 50 com paginação
    ↓
Frontend:
  - Exibe leaderboard
  - Polling a cada 30s para atualizar
  - Destaca posição do usuário
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Backend - Gamificação
- [ ] Criar tabela `idea_events`
- [ ] Criar tabela `user_preferences`
- [ ] Criar `RankingService`
- [ ] Criar endpoint `POST /api/ideas/:id/candle`
- [ ] Criar endpoint `GET /api/ranking/global`
- [ ] Atualizar `IdeaService.incrementHonor()` para registrar eventos
- [ ] Criar `EmailService` com fila assíncrona
- [ ] Testes de endpoints

### Fase 2: Frontend - Reatividade
- [ ] Instalar React Query
- [ ] Criar hooks customizados (useIdeas, useRanking, useUserStats)
- [ ] Atualizar componentes para usar React Query
- [ ] Implementar invalidação de queries
- [ ] Criar componente de Ranking
- [ ] Animar vela acesa (CSS/Framer Motion)
- [ ] Polling para atualizar ranking

### Fase 3: Email & Notificações
- [ ] Configurar Nodemailer
- [ ] Criar templates HTML
- [ ] Implementar fila de email
- [ ] Criar endpoint `GET/PUT /api/user/preferences`
- [ ] Testes de envio de email

### Fase 4: Otimizações
- [ ] Cache de ranking (Redis)
- [ ] Índices no banco de dados
- [ ] Compressão de respostas
- [ ] Rate limiting
- [ ] Monitoramento

---

## 🎯 MÉTRICAS DE SUCESSO

- ✅ Vela acesa registra evento em < 500ms
- ✅ Ranking atualiza em < 2s
- ✅ Email enviado em < 5s (assíncrono)
- ✅ UI não trava durante atualização
- ✅ 99% de uptime
- ✅ Suporta 10k+ usuários simultâneos

---

## 📚 REFERÊNCIAS

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Nodemailer](https://nodemailer.com/)
- [Bull Queue](https://github.com/OptimalBits/bull)
