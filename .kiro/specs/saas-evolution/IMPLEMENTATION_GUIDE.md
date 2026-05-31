# 💻 IMPLEMENTATION GUIDE: Exemplos de Código

**Status**: 📋 Referência  
**Versão**: 1.0.0

---

## 🔧 BACKEND - EXEMPLOS

### 1. RankingService.js

```javascript
import { createClient } from '@supabase/supabase-js';
import config from '../config/environment.js';

class RankingService {
  constructor() {
    this.supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey
    );
    this.cache = new Map(); // Cache em memória
  }

  /**
   * Calcula score total de um usuário
   */
  async calculateUserScore(userId) {
    try {
      // Buscar todos os eventos do usuário
      const { data: events, error } = await this.supabase
        .from('idea_events')
        .select('type, points')
        .eq('user_id', userId);

      if (error) throw error;

      // Aplicar regra de pontuação
      let score = 0;
      for (const event of events) {
        score += event.points || 0;
      }

      console.log(`📊 Score calculado para ${userId}: ${score}`);
      return score;
    } catch (error) {
      console.error('❌ Erro ao calcular score:', error.message);
      throw error;
    }
  }

  /**
   * Obtém ranking global com cache
   */
  async getGlobalRanking(limit = 50, offset = 0, period = 'all') {
    try {
      const cacheKey = `ranking:${period}:${limit}:${offset}`;

      // Verificar cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
          console.log('✅ Ranking retornado do cache');
          return cached.data;
        }
      }

      // Buscar ideias com honor_count
      const { data: ideas, error } = await this.supabase
        .from('ideas')
        .select('user_id, honor_count, nome')
        .eq('status', 'active')
        .order('honor_count', { ascending: false });

      if (error) throw error;

      // Agrupar por usuário e calcular scores
      const userScores = new Map();
      for (const idea of ideas) {
        if (!userScores.has(idea.user_id)) {
          userScores.set(idea.user_id, {
            userId: idea.user_id,
            totalCandles: 0,
            topIdea: idea,
            ideas: []
          });
        }
        const user = userScores.get(idea.user_id);
        user.totalCandles += idea.honor_count;
        user.ideas.push(idea);
      }

      // Calcular scores e ordenar
      const ranking = Array.from(userScores.values())
        .map((user, idx) => ({
          position: idx + 1,
          userId: user.userId,
          username: user.userId.substring(0, 8), // Placeholder
          totalIdeas: user.ideas.length,
          totalCandles: user.totalCandles,
          score: user.totalCandles * 2, // Simplificado
          topIdea: user.topIdea,
          badge: this.getBadge(user.totalCandles)
        }))
        .slice(offset, offset + limit);

      // Armazenar em cache
      this.cache.set(cacheKey, {
        data: ranking,
        timestamp: Date.now()
      });

      console.log(`✅ Ranking calculado: ${ranking.length} usuários`);
      return ranking;
    } catch (error) {
      console.error('❌ Erro ao obter ranking:', error.message);
      throw error;
    }
  }

  /**
   * Retorna badge baseado em candles
   */
  getBadge(totalCandles) {
    if (totalCandles >= 500) return '🏆 Lendário';
    if (totalCandles >= 200) return '⭐ Estrela';
    if (totalCandles >= 100) return '🔥 Queimando';
    if (totalCandles >= 50) return '🕯️ Aceso';
    return '✨ Iniciante';
  }
}

export function getRankingService() {
  if (!global.rankingService) {
    global.rankingService = new RankingService();
  }
  return global.rankingService;
}
```

---

### 2. EventService.js

```javascript
import { createClient } from '@supabase/supabase-js';
import config from '../config/environment.js';

class EventService {
  constructor() {
    this.supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey
    );
  }

  /**
   * Registra um evento
   */
  async registerEvent(ideaId, userId, type, points = 0, metadata = {}) {
    try {
      // Validar tipo
      const validTypes = ['candle_light', 'create', 'archive', 'view'];
      if (!validTypes.includes(type)) {
        throw new Error(`Tipo de evento inválido: ${type}`);
      }

      // Inserir evento
      const { data, error } = await this.supabase
        .from('idea_events')
        .insert([{
          idea_id: ideaId,
          user_id: userId,
          type,
          points,
          metadata
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`📝 Evento registrado: ${type} (${points} pontos)`);
      return data;
    } catch (error) {
      console.error('❌ Erro ao registrar evento:', error.message);
      throw error;
    }
  }

  /**
   * Obtém eventos de uma ideia
   */
  async getIdeaEvents(ideaId, limit = 50, offset = 0) {
    try {
      const { data, error, count } = await this.supabase
        .from('idea_events')
        .select('*', { count: 'exact' })
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { events: data, total: count };
    } catch (error) {
      console.error('❌ Erro ao obter eventos:', error.message);
      throw error;
    }
  }
}

export function getEventService() {
  if (!global.eventService) {
    global.eventService = new EventService();
  }
  return global.eventService;
}
```

---

### 3. Endpoint: POST /api/ideas/:id/candle

```javascript
import { getIdeaService } from '../services/IdeaService.js';
import { getEventService } from '../services/EventService.js';
import { getRankingService } from '../services/RankingService.js';

const ideaService = getIdeaService();
const eventService = getEventService();
const rankingService = getRankingService();

export async function lightCandle(req, res, next) {
  try {
    const { id: ideaId } = req.params;
    const userId = req.user.id;

    console.log(`🕯️ Acendendo vela em ideia: ${ideaId}`);

    // 1. Validar ideia existe
    const idea = await ideaService.getIdea(ideaId);
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Ideia não encontrada'
      });
    }

    // 2. Incrementar honor_count
    const newHonorCount = (idea.honor_count || 0) + 1;
    await ideaService.updateIdea(ideaId, {
      honor_count: newHonorCount,
      candle_intensity: this.getCandleIntensity(newHonorCount)
    });

    // 3. Registrar evento
    const points = idea.user_id === userId ? 1 : 2; // +1 própria, +2 outro
    const event = await eventService.registerEvent(
      ideaId,
      userId,
      'candle_light',
      points,
      { from_user_id: userId }
    );

    // 4. Calcular novo score do usuário
    const userScore = await rankingService.calculateUserScore(userId);

    // 5. Obter posição no ranking
    const ranking = await rankingService.getGlobalRanking(1000, 0);
    const userRank = ranking.find(r => r.userId === userId);

    // 6. Retornar resposta
    res.status(200).json({
      success: true,
      data: {
        ideaId,
        honor_count: newHonorCount,
        candle_intensity: this.getCandleIntensity(newHonorCount),
        userScore,
        userRankPosition: userRank?.position || null,
        event: {
          id: event.id,
          type: event.type,
          points: event.points,
          created_at: event.created_at
        }
      },
      message: `Vela acesa com sucesso! +${points} pontos`
    });
  } catch (error) {
    console.error('❌ Erro ao acender vela:', error.message);
    next(error);
  }
}

function getCandleIntensity(honorCount) {
  if (honorCount >= 50) return 'viral';
  if (honorCount >= 20) return 'high';
  if (honorCount >= 5) return 'medium';
  return 'low';
}
```

---

## 🎨 FRONTEND - EXEMPLOS

### 1. useCandle.js Hook

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ideaService } from '../services/ideaService';

export function useCandle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ideaId) => ideaService.lightCandle(ideaId),
    onSuccess: (data) => {
      console.log('✅ Vela acesa:', data);

      // Invalidar queries para refetch automático
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });

      // Animar vela
      triggerCandleAnimation(data.ideaId);
    },
    onError: (error) => {
      console.error('❌ Erro ao acender vela:', error);
    }
  });
}

function triggerCandleAnimation(ideaId) {
  const element = document.querySelector(`[data-idea-id="${ideaId}"]`);
  if (element) {
    element.classList.add('candle-animation');
    setTimeout(() => {
      element.classList.remove('candle-animation');
    }, 1000);
  }
}
```

---

### 2. CandleButton.jsx Componente

```jsx
import { useCandle } from '../hooks/useCandle';

export function CandleButton({ ideaId, honorCount, onSuccess }) {
  const { mutate: lightCandle, isPending } = useCandle();

  const handleClick = () => {
    lightCandle(ideaId, {
      onSuccess: (data) => {
        onSuccess?.(data);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="candle-button"
      data-idea-id={ideaId}
      title="Acender vela em homenagem"
    >
      <span className="candle-icon">🕯️</span>
      <span className="candle-count">{honorCount}</span>
      {isPending && <span className="spinner">⏳</span>}
    </button>
  );
}
```

---

### 3. useRanking.js Hook

```javascript
import { useQuery } from '@tanstack/react-query';
import { rankingService } from '../services/rankingService';

export function useRanking(limit = 50, offset = 0, period = 'all') {
  return useQuery({
    queryKey: ['ranking', limit, offset, period],
    queryFn: () => rankingService.getGlobalRanking(limit, offset, period),
    staleTime: 30 * 1000, // 30s
    gcTime: 5 * 60 * 1000, // 5min
    refetchInterval: 60 * 1000, // 1min (polling)
  });
}
```

---

### 4. RankingLeaderboard.jsx Componente

```jsx
import { useRanking } from '../hooks/useRanking';
import { UserRankCard } from './UserRankCard';

export function RankingLeaderboard() {
  const { data, isLoading, error } = useRanking(50, 0, 'all');

  if (isLoading) {
    return <div className="loading">Carregando ranking...</div>;
  }

  if (error) {
    return <div className="error">Erro ao carregar ranking</div>;
  }

  return (
    <div className="leaderboard">
      <h2>🏆 Ranking Global</h2>
      <div className="ranking-list">
        {data.map((entry) => (
          <UserRankCard key={entry.userId} entry={entry} />
        ))}
      </div>
    </div>
  );
}
```

---

### 5. rankingService.js (Frontend)

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const rankingService = {
  async getGlobalRanking(limit = 50, offset = 0, period = 'all') {
    const response = await fetch(
      `${API_BASE_URL}/api/ranking/global?limit=${limit}&offset=${offset}&period=${period}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao carregar ranking');
    }

    const data = await response.json();
    return data.data.ranking;
  }
};
```

---

## 📧 EMAIL - EXEMPLOS

### 1. EmailService.js

```javascript
import nodemailer from 'nodemailer';
import config from '../config/environment.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: true,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    });

    this.queue = [];
    this.processing = false;
    this.startProcessor();
  }

  /**
   * Envia email de ideia criada
   */
  async sendIdeaCreatedEmail(userId, ideaData) {
    try {
      // Verificar preferências
      const prefs = await this.getUserPreferences(userId);
      if (!prefs.email_on_idea_created) {
        console.log('⏭️ Email desativado para este usuário');
        return;
      }

      const html = `
        <h2>🎉 Sua ideia nasceu no museu!</h2>
        <p>Olá,</p>
        <p>Sua ideia "<strong>${ideaData.nome}</strong>" foi analisada e agora faz parte do Museu das Ideias Abandonadas!</p>
        <p><strong>Análise da IA:</strong></p>
        <p>${ideaData.ai_verdict}</p>
        <p><a href="https://museu-ideias.com/ideas/${ideaData.id}">Ver ideia no museu</a></p>
      `;

      await this.addToQueue({
        to: userId,
        subject: '🎉 Sua ideia nasceu no museu!',
        html
      });
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
    }
  }

  /**
   * Adiciona email à fila
   */
  async addToQueue(email) {
    this.queue.push({
      ...email,
      retries: 0,
      createdAt: Date.now()
    });

    if (!this.processing) {
      this.startProcessor();
    }
  }

  /**
   * Processa fila de emails
   */
  async startProcessor() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const email = this.queue.shift();

      try {
        await this.transporter.sendMail({
          from: config.smtpFrom,
          to: email.to,
          subject: email.subject,
          html: email.html
        });

        console.log(`✅ Email enviado para ${email.to}`);
      } catch (error) {
        console.error(`❌ Erro ao enviar email: ${error.message}`);

        if (email.retries < 3) {
          email.retries++;
          this.queue.push(email);
        }
      }

      // Aguardar 1s entre emails
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
  }

  /**
   * Obtém preferências do usuário
   */
  async getUserPreferences(userId) {
    // Implementar busca no banco
    return {
      email_on_idea_created: true,
      email_on_trending: true,
      email_on_ranking_update: true,
      email_on_milestone: true
    };
  }
}

export function getEmailService() {
  if (!global.emailService) {
    global.emailService = new EmailService();
  }
  return global.emailService;
}
```

---

## 🧪 TESTES - EXEMPLOS

### 1. Teste de Endpoint (Backend)

```javascript
import request from 'supertest';
import app from '../src/server.js';

describe('POST /api/ideas/:id/candle', () => {
  it('deve acender vela com sucesso', async () => {
    const response = await request(app)
      .post('/api/ideas/550e8400-e29b-41d4-a716-446655440000/candle')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.honor_count).toBeGreaterThan(0);
    expect(response.body.data.event.type).toBe('candle_light');
  });

  it('deve retornar 404 se ideia não existe', async () => {
    const response = await request(app)
      .post('/api/ideas/invalid-id/candle')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);

    expect(response.body.success).toBe(false);
  });
});
```

---

### 2. Teste de Componente (Frontend)

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CandleButton } from '../CandleButton';

describe('CandleButton', () => {
  it('deve renderizar com contador', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <CandleButton ideaId="123" honorCount={42} />
      </QueryClientProvider>
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('deve chamar mutação ao clicar', async () => {
    const { getByRole } = render(
      <QueryClientProvider client={new QueryClient()}>
        <CandleButton ideaId="123" honorCount={42} />
      </QueryClientProvider>
    );

    fireEvent.click(getByRole('button'));
    // Verificar se mutação foi chamada
  });
});
```

---

## 🚀 PRÓXIMOS PASSOS

1. Copiar exemplos para seus arquivos
2. Adaptar para sua estrutura de projeto
3. Implementar testes
4. Deploy em staging
5. Testes em produção

---

**Versão**: 1.0.0  
**Data**: Maio 2026
