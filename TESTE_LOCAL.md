# 🚀 GUIA DE TESTE LOCAL

## ⚡ Iniciar Tudo em 3 Passos

### Passo 1: Terminal 1 - Backend
```bash
cd backend
npm install  # Apenas na primeira vez
npm start
```
Você verá:
```
✅ Google Gemini inicializado com sucesso
🏛️  MUSEU DAS IDEIAS ABANDONADAS - Backend API
Servidor rodando em: http://localhost:3001
```

### Passo 2: Terminal 2 - Frontend
```bash
cd museu-das-ideias
npm install  # Apenas na primeira vez
npm run dev
```
Você verá:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

### Passo 3: Abrir no Navegador
```
http://localhost:5173
```

---

## 🧪 Testar Endpoints (Terminal 3)

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Analisar Ideia
```bash
curl -X POST http://localhost:3001/api/analisar-ideia \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "App de Meditação",
    "categoria": "Startup",
    "empolgacao": 4,
    "motivo": "Falta de tempo"
  }'
```

### Teste Automatizado
```bash
cd backend
node test-endpoints.js
```

---

## 📋 Checklist de Teste

- [ ] Backend iniciou sem erros
- [ ] Frontend iniciou sem erros
- [ ] Página carrega em http://localhost:5173
- [ ] Pode digitar uma ideia
- [ ] Clica em "Analisar"
- [ ] Recebe resposta da IA
- [ ] Sem erros no console

---

## 🐛 Troubleshooting

**Porta 3001 já em uso?**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

**Erro de CORS?**
- Verificar se backend está rodando em 3001
- Verificar se frontend está em 5173

**Gemini não funciona?**
- Verificar `.env` tem `GEMINI_API_KEY`
- Verificar se a chave é válida

---

## ✅ Pronto!

Agora você tem tudo rodando localmente. Teste a aplicação completa!
