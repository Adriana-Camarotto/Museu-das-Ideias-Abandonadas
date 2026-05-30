# 🏛️ Museu das Ideias Abandonadas - Backend API

Backend Node.js que serve como ponte entre o frontend React e a API do Google Gemini para análise sarcástica e poética de ideias abandonadas.

## 🚀 Stack

- Node.js + Express
- Google Gemini AI (gemini-1.5-flash)
- Nodemailer (SMTP)
- CORS + dotenv

## 📦 Instalação e Configuração

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
copy .env.example .env
```

Edite o `.env` e adicione sua chave do Gemini e dados SMTP:

```env
PORT=3001
GEMINI_API_KEY=sua_chave_aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
MAIL_FROM="Museu das Ideias Abandonadas <seu_email@gmail.com>"
```

**Obter chave:** https://makersuite.google.com/app/apikey

```bash
# 3. Iniciar servidor
npm run dev    # desenvolvimento (auto-reload)
npm start      # produção
```

## 🛣️ API Endpoints

### `GET /health`

Health check do servidor.

### `POST /api/analisar-ideia`

Analisa uma ideia abandonada.

### `POST /api/assinar-alertas`

Assina alertas do museu e envia e-mail de confirmação.

**Request:**

```json
{
  "email": "visitante@exemplo.com"
}
```

**Request:**

```json
{
  "nome": "App de delivery de sonhos",
  "categoria": "Startup",
  "empolgacao": 5,
  "motivo": "Sonhos não cabem em caixas"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "survival_percentage": 12,
    "cause_of_death_summary": "Morreu de idealismo agudo",
    "ai_verdict": "Ah, a clássica morte por romantismo excessivo..."
  }
}
```

## 🧪 Testar com cURL

```bash
curl -X POST http://localhost:3001/api/analisar-ideia ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Rede social para pedras\",\"categoria\":\"App\",\"empolgacao\":4,\"motivo\":\"Pedras não têm WiFi\"}"
```

## 🔗 Integração com Frontend

```javascript
// Frontend: src/services/api.js
const API_URL = "http://localhost:3001";

export async function analyzeIdea(ideaData) {
  const response = await fetch(`${API_URL}/api/analisar-ideia`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ideaData),
  });

  const data = await response.json();
  return data.data;
}
```

## 🎭 Persona da IA

**Curadora do Caos** - Analítica, poética, sarcástica e empática.

---

**Desenvolvido com 💜 e sarcasmo existencial**
