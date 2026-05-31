<<<<<<< Updated upstream
# 🏛️ Museu das Ideias Abandonadas - v3.0
=======
# Museu das Ideias Abandonadas
>>>>>>> Stashed changes

Uma experiencia web para registrar ideias que ficaram pelo caminho e transformar abandono em analise, humor e aprendizado.

<<<<<<< Updated upstream
**Agora com autenticação Supabase e sistema multi-tenant!**

## 📖 Documentação

**Toda a documentação está em um único arquivo:**

### 📄 [DOCUMENTACAO_UNIFICADA.md](./DOCUMENTACAO_UNIFICADA.md)

Contém:
- ✅ Quick Start (5 minutos)
- ✅ Autenticação Supabase com JWT
- ✅ Arquitetura completa
- ✅ Fluxos principais (análise, homenagens, ressurreição)
- ✅ 6 endpoints protegidos com exemplos
- ✅ Testes locais com autenticação (4 formas)
- ✅ Schema SQL completo com RLS
- ✅ Segurança e boas práticas
- ✅ Troubleshooting
=======
## O Que O Projeto Faz
>>>>>>> Stashed changes

O usuario acessa a aplicacao, faz login, registra uma ideia abandonada e recebe uma analise criativa gerada por IA. A interface tambem organiza cards, filtros, busca, ranking e um memorial visual das ideias.

<<<<<<< Updated upstream
## 🚀 Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Testar

```bash
node test-idea-service.js
```

### 3. Configurar (Opcional)

Crie `.env` na pasta `backend`:

```env
GEMINI_API_KEY=sua-chave-aqui
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
=======
## Tecnologias

- Frontend: React, Vite, CSS responsivo
- Backend: Node.js, Express
- IA: Google Gemini
- Autenticacao: Supabase Auth no frontend e rotas de apoio no backend
- Banco/servicos: Supabase, quando configurado
- Deploy frontend: Vercel
- Deploy backend: Render

## Estrutura Geral

```text
.
├── frontend/          # Aplicacao React/Vite
├── backend/           # API Express
│   ├── src/           # Backend estruturado com rotas, services e middlewares
│   └── server.js      # Backend legado/simples mantido no historico do projeto
├── docs/              # Documentacao de deploy, ambiente e handoff
├── package.json       # Scripts da raiz com workspaces
└── package-lock.json
```

Nao envie para o Git:

- `node_modules`
- `dist`
- `.env`
- arquivos com tokens, chaves ou segredos

## Como Rodar Localmente

Instale dependencias na raiz:

```powershell
npm install
```

Backend:

```powershell
npm run dev
```

Frontend:

```powershell
cd frontend
npm run dev
```

Por padrao:

- Frontend local: `http://localhost:5173`
- Backend local: `http://localhost:3001`

## Variaveis De Ambiente

Frontend local:

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key_supabase
```

Frontend em producao:

```env
VITE_API_URL=https://museu-das-ideias-abandonadas.onrender.com
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key_supabase
```

Backend:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=sua_chave_aqui
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_anon_key_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

Nao coloque valores reais de segredo na documentacao.

## Como Testar

Build do frontend:

```powershell
npm run build
>>>>>>> Stashed changes
```

Lint do frontend:

<<<<<<< Updated upstream
## ✨ O que foi Implementado (v3.0)

### Fase 3 - Autenticação Supabase

✅ **Middleware de Autenticação** - Validação JWT do Supabase  
✅ **Multi-Tenant** - Cada usuário tem seu próprio museu  
✅ **Proteção de Rotas** - Todos endpoints requerem JWT  
✅ **Isolamento de Dados** - Usuário só acessa suas ideias  
✅ **Segurança** - userId extraído do token, nunca do frontend  

### Fases Anteriores

✅ **IdeaService** - Gerenciamento completo de ideias  
✅ **Deduplicação** - Hash SHA-256 para evitar análises duplicadas  
✅ **Persistência** - Salva ideias com análise da IA  
✅ **Homenagens** - Sistema com triggers visuais  
✅ **Ressurreição** - Delete lógico mantendo histórico  
✅ **Segurança** - Validação robusta em todas operações  

---

## 📊 Arquitetura

```
FRONTEND (React)
    ↓
ROUTES (7 endpoints)
    ↓
CONTROLLERS (IdeaController)
    ↓
SERVICES (GeminiService + IdeaService)
    ↓
BANCO DE DADOS (Supabase ou Memória)
```

---

## 🎯 Endpoints

**⚠️ Todos requerem autenticação JWT**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/ideas/analyze` | Analisar + Persistir |
| GET | `/api/ideas` | Listar com filtros |
| GET | `/api/ideas/:id` | Obter ideia |
| POST | `/api/ideas/:id/honor` | Adicionar homenagem |
| POST | `/api/ideas/:id/revive` | Arquivar ideia |
| GET | `/api/ideas/stats/user` | Estatísticas |

**Exemplo com autenticação:**
```bash
TOKEN="seu-jwt-token"

curl -X POST http://localhost:3001/api/ideas/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "App de Meditação",
    "categoria": "SaaS",
    "empolgacao": 4,
    "motivo": "Falta de tempo"
  }'
```

---

## 📁 Estrutura

```
Museu-das-Ideias-Abandonadas/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── authMiddleware.js (✨ NOVO - Autenticação JWT)
│   │   ├── services/
│   │   │   ├── GeminiService.js
│   │   │   └── IdeaService.js
│   │   ├── controllers/
│   │   │   └── IdeaController.js (✏️ Usa req.user.id)
│   │   ├── routes/
│   │   │   └── ideas.js (✏️ Protegidas com JWT)
│   │   └── ...
│   ├── test-idea-service.js
│   └── package.json
│
├── frontend/
│   └── (não foi alterado)
│
└── DOCUMENTACAO_UNIFICADA.md (📖 Documentação Completa v3.0)
```

---

## 🛠️ Stack

**Backend:**
- Node.js + Express
- Google Gemini AI
- Supabase (opcional)
- CORS + dotenv

**Frontend:**
- React 19
- Vite
- Tailwind CSS v4

---

## 📝 Licença

MIT License

---

**Desenvolvido com 💜 e um toque de sarcasmo existencial**

**Versão**: 3.0.0 | **Data**: 30/05/2026 | **Status**: ✅ Pronto para Produção SaaS
=======
```powershell
npm run lint --workspace=frontend
```

Health local do backend atual:

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
```

Analise de ideia:

```powershell
$body = @{
  nome = "App de lembrar guarda-chuva"
  categoria = "Aplicativo"
  empolgacao = 4
  motivo = "Nunca saiu do Figma"
} | ConvertTo-Json

Invoke-WebRequest `
  -Uri "http://localhost:3001/api/analisar-ideia" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing
```

## Deploy

Backend Render:

- `https://museu-das-ideias-abandonadas.onrender.com`
- Health informado para apresentacao: `https://museu-das-ideias-abandonadas.onrender.com/health`
- Observacao tecnica: no backend estruturado atual, a rota local validada e `GET /api/health`. Se `/health` retornar 404, alinhar o start command/versao do backend no Render.

Frontend Vercel:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install --no-package-lock --include=optional`
- Environment Variable: `VITE_API_URL=https://museu-das-ideias-abandonadas.onrender.com`

Para a apresentacao, o deploy valido esta conectado ao repositorio:

```text
karlarenatadev/Museu-das-Ideias-Abandonadas
```

Depois, a equipe pode alinhar a migracao para o repositorio principal.

## Documentacao

- [Deploy](docs/DEPLOY.md)
- [Frontend](docs/FRONTEND.md)
- [Backend](docs/BACKEND.md)
- [Ambiente](docs/ENVIRONMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Handoff](docs/HANDOFF.md)
- [Pitch e perguntas de mentores](docs/PITCH_MENTORES.md)

>>>>>>> Stashed changes
