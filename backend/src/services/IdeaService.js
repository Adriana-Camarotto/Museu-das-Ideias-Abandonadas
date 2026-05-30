/**
 * Serviço de Ideias - Lógica de Negócio
 * 
 * Responsabilidades:
 * - Gerenciar ciclo de vida das ideias
 * - Deduplicação baseada em hash
 * - Persistência em banco de dados
 * - Sistema de homenagens
 * - Ressurreição de ideias (delete lógico)
 * - Segurança e validação
 * 
 * @author Backend Sênior
 * @version 1.0.0
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import config from '../config/environment.js';

class IdeaService {
  constructor() {
    // Inicializar Supabase se credenciais disponíveis
    if (config.supabaseUrl && config.supabaseServiceRoleKey) {
      this.supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
      console.log('✅ Supabase inicializado com sucesso');
    } else {
      console.warn('⚠️  Supabase não configurado. Usando modo em memória.');
      this.supabase = null;
      // Fallback em memória para desenvolvimento
      this.ideasMemory = new Map();
    }
  }

  /**
   * Gera hash único para uma ideia baseado em nome + descrição
   * Usado para deduplicação
   * 
   * @param {string} nome - Nome da ideia
   * @param {string} descricao - Descrição/motivo da ideia
   * @returns {string} Hash SHA-256
   */
  generateIdeaHash(nome, descricao) {
    const combined = `${nome.toLowerCase().trim()}|${descricao.toLowerCase().trim()}`;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    console.log(`🔐 Hash gerado para "${nome}": ${hash.substring(0, 8)}...`);
    return hash;
  }

  /**
   * Verifica se uma ideia já existe no banco
   * 
   * @param {string} ideaHash - Hash da ideia
   * @param {string} userId - ID do usuário (opcional)
   * @returns {Promise<Object|null>} Ideia existente ou null
   */
  async findIdeaByHash(ideaHash, userId = null) {
    try {
      if (this.supabase) {
        let query = this.supabase
          .from('ideas')
          .select('*')
          .eq('idea_hash', ideaHash)
          .eq('status', 'active');

        // Se userId fornecido, filtrar por usuário
        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query.single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found (esperado)
          throw error;
        }

        if (data) {
          console.log(`✅ Ideia duplicada encontrada: ${data.id}`);
          return data;
        }

        return null;
      } else {
        // Fallback em memória
        for (const idea of this.ideasMemory.values()) {
          if (idea.idea_hash === ideaHash && idea.status === 'active') {
            if (!userId || idea.user_id === userId) {
              console.log(`✅ Ideia duplicada encontrada (memória): ${idea.id}`);
              return idea;
            }
          }
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar ideia por hash:', error.message);
      throw error;
    }
  }

  /**
   * Cria uma nova ideia no banco de dados
   * 
   * @param {Object} ideaData - Dados da ideia
   * @param {string} ideaData.nome - Nome da ideia
   * @param {string} ideaData.categoria - Categoria
   * @param {number} ideaData.empolgacao - Nível de empolgação (1-5)
   * @param {string} ideaData.motivo - Motivo do abandono
   * @param {Object} ideaData.analysis - Análise da IA
   * @param {string} ideaData.userId - ID do usuário (OBRIGATÓRIO em produção)
   * @returns {Promise<Object>} Ideia criada
   */
  async createIdea(ideaData) {
    try {
      const {
        nome,
        categoria,
        empolgacao,
        motivo,
        analysis,
        userId,
      } = ideaData;

      // Validação
      if (!nome || !categoria || !empolgacao || !motivo || !analysis) {
        throw new Error('Dados incompletos para criar ideia');
      }

      if (!userId) {
        throw new Error('userId é obrigatório para criar ideia');
      }

      if (empolgacao < 1 || empolgacao > 5) {
        throw new Error('Empolgação deve estar entre 1 e 5');
      }

      // Gerar hash
      const ideaHash = this.generateIdeaHash(nome, motivo);

      // Verificar duplicação (apenas para este usuário)
      const existingIdea = await this.findIdeaByHash(ideaHash, userId);
      if (existingIdea) {
        console.log(`⚠️  Ideia duplicada detectada para usuário ${userId}`);
        return {
          ...existingIdea,
          isDuplicate: true,
        };
      }

      // Preparar dados para inserção
      const newIdea = {
        idea_hash: ideaHash,
        nome,
        categoria,
        empolgacao,
        motivo,
        survival_percentage: analysis.survival_percentage,
        cause_of_death_summary: analysis.cause_of_death_summary,
        ai_verdict: analysis.ai_verdict,
        honor_count: 0,
        status: 'active',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (this.supabase) {
        // Inserir no Supabase
        const { data, error } = await this.supabase
          .from('ideas')
          .insert([newIdea])
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log(`✅ Ideia criada com sucesso: ${data.id} (usuário: ${userId})`);
        return data;
      } else {
        // Fallback em memória
        const id = crypto.randomUUID();
        const ideaWithId = { ...newIdea, id };
        this.ideasMemory.set(id, ideaWithId);
        console.log(`✅ Ideia criada em memória: ${id}`);
        return ideaWithId;
      }
    } catch (error) {
      console.error('❌ Erro ao criar ideia:', error.message);
      throw error;
    }
  }

  /**
   * Obtém uma ideia pelo ID
   * 
   * @param {string} ideaId - ID da ideia
   * @param {string} userId - ID do usuário (para validação de segurança)
   * @returns {Promise<Object|null>} Ideia ou null
   */
  async getIdea(ideaId, userId = null) {
    try {
      if (this.supabase) {
        let query = this.supabase
          .from('ideas')
          .select('*')
          .eq('id', ideaId);

        // Validação de segurança: usuário só pode acessar suas próprias ideias
        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query.single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return data || null;
      } else {
        // Fallback em memória
        const idea = this.ideasMemory.get(ideaId);
        if (idea && (!userId || idea.user_id === userId)) {
          return idea;
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao obter ideia:', error.message);
      throw error;
    }
  }

  /**
   * Lista ideias com filtros
   * 
   * @param {Object} options - Opções de filtro
   * @param {string} options.status - Status: 'active', 'archived', 'all'
   * @param {string} options.userId - ID do usuário (para segurança)
   * @param {number} options.limit - Limite de resultados
   * @param {number} options.offset - Offset para paginação
   * @returns {Promise<Array>} Lista de ideias
   */
  async listIdeas(options = {}) {
    try {
      const {
        status = 'active',
        userId = null,
        limit = 50,
        offset = 0,
      } = options;

      if (this.supabase) {
        let query = this.supabase
          .from('ideas')
          .select('*', { count: 'exact' });

        // Filtrar por status
        if (status !== 'all') {
          query = query.eq('status', status);
        }

        // Filtrar por usuário (segurança)
        if (userId) {
          query = query.eq('user_id', userId);
        }

        // Ordenar por data de criação (mais recentes primeiro)
        query = query.order('created_at', { ascending: false });

        // Paginação
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        console.log(`✅ ${data.length} ideias listadas (total: ${count})`);
        return {
          ideas: data,
          total: count,
          limit,
          offset,
        };
      } else {
        // Fallback em memória
        let ideas = Array.from(this.ideasMemory.values());

        // Filtrar por status
        if (status !== 'all') {
          ideas = ideas.filter(idea => idea.status === status);
        }

        // Filtrar por usuário
        if (userId) {
          ideas = ideas.filter(idea => idea.user_id === userId);
        }

        // Ordenar
        ideas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Paginação
        const total = ideas.length;
        ideas = ideas.slice(offset, offset + limit);

        return {
          ideas,
          total,
          limit,
          offset,
        };
      }
    } catch (error) {
      console.error('❌ Erro ao listar ideias:', error.message);
      throw error;
    }
  }

  /**
   * Obtém ideias de um usuário específico
   * 
   * @param {string} userId - ID do usuário
   * @param {string} status - Status das ideias
   * @returns {Promise<Array>} Ideias do usuário
   */
  async getIdeasByUser(userId, status = 'active') {
    try {
      if (!userId) {
        throw new Error('userId é obrigatório');
      }

      const result = await this.listIdeas({
        status,
        userId,
        limit: 1000, // Sem limite prático
      });

      console.log(`✅ ${result.ideas.length} ideias encontradas para usuário ${userId}`);
      return result.ideas;
    } catch (error) {
      console.error('❌ Erro ao obter ideias do usuário:', error.message);
      throw error;
    }
  }

  /**
   * Incrementa contador de homenagens
   * 
   * @param {string} ideaId - ID da ideia
   * @param {string} userId - ID do usuário (para validação)
   * @returns {Promise<Object>} Dados de homenagem com trigger visual
   */
  async incrementHonor(ideaId, userId = null) {
    try {
      // Validação de segurança: verificar se ideia pertence ao usuário
      const idea = await this.getIdea(ideaId, userId);
      if (!idea) {
        throw new Error('Ideia não encontrada ou acesso negado');
      }

      const newHonorCount = (idea.honor_count || 0) + 1;

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('ideas')
          .update({
            honor_count: newHonorCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', ideaId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log(`🎉 Homenagem adicionada: ${data.honor_count} homenagens`);
        return {
          honor_count: data.honor_count,
          trigger: 'celebration',
          message: `Ideia homenageada! Total: ${data.honor_count}`,
        };
      } else {
        // Fallback em memória
        const idea = this.ideasMemory.get(ideaId);
        if (idea) {
          idea.honor_count = newHonorCount;
          idea.updated_at = new Date().toISOString();
          console.log(`🎉 Homenagem adicionada (memória): ${idea.honor_count} homenagens`);
          return {
            honor_count: idea.honor_count,
            trigger: 'celebration',
            message: `Ideia homenageada! Total: ${idea.honor_count}`,
          };
        }
        throw new Error('Ideia não encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao incrementar homenagem:', error.message);
      throw error;
    }
  }

  /**
   * Arquiva uma ideia (delete lógico)
   * Muda status para 'archived' e remove da lista ativa
   * 
   * @param {string} ideaId - ID da ideia
   * @param {string} userId - ID do usuário (para validação)
   * @returns {Promise<Object>} Ideia arquivada
   */
  async archiveIdea(ideaId, userId = null) {
    try {
      // Validação de segurança
      const idea = await this.getIdea(ideaId, userId);
      if (!idea) {
        throw new Error('Ideia não encontrada ou acesso negado');
      }

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('ideas')
          .update({
            status: 'archived',
            updated_at: new Date().toISOString(),
          })
          .eq('id', ideaId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log(`💀 Ideia arquivada: ${data.id}`);
        return {
          ...data,
          message: 'Ideia ressuscitada e arquivada com honra',
        };
      } else {
        // Fallback em memória
        const idea = this.ideasMemory.get(ideaId);
        if (idea) {
          idea.status = 'archived';
          idea.updated_at = new Date().toISOString();
          console.log(`💀 Ideia arquivada (memória): ${idea.id}`);
          return {
            ...idea,
            message: 'Ideia ressuscitada e arquivada com honra',
          };
        }
        throw new Error('Ideia não encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao arquivar ideia:', error.message);
      throw error;
    }
  }

  /**
   * Atualiza uma ideia
   * 
   * @param {string} ideaId - ID da ideia
   * @param {Object} updates - Campos a atualizar
   * @param {string} userId - ID do usuário (para validação)
   * @returns {Promise<Object>} Ideia atualizada
   */
  async updateIdea(ideaId, updates, userId = null) {
    try {
      // Validação de segurança
      const idea = await this.getIdea(ideaId, userId);
      if (!idea) {
        throw new Error('Ideia não encontrada ou acesso negado');
      }

      // Não permitir atualizar campos críticos
      const forbiddenFields = ['id', 'idea_hash', 'user_id', 'created_at'];
      forbiddenFields.forEach(field => {
        delete updates[field];
      });

      // Adicionar timestamp de atualização
      updates.updated_at = new Date().toISOString();

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('ideas')
          .update(updates)
          .eq('id', ideaId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log(`✏️  Ideia atualizada: ${data.id}`);
        return data;
      } else {
        // Fallback em memória
        const idea = this.ideasMemory.get(ideaId);
        if (idea) {
          Object.assign(idea, updates);
          console.log(`✏️  Ideia atualizada (memória): ${idea.id}`);
          return idea;
        }
        throw new Error('Ideia não encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar ideia:', error.message);
      throw error;
    }
  }

  /**
   * Deleta uma ideia fisicamente (operação irreversível)
   * Usar com cuidado - preferir archiveIdea para delete lógico
   * 
   * @param {string} ideaId - ID da ideia
   * @param {string} userId - ID do usuário (para validação)
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async deleteIdea(ideaId, userId = null) {
    try {
      // Validação de segurança
      const idea = await this.getIdea(ideaId, userId);
      if (!idea) {
        throw new Error('Ideia não encontrada ou acesso negado');
      }

      console.warn(`⚠️  DELETANDO FISICAMENTE ideia: ${ideaId}`);

      if (this.supabase) {
        const { error } = await this.supabase
          .from('ideas')
          .delete()
          .eq('id', ideaId);

        if (error) {
          throw error;
        }

        console.log(`🗑️  Ideia deletada fisicamente: ${ideaId}`);
        return true;
      } else {
        // Fallback em memória
        this.ideasMemory.delete(ideaId);
        console.log(`🗑️  Ideia deletada fisicamente (memória): ${ideaId}`);
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao deletar ideia:', error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de ideias
   * 
   * @param {string} userId - ID do usuário (opcional)
   * @returns {Promise<Object>} Estatísticas
   */
  async getStatistics(userId = null) {
    try {
      if (this.supabase) {
        let query = this.supabase
          .from('ideas')
          .select('status, honor_count, survival_percentage', { count: 'exact' });

        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        const stats = {
          total: count,
          active: data.filter(i => i.status === 'active').length,
          archived: data.filter(i => i.status === 'archived').length,
          totalHonors: data.reduce((sum, i) => sum + (i.honor_count || 0), 0),
          averageSurvival: data.length > 0
            ? Math.round(data.reduce((sum, i) => sum + i.survival_percentage, 0) / data.length)
            : 0,
        };

        console.log(`📊 Estatísticas: ${stats.total} ideias, ${stats.totalHonors} homenagens`);
        return stats;
      } else {
        // Fallback em memória
        const ideas = Array.from(this.ideasMemory.values());
        const filtered = userId ? ideas.filter(i => i.user_id === userId) : ideas;

        const stats = {
          total: filtered.length,
          active: filtered.filter(i => i.status === 'active').length,
          archived: filtered.filter(i => i.status === 'archived').length,
          totalHonors: filtered.reduce((sum, i) => sum + (i.honor_count || 0), 0),
          averageSurvival: filtered.length > 0
            ? Math.round(filtered.reduce((sum, i) => sum + i.survival_percentage, 0) / filtered.length)
            : 0,
        };

        return stats;
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error.message);
      throw error;
    }
  }
}

// Singleton
let ideaService;

export function getIdeaService() {
  if (!ideaService) {
    ideaService = new IdeaService();
  }
  return ideaService;
}

export default IdeaService;
