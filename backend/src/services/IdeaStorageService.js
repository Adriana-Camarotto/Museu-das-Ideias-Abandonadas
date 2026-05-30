/**
 * Serviço de Armazenamento de Ideias
 * Gerencia persistência de ideias em memória
 * Pode ser facilmente migrado para banco de dados
 */

import Idea from '../models/Idea.js';

class IdeaStorageService {
  constructor() {
    // Armazenamento em memória (será substituído por banco de dados)
    this.ideas = new Map();
    this.initializeSampleData();
  }

  /**
   * Inicializa com dados de exemplo
   */
  initializeSampleData() {
    const sampleIdeas = [
      {
        id: 'idea_sample_1',
        nome: 'Loja de Velas Aromáticas',
        categoria: 'Negócio',
        empolgacao: 4,
        motivo: 'Pesquisa excessiva no Pinterest',
        status: 'active',
        honor_count: 3,
        analysis: {
          survival_percentage: 15,
          cause_of_death_summary: 'Perfeccionismo paralisante',
          ai_verdict: 'Uma ideia que merecia viver, mas o Pinterest foi mais forte.'
        }
      },
      {
        id: 'idea_sample_2',
        nome: 'Canal de Produtividade',
        categoria: 'Criativo',
        empolgacao: 5,
        motivo: 'Editou o primeiro vídeo e desistiu',
        status: 'active',
        honor_count: 5,
        analysis: {
          survival_percentage: 8,
          cause_of_death_summary: 'Primeira edição foi épica demais',
          ai_verdict: 'O YouTube perdeu um criador de conteúdo naquele dia.'
        }
      }
    ];

    sampleIdeas.forEach(ideaData => {
      const idea = new Idea(ideaData);
      this.ideas.set(idea.id, idea);
    });
  }

  /**
   * Cria uma nova ideia
   */
  createIdea(ideaData) {
    const idea = new Idea(ideaData);
    this.ideas.set(idea.id, idea);
    console.log(`✅ Ideia criada: ${idea.id}`);
    return idea;
  }

  /**
   * Obtém uma ideia por ID
   */
  getIdea(id) {
    return this.ideas.get(id);
  }

  /**
   * Obtém todas as ideias ativas
   */
  getActiveIdeas() {
    return Array.from(this.ideas.values()).filter(idea => idea.status === 'active');
  }

  /**
   * Obtém todas as ideias (incluindo arquivadas)
   */
  getAllIdeas() {
    return Array.from(this.ideas.values());
  }

  /**
   * Obtém ideias arquivadas
   */
  getArchivedIdeas() {
    return Array.from(this.ideas.values()).filter(idea => idea.status === 'archived');
  }

  /**
   * Obtém ranking de ideias por homenagens
   */
  getRanking(limit = 10) {
    return Array.from(this.ideas.values())
      .filter(idea => idea.status === 'active')
      .sort((a, b) => b.honor_count - a.honor_count)
      .slice(0, limit);
  }

  /**
   * Arquiva uma ideia (reviver)
   */
  archiveIdea(id) {
    const idea = this.ideas.get(id);
    if (!idea) {
      throw new Error(`Ideia não encontrada: ${id}`);
    }
    idea.archive();
    console.log(`📦 Ideia arquivada: ${id}`);
    return idea;
  }

  /**
   * Revive uma ideia
   */
  reviveIdea(id) {
    const idea = this.ideas.get(id);
    if (!idea) {
      throw new Error(`Ideia não encontrada: ${id}`);
    }
    idea.revive();
    console.log(`🔄 Ideia revivida: ${id}`);
    return idea;
  }

  /**
   * Adiciona uma homenagem a uma ideia
   */
  addHonor(id) {
    const idea = this.ideas.get(id);
    if (!idea) {
      throw new Error(`Ideia não encontrada: ${id}`);
    }
    idea.addHonor();
    console.log(`🏆 Homenagem adicionada a: ${id} (Total: ${idea.honor_count})`);
    return idea;
  }

  /**
   * Atualiza a análise de uma ideia
   */
  updateAnalysis(id, analysis) {
    const idea = this.ideas.get(id);
    if (!idea) {
      throw new Error(`Ideia não encontrada: ${id}`);
    }
    idea.analysis = analysis;
    console.log(`📊 Análise atualizada para: ${id}`);
    return idea;
  }

  /**
   * Deleta uma ideia (uso administrativo apenas)
   */
  deleteIdea(id) {
    const deleted = this.ideas.delete(id);
    if (deleted) {
      console.log(`🗑️ Ideia deletada: ${id}`);
    }
    return deleted;
  }

  /**
   * Retorna estatísticas
   */
  getStatistics() {
    const allIdeas = Array.from(this.ideas.values());
    const activeIdeas = allIdeas.filter(i => i.status === 'active');
    const archivedIdeas = allIdeas.filter(i => i.status === 'archived');
    const revivedIdeas = allIdeas.filter(i => i.status === 'revived');

    return {
      total: allIdeas.length,
      active: activeIdeas.length,
      archived: archivedIdeas.length,
      revived: revivedIdeas.length,
      totalHonors: allIdeas.reduce((sum, idea) => sum + idea.honor_count, 0),
      averageHonors: allIdeas.length > 0 
        ? (allIdeas.reduce((sum, idea) => sum + idea.honor_count, 0) / allIdeas.length).toFixed(2)
        : 0,
    };
  }
}

// Exportar instância singleton
export default new IdeaStorageService();
