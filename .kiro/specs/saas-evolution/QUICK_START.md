# 🚀 QUICK START: Começar Agora

**Status**: 📋 Guia Rápido  
**Versão**: 1.0.0

---

## 📋 CHECKLIST RÁPIDO

### ✅ Antes de Começar

- [ ] Ler `OVERVIEW.md` (5 min)
- [ ] Ler `requirements.md` (10 min)
- [ ] Ler `design.md` (15 min)
- [ ] Revisar `tasks.md` (10 min)
- [ ] Ter acesso ao Supabase
- [ ] Ter Node.js 18+ instalado
- [ ] Ter Git configurado

---

## 🎯 PRIMEIRA TAREFA: Task 1.1 (30 min)

### Criar Tabelas no Supabase

#### Passo 1: Acessar Supabase

1. Ir para https://supabase.com
2. Fazer login
3. Selecionar projeto "Museu das Ideias Abandonadas"
4. Ir para "SQL Editor"

#### Passo 2: Executar SQL

Copiar e colar este SQL no editor:

```sql
-- Criar tabela idea_events
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

-- Criar índices
CREATE INDEX idx_idea_events_idea_id ON idea_events(idea_id);
CREATE INDEX idx_idea_events_user_id ON idea_events(user_id);
CREATE INDEX idx_idea_events_type ON idea_events(type);
CREATE INDEX idx_idea_events_created_at ON idea_events(created_at DESC);

-- Ativar RLS
ALTER TABLE idea_events ENABLE ROW LEVEL SECURITY;

-- Criar tabela user_preferences
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

-- Ativar RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Adicionar coluna em ideas
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS candle_intensity VARCHAR(20) DEFAULT 'low';

-- Criar índice para ranking
CREATE INDEX IF NOT EXISTS idx_ideas_honor_count_desc ON ideas(honor_count DESC);
```

#### Passo 3: Executar

1. Clicar em "Run" (ou Ctrl+Enter)
2. Verificar se não há erros
3. ✅ Pronto!

---

## 🔧 SEGUNDA TAREFA: Task 1.2 (2h)

### Criar RankingService

#### Passo 1: Criar arquivo

Criar: `backend/src/services/RankingService.js`

#### Passo 2: Copiar código

Copiar o código de `IMPLEMENTATION_GUIDE.md` → Seção "1. RankingService.js"

#### Passo 3: Testar

```bash
cd backend
npm run dev
```

Verificar se não há erros de sintaxe

---

## 🎨 TERCEIRA TAREFA: Task 2.1 (30 min)

### Instalar React Query

#### Passo 1: Instalar dependência

```bash
cd frontend
npm install @tanstack/react-query
```

#### Passo 2: Configurar em App.jsx

Adicionar no topo:

```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchInterval: 60 * 1000,
    },
  },
});
```

Envolver App com provider:

```javascript
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* seu app aqui */}
    </QueryClientProvider>
  );
}
```

#### Passo 3: Testar

```bash
npm run dev
```

Verificar se não há erros no console

---

## 📊 FLUXO VISUAL: ACENDER VELA

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO CLICA                            │
│                  "Acender Vela" 🕯️                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React)                               │
│  CandleButton.onClick()                                     │
│  → useCandle().mutate(ideaId)                               │
│  → POST /api/ideas/:id/candle                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Express)                              │
│  IdeaController.lightCandle()                               │
│  1. Validar JWT                                             │
│  2. Validar ideia                                           │
│  3. Incrementar honor_count                                 │
│  4. Registrar evento em idea_events                         │
│  5. Calcular score do usuário                               │
│  6. Atualizar ranking cache                                 │
│  7. Retornar dados atualizados                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React)                               │
│  onSuccess callback                                         │
│  1. queryClient.invalidateQueries()                         │
│  2. Animar vela                                             │
│  3. Mostrar "+2 pontos"                                     │
│  4. React Query refetch automático                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI ATUALIZADA                            │
│  • Contador de velas: 41 → 42                               │
│  • Score do usuário: 148 → 150                              │
│  • Ranking: posição atualizada                              │
│  • Sem refresh de página ✨                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### Semana 1: Backend

```
Dia 1:
  ✅ Task 1.1: Criar tabelas (30 min)
  ✅ Task 1.2: RankingService (2h)
  ✅ Task 1.3: EventService (1h)

Dia 2:
  ✅ Task 1.4: Endpoint POST /api/ideas/:id/candle (1.5h)
  ✅ Task 1.5: Endpoint GET /api/ranking/global (1.5h)
  ✅ Task 1.6: Atualizar IdeaService (30 min)

Dia 3:
  ✅ Task 1.7: EmailService (2h)
  ✅ Task 1.8: Templates de email (1h)
  ✅ Task 1.9: Endpoints de preferências (1h)
  ✅ Task 1.10: Integrar emails (1h)
```

### Semana 2: Frontend

```
Dia 1:
  ✅ Task 2.1: Instalar React Query (30 min)
  ✅ Task 2.2: Criar hooks (1.5h)
  ✅ Task 2.3: CandleButton (1h)

Dia 2:
  ✅ Task 2.4: RankingLeaderboard (1.5h)
  ✅ Task 2.5: Página /ranking (1h)
  ✅ Task 2.6: Atualizar IdeaCard (1h)

Dia 3:
  ✅ Task 2.7: NotificationPreferences (1h)
  ✅ Task 2.8: Página /settings (1h)
  ✅ Task 2.9: Polling (30 min)
  ✅ Task 2.10: Atualizar App.jsx (1h)
```

### Semana 3: Testes & Deploy

```
Dia 1-2:
  ✅ Task 3.1: Testes backend (2h)
  ✅ Task 3.2: Testes frontend (2h)

Dia 3:
  ✅ Task 3.3: Otimizações (1.5h)
  ✅ Task 3.4: Documentação (1h)
  ✅ Task 4.1: Variáveis de ambiente (30 min)
  ✅ Task 4.2: Docker (1h)
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

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

---

## 🧪 TESTAR LOCALMENTE

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Testar endpoint
curl -X POST http://localhost:3001/api/ideas/550e8400-e29b-41d4-a716-446655440000/candle \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "Content-Type: application/json"
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Acessar em http://localhost:5173
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Tabela não existe"

**Solução**: Executar SQL novamente no Supabase SQL Editor

### Erro: "JWT inválido"

**Solução**: Verificar se token está sendo enviado corretamente no header

### Erro: "React Query não está definido"

**Solução**: Verificar se QueryClientProvider está envolvendo o App

### Erro: "Email não enviado"

**Solução**: Verificar credenciais SMTP em .env

---

## 📞 RECURSOS

- 📖 `OVERVIEW.md` - Visão geral
- 📋 `requirements.md` - Requisitos detalhados
- 🏗️ `design.md` - Arquitetura técnica
- 📝 `tasks.md` - Tarefas específicas
- 💻 `IMPLEMENTATION_GUIDE.md` - Exemplos de código
- 🚀 `QUICK_START.md` - Este documento

---

## ✅ PRÓXIMOS PASSOS

1. ✅ Ler este documento (5 min)
2. 🔄 Executar Task 1.1 (30 min)
3. 🔄 Executar Task 1.2 (2h)
4. 🔄 Executar Task 2.1 (30 min)
5. 🔄 Continuar com próximas tasks

---

## 🎉 SUCESSO!

Quando terminar todas as tasks:

- ✅ Sistema de gamificação funcionando
- ✅ Ranking global em tempo real
- ✅ Velas acesas com animação
- ✅ Email de notificações
- ✅ UI reativa sem refresh
- ✅ Pronto para produção

---

**Versão**: 1.0.0  
**Data**: Maio 2026  
**Tempo Total**: ~32 horas em 3 semanas
