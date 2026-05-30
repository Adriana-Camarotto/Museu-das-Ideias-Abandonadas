# 🚨 CORREÇÕES IMEDIATAS - SAAS READY

## PRIORIDADE 1: PROTEGER ROTAS /ai/*

### PROBLEMA
Rotas /ai/* estão desprotegidas. Qualquer pessoa pode chamar IA sem limite.

### SOLUÇÃO
Adicionar authMiddleware + requireAuth

### CÓDIGO
```javascript
// backend/src/routes/ai.js
import express from 'express';
import { authMiddleware, requireAuth } from '../middleware/authMiddleware.js';
import * as AIController from '../controllers/AIController.js';

const router = express.Router();

// Aplicar autenticação em todas rotas
router.use(authMiddleware);
router.use(requireAuth);

router.post('/analyze-idea', AIController.analyzeIdea);
router.post('/share-text', AIController.generateShareText);
router.post('/epitaph', AIController.generateEpitaph);

export default router;
```

---

## PRIORIDADE 2: IMPLEMENTAR VALIDAÇÃO COM ZOD

### PROBLEMA
Sem validação forte de entrada. Dados inválidos quebram IA.

### SOLUÇÃO
Instalar Zod e criar schemas

### INSTALAÇÃO
```bash
npm install zod
```

### CÓDIGO
```javascript
// backend/src/schemas/ideaSchemas.js
import { z } from 'zod';

export const analyzeIdeaSchema = z.object({
  nome: z.string().min(3).max(255),
  categoria: z.string().min(2).max(100),
  empolgacao: z.number().int().min(1).max(5),
  motivo: z.string().min(5).max(1000),
});

export const shareTextSchema = z.object({
  nome: z.string().min(3).max(255),
  survival_percentage: z.number().int().min(0).max(100).optional(),
  honor_count: z.number().int().min(0).optional(),
});

export const epitaphSchema = z.object({
  nome: z.string().min(3).max(255),
  survival_percentage: z.number().int().min(0).max(100).optional(),
  honor_count: z.number().int().min(0).optional(),
});
```

### MIDDLEWARE DE VALIDAÇÃO
```javascript
// backend/src/middleware/validateSchema.js
export function validateSchema(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Validação falhou',
        details: error.errors,
      });
    }
  };
}
```

### USAR NO CONTROLLER
```javascript
// backend/src/routes/ai.js
import { validateSchema } from '../middleware/validateSchema.js';
import { analyzeIdeaSchema, shareTextSchema, epitaphSchema } from '../schemas/ideaSchemas.js';

router.post('/analyze-idea', validateSchema(analyzeIdeaSchema), AIController.analyzeIdea);
router.post('/share-text', validateSchema(shareTextSchema), AIController.generateShareText);
router.post('/epitaph', validateSchema(epitaphSchema), AIController.generateEpitaph);
```

---

## PRIORIDADE 3: IMPLEMENTAR RATE LIMITING

### PROBLEMA
Sem limite de requisições. Abuso ilimitado da IA.

### SOLUÇÃO
Usar express-rate-limit

### INSTALAÇÃO
```bash
npm install express-rate-limit
```

### CÓDIGO
```javascript
// backend/src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// Rate limit global
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit por usuário (para IA)
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // 5 requisições por minuto
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'Limite de requisições de IA atingido',
  skip: (req) => !req.user, // Pula se não autenticado
});

// Rate limit por IP
export const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 requisições por IP
  message: 'Muitas requisições deste IP',
});
```

### USAR NO SERVER
```javascript
// backend/src/server.js
import { globalLimiter, ipLimiter } from './middleware/rateLimiter.js';

app.use(globalLimiter);
app.use(ipLimiter);
app.use('/api/ideas', ideasRoutes);
app.use('/ai', aiRoutes);
```

### USAR NO ROUTES
```javascript
// backend/src/routes/ai.js
import { aiLimiter } from '../middleware/rateLimiter.js';

router.use(aiLimiter);
router.post('/analyze-idea', validateSchema(analyzeIdeaSchema), AIController.analyzeIdea);
```

---

## PRIORIDADE 4: IMPLEMENTAR CACHE DE IA

### PROBLEMA
Mesma ideia analisada múltiplas vezes = custos altos.

### SOLUÇÃO
Cache com Redis (ou memória em dev)

### INSTALAÇÃO
```bash
npm install redis
```

### CÓDIGO
```javascript
// backend/src/services/CacheService.js
import { createClient } from 'redis';
import config from '../config/environment.js';

class CacheService {
  constructor() {
    if (config.redisUrl) {
      this.client = createClient({ url: config.redisUrl });
      this.client.connect();
      console.log('✅ Redis conectado');
    } else {
      this.cache = new Map();
      console.log('⚠️  Usando cache em memória');
    }
  }

  async get(key) {
    if (this.client) {
      return await this.client.get(key);
    }
    return this.cache.get(key);
  }

  async set(key, value, ttl = 86400) {
    const json = JSON.stringify(value);
    if (this.client) {
      await this.client.setEx(key, ttl, json);
    } else {
      this.cache.set(key, json);
    }
  }

  async delete(key) {
    if (this.client) {
      await this.client.del(key);
    } else {
      this.cache.delete(key);
    }
  }
}

let cacheService;
export function getCacheService() {
  if (!cacheService) {
    cacheService = new CacheService();
  }
  return cacheService;
}
```

### USAR NO GEMINI SERVICE
```javascript
// backend/src/services/GeminiService.js
import { getCacheService } from './CacheService.js';

const cacheService = getCacheService();

async analyzeIdea(ideaData) {
  const { nome, categoria, empolgacao, motivo } = ideaData;
  
  // Gerar chave de cache
  const cacheKey = `analysis:${nome}:${categoria}:${empolgacao}:${motivo}`;
  
  // Verificar cache
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    console.log('💾 Retornando do cache');
    return JSON.parse(cached);
  }
  
  // Chamar IA
  const analysis = await this.model.generateContent(prompt);
  
  // Salvar em cache (24 horas)
  await cacheService.set(cacheKey, analysis, 86400);
  
  return analysis;
}
```

---

## PRIORIDADE 5: IMPLEMENTAR LOGS ESTRUTURADOS

### PROBLEMA
Logs desorganizados. Difícil debugar em produção.

### SOLUÇÃO
Usar Winston para logs estruturados

### INSTALAÇÃO
```bash
npm install winston
```

### CÓDIGO
```javascript
// backend/src/services/LoggerService.js
import winston from 'winston';
import config from '../config/environment.js';

const logger = winston.createLogger({
  level: config.isDevelopment ? 'debug' : 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'museu-ideias' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (config.isDevelopment) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### USAR NO MIDDLEWARE
```javascript
// backend/src/middleware/loggingMiddleware.js
import logger from '../services/LoggerService.js';
import { v4 as uuidv4 } from 'uuid';

export function loggingMiddleware(req, res, next) {
  const correlationId = uuidv4();
  req.correlationId = correlationId;

  logger.info({
    correlationId,
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  next();
}
```

### USAR NO SERVER
```javascript
// backend/src/server.js
import { loggingMiddleware } from './middleware/loggingMiddleware.js';

app.use(loggingMiddleware);
```

---

## PRIORIDADE 6: ADICIONAR HELMET.JS

### PROBLEMA
Headers de segurança faltando.

### SOLUÇÃO
Adicionar Helmet.js

### INSTALAÇÃO
```bash
npm install helmet
```

### CÓDIGO
```javascript
// backend/src/server.js
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
}));
```

---

## PRIORIDADE 7: CONSOLIDAR CONTROLLERS

### PROBLEMA
IdeaController + AIController fazem coisas similares.

### SOLUÇÃO
Mover lógica de IA para IdeaService

### NOVO FLUXO
```
IdeaController.analyzeIdea
  → IdeaService.analyzeIdea (orquestra tudo)
    → GeminiService.analyzeIdea (chama IA)
    → IdeaService.createIdea (salva)
```

---

## PRIORIDADE 8: VALIDAR .env

### PROBLEMA
Servidor inicia sem variáveis obrigatórias.

### SOLUÇÃO
Validar com Zod

### CÓDIGO
```javascript
// backend/src/config/environment.js
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('3001'),
  GEMINI_API_KEY: z.string().min(1),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().optional(),
});

const env = envSchema.parse(process.env);

export default env;
```

---

## PRIORIDADE 9: ADICIONAR CORS WHITELIST

### PROBLEMA
Qualquer site pode chamar API.

### SOLUÇÃO
Whitelist de origens

### CÓDIGO
```javascript
// backend/src/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
```

---

## PRIORIDADE 10: ADICIONAR HEALTH CHECK

### PROBLEMA
Sem forma de verificar se servidor está vivo.

### SOLUÇÃO
Adicionar endpoint /health

### CÓDIGO
```javascript
// backend/src/server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Proteger rotas /ai/*
- [ ] Instalar Zod
- [ ] Criar schemas de validação
- [ ] Criar middleware de validação
- [ ] Instalar express-rate-limit
- [ ] Criar middleware de rate limiting
- [ ] Instalar Redis (opcional)
- [ ] Criar CacheService
- [ ] Integrar cache no GeminiService
- [ ] Instalar Winston
- [ ] Criar LoggerService
- [ ] Criar middleware de logging
- [ ] Instalar Helmet
- [ ] Adicionar Helmet ao server
- [ ] Consolidar controllers
- [ ] Validar .env com Zod
- [ ] Adicionar CORS whitelist
- [ ] Adicionar health check endpoint
- [ ] Testar todos endpoints
- [ ] Fazer commit e push

---

## TEMPO ESTIMADO
- Implementação: 3-4 horas
- Testes: 1-2 horas
- Deploy: 30 minutos
- **Total: 5-6 horas**

