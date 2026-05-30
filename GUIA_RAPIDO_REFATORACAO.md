# 🚀 GUIA RÁPIDO - Projeto Refatorado

**Versão**: 2.0.0  
**Data**: 30 de Maio de 2026  
**Status**: ✅ Pronto para usar

---

## ⚡ INÍCIO RÁPIDO

### 1. Clonar e Instalar
```bash
# Clonar repositório
git clone <url-do-repositorio>
cd Museu-das-Ideias-Abandonadas

# Instalar dependências
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Backend
cd backend
cp .env.example .env
# Editar .env e adicionar GEMINI_API_KEY

# Frontend (opcional)
cd ../museu-das-ideias
# Nenhuma configuração necessária
```

### 3. Rodar o Projeto
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Servidor em http://localhost:3001

# Terminal 2 - Frontend
cd museu-das-ideias
npm run dev
# Servidor em http://localhost:5173
```

### 4. Acessar
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

---

## 📁 ESTRUTURA DO PROJETO

### Backend (Refatorado - MVC)
```
backend/
├── src/
│   ├── server.js              # Servidor principal
│   ├── config/
│   │   └── environment.js     # Configuração centralizada
│   ├── services/
│   │   ├── GeminiService.js   # Integração com IA
│   │   └── EmailService.js    # Envio de emails
│   ├── controllers/
│   │   ├── IdeaController.js  # Lógica de ideias
│   │   └── NewsletterController.js
│   ├── routes/
│   │   ├── ideas.js           # Rotas de ideias
│   │   └── newsletter.js      # Rotas de newsletter
│   ├── middleware/
│   │   └── errorHandler.js    # Tratamento de erros
│   └── utils/
│       └── validators.js      # Validações
├── .env                       # Variáveis de ambiente
└── package.json
```

### Frontend (Parcialmente Refatorado)
```
museu-das-ideias/
├── src/
│   ├── App.jsx                # Componente principal
│   ├── main.jsx               # Entry point com MuseumProvider
│   ├── components/            # 7 componentes React
│   ├── context/
│   │   └── MuseumContext.jsx  # Estado global
│   ├── hooks/
│   │   └── useMuseum.js       # Hook customizado
│   ├── services/
│   │   └── ideaService.js     # Chamadas à API
│   ├── config/
│   │   └── api.js             # Endpoints
│   └── utils/
│       └── validators.js      # Validações
├── styles.css                 # Estilos customizados
└── package.json
```

---

## 🔌 ENDPOINTS DA API

### Health Check
```
GET /health
Resposta: { status: 'ok', message: '...', timestamp: '...' }
```

### Analisar Ideia
```
POST /api/analisar-ideia
Body: {
  "nome": "App de Delivery",
  "categoria": "App",
  "empolgacao": 4,
  "motivo": "Falta de tempo"
}
Resposta: {
  "success": true,
  "data": {
    "survival_percentage": 7,
    "cause_of_death_summary": "...",
    "ai_verdict": "..."
  }
}
```

### Assinar Newsletter
```
POST /api/assinar-alertas
Body: { "email": "usuario@email.com" }
Resposta: { "success": true, "message": "Email enviado" }
```

---

## 🎯 COMO USAR O PROJETO

### 1. Analisar uma Ideia
1. Abrir http://localhost:5173
2. Preencher formulário com dados da ideia
3. Clicar em "Analisar Ideia"
4. Aguardar resposta da IA

### 2. Assinar Newsletter
1. Rolar até o final da página
2. Inserir email
3. Clicar em "Assinar"
4. Confirmar email recebido

### 3. Navegar pelos Modais
1. Clicar em "Sobre o Museu" para ver informações
2. Clicar em "Memorial" para ver ideias abandonadas
3. Clicar em "Analisar Ideia" para voltar ao formulário

---

## 🔧 DESENVOLVIMENTO

### Adicionar Nova Rota no Backend
```javascript
// 1. Criar controller em src/controllers/
export class MeuController {
  async meuMetodo(req, res) {
    // Lógica aqui
  }
}

// 2. Criar rota em src/routes/
import router from 'express';
router.post('/api/minha-rota', (req, res) => 
  MeuController.meuMetodo(req, res)
);

// 3. Importar em src/server.js
import minhaRota from './routes/minha-rota.js';
app.use('/', minhaRota);
```

### Adicionar Novo Componente no Frontend
```javascript
// 1. Criar componente em src/components/
export default function MeuComponente() {
  const { estado } = useMuseum();
  return <div>{estado}</div>;
}

// 2. Usar em App.jsx
import MeuComponente from './components/MeuComponente';
// <MeuComponente />
```

### Usar Context API
```javascript
import { useMuseum } from '../hooks/useMuseum';

export default function MeuComponente() {
  const { 
    activeModal, 
    setActiveModal,
    analysisResult,
    setAnalysisResult 
  } = useMuseum();

  return (
    <div>
      {/* Usar estado aqui */}
    </div>
  );
}
```

---

## 🧪 TESTES

### Testar Backend
```bash
cd backend
npm run dev

# Em outro terminal
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/analisar-ideia \
  -H "Content-Type: application/json" \
  -d '{"nome":"App","categoria":"App","empolgacao":4,"motivo":"Teste"}'
```

### Testar Frontend
```bash
cd museu-das-ideias
npm run dev
# Abrir http://localhost:5173 no navegador
```

---

## 📊 VARIÁVEIS DE AMBIENTE

### Backend (.env)
```env
# Obrigatório
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=sua_chave_aqui

# Opcional (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
MAIL_FROM="Museu das Ideias Abandonadas <seu_email@gmail.com>"
```

### Como Obter GEMINI_API_KEY
1. Ir para https://makersuite.google.com/app/apikey
2. Criar nova chave de API
3. Copiar e colar em .env

### Como Obter Senha de App Gmail
1. Ativar autenticação de dois fatores
2. Ir para https://myaccount.google.com/apppasswords
3. Gerar senha de app
4. Usar em SMTP_PASS

---

## 🐛 TROUBLESHOOTING

### Backend não inicia
```
Erro: GEMINI_API_KEY não encontrada
Solução: Verificar se .env existe e tem GEMINI_API_KEY

Erro: Porta 3001 já em uso
Solução: Mudar PORT em .env ou matar processo na porta
```

### Frontend não conecta ao backend
```
Erro: CORS error
Solução: Verificar se backend está rodando em http://localhost:3001

Erro: API não responde
Solução: Verificar console do backend para erros
```

### Email não é enviado
```
Erro: SMTP não configurado
Solução: Deixar SMTP_HOST vazio se não quiser usar email
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, consulte:
- `AUDITORIA_COMPLETA_2026.md` - Diagnóstico inicial
- `REFATORACAO_BACKEND.md` - Detalhes backend
- `REFATORACAO_FRONTEND.md` - Detalhes frontend
- `RELATORIO_FINAL_AUDITORIA_REFATORACAO.md` - Relatório completo

---

## 🚀 PRÓXIMOS PASSOS

1. **Completar refatoração frontend** (FASE 3)
2. **Implementar novas features** (FASE 4)
3. **Adicionar testes** (FASE 5)
4. **Deploy em produção** (FASE 6)

---

## 💬 DÚVIDAS?

Consulte a documentação ou abra uma issue no repositório.

---

**Guia criado por**: Desenvolvedor Full-Stack Sênior  
**Data**: 30 de Maio de 2026  
**Versão**: 2.0.0
