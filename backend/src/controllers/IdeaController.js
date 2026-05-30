/**
 * Controller de Ideias
 * Gerencia requisições relacionadas a ideias abandonadas
 */

import { getGeminiService } from '../services/GeminiService.js';

const geminiService = getGeminiService();

/**
 * POST /api/ideas/analyze
 * Analisa uma ideia abandonada
 */
export async function analyzeIdea(req, res, next) {
  try {
    const { nome, categoria, empolgacao, motivo } = req.body;

    // Validação
    if (!nome || !categoria || !empolgacao || !motivo) {
      return res.status(400).json({
        success: false,
        error: 'Dados incompletos. Até ideias abandonadas merecem informações completas!',
      });
    }

    if (empolgacao < 1 || empolgacao > 5) {
      return res.status(400).json({
        success: false,
        error: 'A empolgação deve estar entre 1 e 5. Nem tudo na vida é extremo!',
      });
    }

    console.log('📨 Requisição recebida:', { nome, categoria, empolgacao, motivo });

    // Chamar serviço de IA
    const analysis = await geminiService.analyzeIdea({
      nome,
      categoria,
      empolgacao,
      motivo,
    });

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('❌ Erro ao analisar ideia:', error.message);
    next(error);
  }
}

/**
 * GET /api/ideas
 * Lista todas as ideias (com filtro opcional)
 */
export async function listIdeas(req, res, next) {
  try {
    const { filter } = req.query; // active, archived, all

    // TODO: Implementar com Supabase
    res.status(200).json({
      success: true,
      data: [],
      message: 'Endpoint será implementado com Supabase',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ideas/:id
 * Obtém uma ideia específica
 */
export async function getIdea(req, res, next) {
  try {
    const { id } = req.params;

    // TODO: Implementar com Supabase
    res.status(200).json({
      success: true,
      data: null,
      message: 'Endpoint será implementado com Supabase',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ideas/:id/honor
 * Adiciona uma homenagem a uma ideia
 */
export async function honorIdea(req, res, next) {
  try {
    const { id } = req.params;

    // TODO: Implementar com Supabase
    res.status(200).json({
      success: true,
      message: 'Homenagem adicionada',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ideas/:id/revive
 * "Revive" uma ideia (muda status para archived)
 */
export async function reviveIdea(req, res, next) {
  try {
    const { id } = req.params;

    // TODO: Implementar com Supabase
    // Regra: Ideia sai da lista ativa, status muda para "archived"
    // Não é deletada fisicamente, continua como histórico

    res.status(200).json({
      success: true,
      message: 'Ideia revivida (arquivada)',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  analyzeIdea,
  listIdeas,
  getIdea,
  honorIdea,
  reviveIdea,
};
