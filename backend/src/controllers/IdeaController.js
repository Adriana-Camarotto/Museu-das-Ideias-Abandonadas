/**
 * Controller de Ideias
 * Gerencia requisições relacionadas a ideias abandonadas
 */

import GeminiService from '../services/GeminiService.js';
import IdeaStorageService from '../services/IdeaStorageService.js';
import { validateIdeaData } from '../utils/validators.js';

class IdeaController {
  /**
   * Analisa uma ideia abandonada
   * POST /api/analisar-ideia
   */
  async analyzeIdea(req, res) {
    try {
      const { nome, categoria, empolgacao, motivo } = req.body;

      // Validação
      const validation = validateIdeaData({ nome, categoria, empolgacao, motivo });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Dados incompletos ou inválidos',
          details: validation.errors,
        });
      }

      // Análise com Gemini
      const analysis = await GeminiService.analyzeIdea({
        nome,
        categoria,
        empolgacao,
        motivo,
      });

      // Salvar ideia no storage
      const ideaData = {
        nome,
        categoria,
        empolgacao,
        motivo,
        analysis,
        status: 'active',
      };
      const savedIdea = IdeaStorageService.createIdea(ideaData);

      // Formatar resposta com todos os campos necessários para o frontend
      // O frontend precisa de: id, nome, categoria, empolgacao, motivo, icon, dates, cause, survival_percentage, ai_verdict
      const formattedResponse = {
        id: savedIdea.id,
        nome,
        categoria,
        empolgacao,
        motivo,
        icon: '🕯️', // Emoji padrão para ideias
        dates: `${new Date().getFullYear()} – ${new Date().getFullYear()}`, // Formato: YYYY – YYYY
        cause: analysis.cause_of_death_summary,
        survival_percentage: analysis.survival_percentage,
        ai_verdict: analysis.ai_verdict,
        honor_count: 0, // Inicializa com 0 velas
      };

      // Resposta
      return res.status(200).json({
        success: true,
        data: formattedResponse,
      });
    } catch (error) {
      console.error('❌ Erro ao processar ideia:', error);
      return res.status(500).json({
        success: false,
        error: 'A Curadora do Caos teve um colapso existencial. Tente novamente em breve.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Health check
   * GET /health
   */
  healthCheck(req, res) {
    return res.json({
      status: 'ok',
      message: 'O Museu das Ideias Abandonadas está de portas abertas!',
      timestamp: new Date().toISOString(),
    });
  }
}

export default new IdeaController();
