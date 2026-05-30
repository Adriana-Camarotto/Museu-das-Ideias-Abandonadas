# 🔧 SOLUÇÃO RÁPIDA - Erro de Frontend

## ❌ Problema
```
Unsafe attempt to load URL http://localhost:5173/ from frame with URL chrome-error://chromewebdata/
```

## ✅ Solução

### 1️⃣ Usar o diretório correto
```bash
# ❌ ERRADO
cd museu-das-ideias
npm run dev

# ✅ CORRETO
cd frontend
npm run dev
```

### 2️⃣ Criar arquivo .env no frontend
```bash
cd frontend
echo VITE_API_URL=http://localhost:3001 > .env
```

### 3️⃣ Instalar dependências
```bash
cd frontend
npm install
```

### 4️⃣ Rodar o frontend
```bash
cd frontend
npm run dev
```

---

## 🚀 Forma Mais Rápida

### Windows
Duplo clique em `START_LOCAL.bat`

### Mac/Linux
```bash
chmod +x start-local.sh
./start-local.sh
```

---

## 📋 Checklist

- [x] Usar `cd frontend` (não `museu-das-ideias`)
- [x] Arquivo `.env` criado em `frontend/.env`
- [x] `npm install` executado
- [x] `npm run dev` rodando
- [x] Abrir http://localhost:5173 no navegador

---

## 🎯 Resultado Esperado

```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Depois abra http://localhost:5173 no navegador e veja a aplicação rodando!

---

## 💡 Dica

Se ainda tiver problemas:
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Feche e reabra o navegador
3. Verifique se o backend está rodando em http://localhost:3001
4. Verifique se o arquivo `.env` existe em `frontend/.env`
