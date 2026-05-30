# 🏛️ Museu das Ideias Abandonadas - v3.0

Um museu digital que celebra projetos que nunca saíram do papel. Envie sua ideia abandonada e receba uma análise sarcástica, poética e reconfortante da **Curadora do Caos** - uma IA com personalidade única.

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

---

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
```

---

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
