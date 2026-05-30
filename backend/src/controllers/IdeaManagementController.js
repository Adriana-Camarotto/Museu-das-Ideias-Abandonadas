/**
 * Controller de Gerenciamento de Ideias
 * Gerencia operações como reviver, homenagear e compartilhar ideias
 */

import IdeaStorageService from '../services/IdeaStorageService.js';

class IdeaManagementController {
  /**
   * Revive uma ideia (move para archived)
   * POST /api/ideias/:id/reviver
   */
  async reviveIdea(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID da ideia é obrigatório',
        });
      }

      const idea = IdeaStorageService.getIdea(id);
      if (!idea) {
        return res.status(404).json({
          success: false,
          error: 'Ideia não encontrada',
        });
      }

      if (idea.status === 'archived') {
        return res.status(400).json({
          success: false,
          error: 'Ideia já foi arquivada',
        });
      }

      const revivedIdea = IdeaStorageService.archiveIdea(id);

      return res.status(200).json({
        success: true,
        message: 'Ideia arquivada com sucesso',
        data: revivedIdea.toJSON(),
      });
    } catch (error) {
      console.error('❌ Erro ao reviver ideia:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao reviver ideia',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Adiciona uma homenagem a uma ideia
   * POST /api/ideias/:id/homenagear
   */
  async honorIdea(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID da ideia é obrigatório',
        });
      }

      const idea = IdeaStorageService.getIdea(id);
      if (!idea) {
        return res.status(404).json({
          success: false,
          error: 'Ideia não encontrada',
        });
      }

      const honoredIdea = IdeaStorageService.addHonor(id);

      return res.status(200).json({
        success: true,
        message: 'Homenagem adicionada com sucesso',
        data: {
          id: honoredIdea.id,
          nome: honoredIdea.nome,
          honor_count: honoredIdea.honor_count,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao homenagear ideia:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao homenagear ideia',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Obtém ranking de ideias
   * GET /api/ranking
   */
  async getRanking(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      const ranking = IdeaStorageService.getRanking(limit);

      return res.status(200).json({
        success: true,
        data: ranking.map(idea => ({
          id: idea.id,
          nome: idea.nome,
          categoria: idea.categoria,
          honor_count: idea.honor_count,
          status: idea.status,
        })),
      });
    } catch (error) {
      console.error('❌ Erro ao obter ranking:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao obter ranking',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Obtém todas as ideias (ativas e arquivadas)
   * GET /api/ideias
   */
  async getAllIdeas(req, res) {
    try {
      const filter = req.query.filter || 'active'; // active, archived, all

      let ideas;
      if (filter === 'active') {
        ideas = IdeaStorageService.getActiveIdeas();
      } else if (filter === 'archived') {
        ideas = IdeaStorageService.getArchivedIdeas();
      } else {
        ideas = IdeaStorageService.getAllIdeas();
      }

      return res.status(200).json({
        success: true,
        data: ideas.map(idea => idea.toJSON()),
      });
    } catch (error) {
      console.error('❌ Erro ao obter ideias:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao obter ideias',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Obtém estatísticas
   * GET /api/estatisticas
   */
  async getStatistics(req, res) {
    try {
      const stats = IdeaStorageService.getStatistics();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao obter estatísticas',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Gera mensagem para compartilhamento
   * POST /api/ideias/:id/compartilhar
   */
  async generateShareMessage(req, res) {
    try {
      const { id } = req.params;
      const { platform } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID da ideia é obrigatório',
        });
      }

      const idea = IdeaStorageService.getIdea(id);
      if (!idea) {
        return res.status(404).json({
          success: false,
          error: 'Ideia não encontrada',
        });
      }

      // Gera mensagem de compartilhamento
      const statusEmoji = idea.status === 'archived' ? '💀' : '💡';
      const message = `${statusEmoji} ${idea.nome}\n\n` +
        `Categoria: ${idea.categoria}\n` +
        `Homenagens: ${idea.honor_count} 🏆\n` +
        `Status: ${idea.status === 'archived' ? 'Arquivada' : 'Ativa'}\n\n` +
        `"${idea.analysis?.ai_verdict || 'Uma ideia abandonada no Museu das Ideias Abandonadas'}"`;

      return res.status(200).json({
        success: true,
        data: {
          message,
          whatsappUrl: `https://wa.me/?text=${encodeURIComponent(message)}`,
          twitterUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao gerar mensagem de compartilhamento:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao gerar mensagem de compartilhamento',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

export default new IdeaManagementController();
