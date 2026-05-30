/**
 * Modelo de Ideia
 * Define a estrutura de dados para ideias abandonadas
 */

/**
 * Estrutura de uma Ideia
 * @typedef {Object} Idea
 * @property {string} id - ID único da ideia
 * @property {string} nome - Nome da ideia
 * @property {string} categoria - Categoria da ideia
 * @property {number} empolgacao - Nível de empolgação inicial (1-5)
 * @property {string} motivo - Motivo do abandono
 * @property {Object} analysis - Análise da IA
 * @property {number} analysis.survival_percentage - Percentual de sobrevivência
 * @property {string} analysis.cause_of_death_summary - Resumo da causa
 * @property {string} analysis.ai_verdict - Veredito da IA
 * @property {string} status - Status da ideia (active, archived, revived)
 * @property {number} honor_count - Número de homenagens recebidas
 * @property {Date} createdAt - Data de criação
 * @property {Date} archivedAt - Data de arquivamento (se aplicável)
 * @property {Date} revivedAt - Data de revivimento (se aplicável)
 */

class Idea {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.nome = data.nome;
    this.categoria = data.categoria;
    this.empolgacao = data.empolgacao;
    this.motivo = data.motivo;
    this.analysis = data.analysis || null;
    this.status = data.status || 'active'; // active, archived, revived
    this.honor_count = data.honor_count || 0;
    this.createdAt = data.createdAt || new Date();
    this.archivedAt = data.archivedAt || null;
    this.revivedAt = data.revivedAt || null;
  }

  /**
   * Gera um ID único para a ideia
   */
  generateId() {
    return `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Arquiva a ideia (reviver)
   */
  archive() {
    this.status = 'archived';
    this.archivedAt = new Date();
  }

  /**
   * Revive a ideia
   */
  revive() {
    this.status = 'revived';
    this.revivedAt = new Date();
  }

  /**
   * Adiciona uma homenagem
   */
  addHonor() {
    this.honor_count += 1;
  }

  /**
   * Retorna a ideia como objeto JSON
   */
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      categoria: this.categoria,
      empolgacao: this.empolgacao,
      motivo: this.motivo,
      analysis: this.analysis,
      status: this.status,
      honor_count: this.honor_count,
      createdAt: this.createdAt,
      archivedAt: this.archivedAt,
      revivedAt: this.revivedAt,
    };
  }
}

export default Idea;
