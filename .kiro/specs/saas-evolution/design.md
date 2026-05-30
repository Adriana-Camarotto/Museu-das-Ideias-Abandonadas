# 🏗️ DESIGN: Arquitetura SaaS

**Status**: 📋 Planejamento  
**Versão**: 1.0.0

---

## 🗂️ ARQUITETURA DE BANCO DE DADOS

### Diagrama ER (Novo)

```
┌─────────────────────────────────────────────────────────────┐
│                    auth.users (Supabase)                    │
│  id (UUID) | email | created_at | user_metadata             │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│    ideas     │  │ idea_events  │  │user_preferences  │
│ (existente)  │  │   (NOVO)     │  │     (NOVO)       │
└──────────────┘  └──────────────┘  └──────────────────┘
        │                │
        └────────────────┴─────────────────────┐
                                               │
                                    ┌──────────▼──────────┐
                                    │  ranking_cache     │
                                    │  (NOVO - Redis)    │
                                    └────────────────────┘
```

### Tabela: idea_events (NOVA)

```sql
CREATE TABLE idea_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  points INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_event_type CHECK (
    type IN ('candle_light', 'create', 'archive', 'view')
  )
);

-- Índices
CREATE INDEX idx_idea_events_idea_id ON idea_events(idea_id);
CREATE INDEX idx_idea_events_user_id ON idea_events(user_id);
CREATE INDEX idx_idea_events_type ON idea_events(type);
CREATE INDEX idx_idea_events_created_at ON idea_events(created_at DESC);

-- RLS
ALTER TABLE idea_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their ideas"
  ON idea_events FOR SELECT
  USING (
    idea_id IN (
      SELECT id FROM ideas WHERE user_id = auth.uid()
    )
  );
```

### Tabela: user_preferences (NOVA)

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_on_idea_created BOOLEAN DEFAULT true,
  email_on_trending BOOLEAN DEFAULT true,
  email_on_ranking_update BOOLEAN DEFAULT true,
  email_on_milestone BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can only update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid());
```

### Atualização: Tabela ideas

```sql
-- Adicionar coluna se não existir
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS candle_intensity VARCHAR(20) DEFAULT 'low';

-- Criar índice para ranking
CREATE INDEX IF NOT EXISTS idx_ideas_honor_count_desc ON ideas(honor_count DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id_created_at ON ideas(user_id, created_at DESC);
```

---

## 🔧 ARQUITETURA DE BACKEND

### Estrutura de Pastas (Atualizada)

```
backend/src/
├── config/
│   ├── environment.js (ATUALIZADO - adicionar EMAIL_*)
│   └── database.js (NOVO - conexão com Redis)
├── controllers/
│   ├── IdeaController.js (ATUALIZADO)
│   ├── RankingController.js (NOVO)
│   └── UserPreferencesController.js (NOVO)
├── middleware/
│   ├── authMiddleware.js (existente)
│   └── errorHandler.js (existente)
├── routes/
│   ├── ideas.js (ATUALIZADO)
│   ├── ranking.js (NOVO)
│   └── preferences.js (NOVO)
├── services/
│   ├── IdeaService.js (ATUALIZADO)
│   ├── RankingService.js (NOVO)
│   ├── EmailService.js (NOVO)
│   ├── EventService.js (NOVO)
│   └── GeminiService.js (existente)
├── queues/
│   └── emailQueue.js (NOVO)
├── templates/
│   ├── ideaCreated.html (NOVO)
│   ├── ideaTrending.html (NOVO)
│   ├── rankingUpdate.html (NOVO)
│   └── milestone.html (NOVO)
└── server.js (ATUALIZADO)
```

### Serviços Novos

#### 1. RankingService

```javascript
class RankingService {
  // Calcular score de um usuário
  async calculateUserScore(userId) {
    // Buscar todos os eventos do usuário
    // Aplicar regra de pontuação
    // Retornar score total
  }

  // Obter ranking global
  async getGlobalRanking(limit, offset, period) {
    // Buscar top usuários
    // Calcular posição
    // Retornar com paginação
  }

  // Atualizar cache de ranking
  async updateRankingCache() {
    // Recalcular scores
    // Armazenar em Redis
    // Retornar timestamp
  }

  // Obter posição do usuário
  async getUserRankPosition(userId) {
    // Buscar posição no ranking
    // Retornar posição + percentil
  }

  // Detectar ideias virais
  async detectViralIdeas() {
    // Buscar ideias com honor_count > 90º percentil
    // Retornar lista
  }
}
```

#### 2. EventService

```javascript
class EventService {
  // Registrar evento
  async registerEvent(ideaId, userId, type, points, metadata) {
    // Validar tipo
    // Inserir em idea_events
    // Retornar evento criado
  }

  // Obter eventos de uma ideia
  async getIdeaEvents(ideaId, limit, offset) {
    // Buscar eventos
    // Retornar com paginação
  }

  // Obter eventos do usuário
  async getUserEvents(userId, limit, offset) {
    // Buscar eventos do usuário
    // Retornar com paginação
  }
}
```

#### 3. EmailService

```javascript
class EmailService {
  // Enviar email de ideia criada
  async sendIdeaCreatedEmail(userId, ideaData) {
    // Verificar preferências do usuário
    // Renderizar template
    // Adicionar à fila
  }

  // Enviar email de ideia trending
  async sendIdeaTrendingEmail(userId, ideaData) {
    // Verificar preferências
    // Renderizar template
    // Adicionar à fila
  }

  // Enviar email de ranking atualizado
  async sendRankingUpdateEmail(userId, rankingData) {
    // Verificar preferências
    // Renderizar template
    // Adicionar à fila
  }

  // Enviar email de milestone
  async sendMilestoneEmail(userId, ideaData, milestone) {
    // Verificar preferências
    // Renderizar template
    // Adicionar à fila
  }

  // Processar fila de email
  async processEmailQueue() {
    // Buscar emails pendentes
    // Enviar com Nodemailer
    // Retry em caso de erro
  }
}
```

---

## 🔌 NOVOS ENDPOINTS

### POST /api/ideas/:id/candle

**Responsabilidade**: Acender vela em uma ideia

```javascript
// Fluxo
1. Validar JWT
2. Validar ideia existe
3. Verificar se usuário já acendeu vela (opcional - permitir múltiplas)
4. Incrementar honor_count
5. Registrar evento em idea_events
6. Calcular novo score do usuário
7. Atualizar ranking cache
8. Retornar dados atualizados

// Request
POST /api/ideas/550e8400-e29b-41d4-a716-446655440000/candle
Authorization: Bearer <token>

// Response 200
{
  "success": true,
  "data": {
    "ideaId": "550e8400-e29b-41d4-a716-446655440000",
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

// Response 404
{
  "success": false,
  "error": "Ideia não encontrada"
}
```

### GET /api/ranking/global

**Responsabilidade**: Obter ranking global

```javascript
// Fluxo
1. Validar JWT (opcional)
2. Buscar ranking do cache (Redis)
3. Se cache expirado, recalcular
4. Aplicar paginação
5. Retornar com metadados

// Request
GET /api/ranking/global?limit=50&offset=0&period=all
Authorization: Bearer <token> (opcional)

// Response 200
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
      }
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

### GET /api/user/preferences

**Responsabilidade**: Obter preferências de notificação do usuário

```javascript
// Request
GET /api/user/preferences
Authorization: Bearer <token>

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "email_on_idea_created": true,
    "email_on_trending": true,
    "email_on_ranking_update": true,
    "email_on_milestone": true
  }
}
```

### PUT /api/user/preferences

**Responsabilidade**: Atualizar preferências de notificação

```javascript
// Request
PUT /api/user/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "email_on_idea_created": false,
  "email_on_trending": true,
  "email_on_ranking_update": true,
  "email_on_milestone": false
}

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "email_on_idea_created": false,
    "email_on_trending": true,
    "email_on_ranking_update": true,
    "email_on_milestone": false
  },
  "message": "Preferências atualizadas com sucesso"
}
```

---

## 🎨 ARQUITETURA DE FRONTEND

### Estrutura de Pastas (Atualizada)

```
frontend/src/
├── components/
│   ├── IdeaCard.jsx (ATUALIZADO - adicionar vela)
│   ├── CandleButton.jsx (NOVO)
│   ├── RankingLeaderboard.jsx (NOVO)
│   ├── UserRankCard.jsx (NOVO)
│   ├── NotificationPreferences.jsx (NOVO)
│   └── ... (existentes)
├── hooks/
│   ├── useIdeas.js (NOVO - React Query)
│   ├── useRanking.js (NOVO - React Query)
│   ├── useUserStats.js (NOVO - React Query)
│   └── useCandle.js (NOVO - Mutação)
├── services/
│   ├── ideaService.js (ATUALIZADO)
│   ├── rankingService.js (NOVO)
│   └── preferencesService.js (NOVO)
├── store/
│   └── museumStore.js (NOVO - Zustand opcional)
├── pages/
│   ├── Museum.jsx (ATUALIZADO)
│   ├── Ranking.jsx (NOVO)
│   └── Settings.jsx (NOVO)
└── App.jsx (ATUALIZADO)
```

### Hooks Customizados

#### useIdeas.js

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useIdeas(status = 'active') {
  return useQuery({
    queryKey: ['ideas', status],
    queryFn: () => ideaService.listIdeas(status),
    staleTime: 30000, // 30s
    refetchInterval: 60000, // 1min
  });
}

export function useIdea(ideaId) {
  return useQuery({
    queryKey: ['idea', ideaId],
    queryFn: () => ideaService.getIdea(ideaId),
  });
}
```

#### useCandle.js

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCandle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ideaId) => ideaService.lightCandle(ideaId),
    onSuccess: (data) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      
      // Animar vela
      triggerCandleAnimation(data.ideaId);
    },
  });
}
```

#### useRanking.js

```javascript
import { useQuery } from '@tanstack/react-query';

export function useRanking(limit = 50, offset = 0, period = 'all') {
  return useQuery({
    queryKey: ['ranking', limit, offset, period],
    queryFn: () => rankingService.getGlobalRanking(limit, offset, period),
    staleTime: 30000, // 30s
    refetchInterval: 60000, // 1min (polling)
  });
}
```

### Componentes Novos

#### CandleButton.jsx

```jsx
export function CandleButton({ ideaId, honorCount, onSuccess }) {
  const { mutate: lightCandle, isPending } = useCandle();
  
  const handleClick = () => {
    lightCandle(ideaId, {
      onSuccess: (data) => {
        // Animar
        animateCandle(ideaId);
        // Callback
        onSuccess?.(data);
      }
    });
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isPending}
      className="candle-button"
    >
      🕯️ {honorCount}
    </button>
  );
}
```

#### RankingLeaderboard.jsx

```jsx
export function RankingLeaderboard() {
  const { data, isLoading } = useRanking(50, 0, 'all');
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="leaderboard">
      {data.ranking.map((entry, idx) => (
        <UserRankCard key={entry.userId} entry={entry} />
      ))}
    </div>
  );
}
```

---

## 🔄 FLUXO DE DADOS

### Acender Vela (Completo)

```
Frontend (React)
    ↓
CandleButton.onClick()
    ↓
useCandle().mutate(ideaId)
    ↓
POST /api/ideas/:id/candle
    ↓
Backend - IdeaController.lightCandle()
    ↓
1. Validar JWT
2. Validar ideia
3. IdeaService.incrementHonor()
4. EventService.registerEvent()
5. RankingService.calculateUserScore()
6. RankingService.updateRankingCache()
    ↓
Response com dados atualizados
    ↓
Frontend - onSuccess callback
    ↓
1. queryClient.invalidateQueries()
2. animateCandle()
3. Atualizar UI
    ↓
React Query refetch automático
    ↓
UI atualiza com novos dados
```

---

## 💾 CACHE STRATEGY

### Redis Cache

```javascript
// Chaves de cache
ranking:global:all = JSON (TTL: 5min)
ranking:global:week = JSON (TTL: 5min)
ranking:global:month = JSON (TTL: 5min)
user:score:{userId} = number (TTL: 10min)
idea:viral:list = JSON (TTL: 1hour)

// Invalidação
- Quando vela acesa: invalidar ranking:global:*
- Quando ideia criada: invalidar ranking:global:*
- Quando ranking atualizado: invalidar user:score:*
```

### React Query Cache

```javascript
// Stale time: 30s (dados considerados frescos)
// Cache time: 5min (dados mantidos em memória)
// Refetch interval: 1min (polling)

queryClient.setDefaultOptions({
  queries: {
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  },
});
```

---

## 📧 FILA DE EMAIL

### Arquitetura

```
Evento (ideia criada, vela acesa, etc)
    ↓
EmailService.send*Email()
    ↓
Adicionar à fila (Redis/Bull ou em memória)
    ↓
Worker processa fila a cada 10s
    ↓
Nodemailer envia email
    ↓
Retry automático (3 tentativas)
    ↓
Log de sucesso/erro
```

### Implementação Simples (Em Memória)

```javascript
class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(email) {
    this.queue.push({
      ...email,
      retries: 0,
      createdAt: Date.now()
    });
    
    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const email = this.queue.shift();
      
      try {
        await sendEmail(email);
      } catch (error) {
        if (email.retries < 3) {
          email.retries++;
          this.queue.push(email);
        }
      }
      
      await sleep(1000); // 1s entre emails
    }
    
    this.processing = false;
  }
}
```

---

## 🔐 SEGURANÇA

### Validações

- ✅ JWT obrigatório em rotas protegidas
- ✅ user_id extraído do token (nunca do body)
- ✅ Acesso cruzado bloqueado
- ✅ Rate limiting em endpoints críticos
- ✅ Validação de entrada (tipos, ranges)
- ✅ SQL injection prevenido (Supabase)
- ✅ CORS configurado

### Rate Limiting

```javascript
// Exemplo: 100 requisições por minuto por IP
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Muitas requisições, tente novamente mais tarde'
});

app.use('/api/', limiter);
```

---

## 📊 MONITORAMENTO

### Métricas

- Tempo de resposta de endpoints
- Taxa de erro
- Tamanho de fila de email
- Cache hit rate
- Número de usuários ativos
- Score médio dos usuários

### Logs

```javascript
// Exemplo
logger.info('Vela acesa', {
  ideaId,
  userId,
  newHonorCount,
  userScore,
  timestamp
});

logger.error('Erro ao enviar email', {
  userId,
  error: error.message,
  timestamp
});
```

---

## 🚀 DEPLOYMENT

### Variáveis de Ambiente (Novas)

```env
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM=noreply@museu-ideias.com

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# Ranking
RANKING_CACHE_TTL=300
RANKING_UPDATE_INTERVAL=60000

# Email Queue
EMAIL_QUEUE_INTERVAL=10000
EMAIL_MAX_RETRIES=3
```

### Docker Compose (Exemplo)

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://backend:3001
```
