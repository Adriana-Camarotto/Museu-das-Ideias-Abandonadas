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
cd frontend
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

**⚠️ IMPORTANTE**: Use o diretório `frontend/`, não `museu-das-ideias/`

---

## 🚀 Forma Rápida (Windows)

Duplo clique em `START_LOCAL.bat` e pronto! Abre 2 terminais automaticamente.

---

## 🚀 Forma Rápida (Mac/Linux)

```bash
chmod +x start-local.sh
./start-local.sh
```

---

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

**Erro: "Unsafe attempt to load URL http://localhost:5173/"?**
- ✅ Certifique-se de usar `cd frontend` (não `museu-das-ideias`)
- ✅ Verifique se o arquivo `.env` existe em `frontend/.env`
- ✅ Reinicie o servidor frontend: `npm run dev`
- ✅ Limpe o cache do navegador (Ctrl+Shift+Delete)

**Porta 3001 já em uso?**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

**Porta 5173 já em uso?**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

**Erro de CORS?**
- Verificar se backend está rodando em 3001
- Verificar se frontend está em 5173
- Verificar se `.env` tem `VITE_API_URL=http://localhost:3001`

**Gemini não funciona?**
- Verificar `.env` em `backend/.env` tem `GEMINI_API_KEY`
- Verificar se a chave é válida
- Verificar se há internet disponível

**node_modules corrompido?**
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Pronto!

Agora você tem tudo rodando localmente. Teste a aplicação completa!
