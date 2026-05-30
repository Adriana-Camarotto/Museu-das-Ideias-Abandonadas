# 🏛️ Museu das Ideias Abandonadas - v2.0.0 (Refatorado)

Um museu digital que celebra projetos que nunca saíram do papel. Envie sua ideia abandonada e receba uma análise sarcástica, poética e reconfortante da **Curadora do Caos** - uma IA com personalidade única.

**Status**: 🟢 Backend Pronto | 🟡 Frontend Parcialmente Refatorado | 📚 Documentação Completa

---

## 🎯 Sobre o Projeto

Este projeto é composto por:
- **Frontend**: Interface React com Tailwind CSS (Refatorado com Context API)
- **Backend**: API Node.js + Express integrada com Google Gemini AI (Refatorado em MVC)

**Versão**: 2.0.0 (Refatorada)  
**Data**: 30 de Maio de 2026

---

## 🚀 Como Rodar

### Backend (Refatorado - MVC)

```bash
cd backend
npm install
npm run dev
# Servidor rodando em http://localhost:3001
```

### Frontend (Parcialmente Refatorado)

```bash
cd museu-das-ideias
npm install
npm run dev
# Servidor rodando em http://localhost:5173
```

### Variáveis de Ambiente

```env
# backend/.env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=sua_chave_aqui

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
MAIL_FROM="Museu das Ideias Abandonadas <seu_email@gmail.com>"
```

**Obter chave do Gemini**: https://makersuite.google.com/app/apikey

---

## 📁 Estrutura (Refatorada)

### Backend (MVC)
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
│   │   └── MuseumContext.jsx  # Estado global (NOVO)
│   ├── hooks/
│   │   └── useMuseum.js       # Hook customizado (NOVO)
│   ├── services/
│   │   └── ideaService.js     # Chamadas à API
│   ├── config/
│   │   └── api.js             # Endpoints
│   └── utils/
│       └── validators.js      # Validações (NOVO)
├── styles.css                 # Estilos customizados
└── package.json
```

---

## 🔌 Endpoints da API

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

## 🎭 A Curadora do Caos

A IA analisa suas ideias abandonadas com:
- 📊 Análise objetiva de sobrevivência
- 🎨 Linguagem poética sobre fracassos
- 😏 Sarcasmo reconfortante
- 💜 Empatia e celebração do processo criativo

---

## 🛠️ Stack

**Backend (Refatorado)**:
- Node.js + Express
- Google Gemini AI
- CORS + dotenv
- Arquitetura MVC

**Frontend (Parcialmente Refatorado)**:
- React 19
- Vite
- Tailwind CSS v4
- Context API (NOVO)

---

## 📚 Documentação

### Comece por:
1. **[RESUMO_EXECUTIVO_FINAL.md](./RESUMO_EXECUTIVO_FINAL.md)** - Panorama geral (15 min)
2. **[GUIA_RAPIDO_REFATORACAO.md](./GUIA_RAPIDO_REFATORACAO.md)** - Como usar (12 min)
3. **[INDICE_DOCUMENTACAO_REFATORACAO.md](./INDICE_DOCUMENTACAO_REFATORACAO.md)** - Índice completo (5 min)

### Documentação Técnica:
- **[REFATORACAO_BACKEND.md](./REFATORACAO_BACKEND.md)** - Detalhes backend (20 min)
- **[REFATORACAO_FRONTEND.md](./REFATORACAO_FRONTEND.md)** - Detalhes frontend (15 min)
- **[TESTES_FINAIS_REFATORACAO.md](./TESTES_FINAIS_REFATORACAO.md)** - Resultados dos testes (15 min)

### Documentação Completa:
- **[AUDITORIA_COMPLETA_2026.md](./AUDITORIA_COMPLETA_2026.md)** - Diagnóstico inicial
- **[RELATORIO_FINAL_AUDITORIA_REFATORACAO.md](./RELATORIO_FINAL_AUDITORIA_REFATORACAO.md)** - Relatório completo
- **[CHECKLIST_FINAL_ENTREGA.md](./CHECKLIST_FINAL_ENTREGA.md)** - Checklist de entrega

---

## ✅ O Que Foi Refatorado

### Backend ✅
- [x] Separação em arquitetura MVC
- [x] Centralização de configuração
- [x] Centralização de validações
- [x] Middleware de tratamento de erros
- [x] Serviços isolados (Gemini, Email)
- [x] Controllers bem definidos
- [x] Rotas organizadas
- [x] Testes: 100% de sucesso

### Frontend (FASE 1) ✅
- [x] Context API para estado global
- [x] Hook customizado useMuseum()
- [x] Validações compartilhadas
- [x] IdeaForm refatorado
- [x] main.jsx com MuseumProvider
- [ ] App.jsx ainda precisa refatoração (FASE 3)

---

## 🧪 Testes

### Testes Manuais (100% de Sucesso)
```
✅ Health Check - Status 200
✅ Análise de Ideia (Teste 1) - Status 200
✅ Análise de Ideia (Teste 2) - Status 200
✅ Validação de Entrada - Status 400
✅ Tratamento de Erros - Status 404
```

### Como Testar
```bash
# Health Check
curl http://localhost:3001/health

# Análise de Ideia
curl -X POST http://localhost:3001/api/analisar-ideia \
  -H "Content-Type: application/json" \
  -d '{"nome":"App","categoria":"App","empolgacao":4,"motivo":"Teste"}'
```

---

## 🚀 Próximas Fases

### FASE 3: Refatoração Frontend Completa (2-3 dias)
- Refatorar App.jsx em componentes menores
- Criar componentes: MuseumGallery, NewsletterSection, FilterBar
- Melhorar AnalysisResult
- Implementar React Router (opcional)

### FASE 4: Novas Features (3-4 dias)
- Implementar "Reviver Ideia"
- Implementar "Sistema de Homenagens"
- Implementar "Compartilhamento WhatsApp"
- Implementar "Persistência localStorage"

### FASE 5: Testes e Otimização (2-3 dias)
- Testes unitários (Jest)
- Testes de componentes (React Testing Library)
- Testes de integração
- Otimização de performance

### FASE 6: DevOps e Deploy (1-2 dias)
- CI/CD (GitHub Actions)
- Consolidar branches Git
- Deploy em produção
- Monitoramento

---

## 📊 Estatísticas

### Backend
- Linhas em server.js: 265 → 60 (-77%)
- Arquivos: 1 → 10 (+900%)
- Separação de concerns: ✅
- Reutilização de código: ✅

### Frontend
- Estado global: Disperso → Context API ✅
- Prop drilling: Eliminado ✅
- Validações: Compartilhadas ✅
- Hooks customizados: 1 ✅

### Documentação
- Documentos: 9
- Linhas: ~2.600
- Palavras: ~21.700
- Tempo de leitura: ~2-3 horas

---

## 🔐 Segurança

- ✅ Validação de entrada em todos os endpoints
- ✅ CORS configurado
- ✅ Tratamento de erros sem expor detalhes
- ✅ Variáveis sensíveis em .env
- ✅ Sem SQL injection (não usa BD)
- ✅ Sem XSS (JSON responses)

---

## 📝 Licença

MIT License - Veja [LICENSE](LICENSE)

---

## 🎓 Desenvolvido com 💜 e um toque de sarcasmo existencial

**Versão**: 2.0.0 (Refatorada)  
**Data**: 30 de Maio de 2026  
**Status**: 🟢 Backend Pronto | 🟡 Frontend Parcialmente Refatorado

---

## 📞 Suporte

Para dúvidas ou sugestões:
1. Consulte a documentação
2. Abra uma issue no repositório
3. Revise os testes

**Próxima ação**: Iniciar FASE 3 (Refatoração Frontend Completa)
