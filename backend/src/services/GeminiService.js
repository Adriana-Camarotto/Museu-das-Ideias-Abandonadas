/**
 * Serviço de Integração com Google Gemini
 * Centraliza toda a lógica de comunicação com a IA
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/environment.js';

class GeminiService {
  constructor() {
    try {
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      this.model = genAI.getGenerativeModel({ model: config.geminiModel });
      console.log('✅ Google Gemini inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Gemini:', error.message);
      throw error;
    }
  }

  /**
   * Analisa uma ideia abandonada
   * @param {Object} ideaData - Dados da ideia
   * @returns {Promise<Object>} Análise da IA
   */
  async analyzeIdea(ideaData) {
    const { nome, categoria, empolgacao, motivo } = ideaData;

    const prompt = `
Você é a **Curadora do Caos**, guardiã do Museu das Ideias Abandonadas. 
Sua missão é analisar projetos que nunca saíram do papel com um tom analítico, 
poético sobre o fracasso e levemente sarcástico - mas sempre confortando o criador.

Analise esta ideia abandonada:

📋 **Nome da Ideia:** ${nome}
🏷️ **Categoria:** ${categoria}
🔥 **Empolgação Inicial:** ${empolgacao}/5
💀 **Motivo do Abandono:** ${motivo}

Retorne APENAS um objeto JSON válido (sem markdown, sem \`\`\`json, sem formatação extra) com estas três chaves:

{
  "survival_percentage": [número de 0 a 100 representando as chances de sobrevivência da ideia],
  "cause_of_death_summary": "[frase curta e poética resumindo o fracasso em no máximo 10 palavras]",
  "ai_verdict": "[parágrafo de 2-3 frases com veredito sarcástico mas reconfortante, celebrando o fracasso como parte do processo criativo]"
}

Seja criativa, poética e levemente cruel - mas sempre termine com uma nota de esperança.
`;

    try {
      console.log(`🤖 Enviando para Gemini: "${nome}" (${categoria})`);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      let aiText = response.text();

      console.log('📥 Resposta da IA recebida');

      // Remove possíveis marcações markdown
      aiText = aiText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Parse do JSON
      const aiAnalysis = JSON.parse(aiText);

      // Validação da estrutura
      if (
        typeof aiAnalysis.survival_percentage !== 'number' ||
        typeof aiAnalysis.cause_of_death_summary !== 'string' ||
        typeof aiAnalysis.ai_verdict !== 'string'
      ) {
        throw new Error('Resposta da IA em formato inválido');
      }

      console.log(`✅ Análise concluída: ${aiAnalysis.survival_percentage}% de sobrevivência`);
      return aiAnalysis;
    } catch (error) {
      console.error('❌ Erro ao analisar ideia:', error.message);
      throw error;
    }
  }

  /**
   * Gera texto de compartilhamento para WhatsApp
   * @param {Object} ideaData - Dados da ideia
   * @returns {Promise<string>} Mensagem formatada
   */
  async generateShareText(ideaData) {
    const { nome, survival_percentage, honor_count } = ideaData;

    const prompt = `
Você é a Curadora do Caos. Gere uma mensagem viral e poética para compartilhar no WhatsApp sobre esta ideia abandonada:

Nome: ${nome}
Taxa de Sobrevivência: ${survival_percentage}%
Homenagens: ${honor_count || 0}

A mensagem deve ser:
- Curta (máximo 280 caracteres)
- Poética e sarcástica
- Incluir emojis temáticos
- Terminar com esperança

Retorne APENAS a mensagem, sem aspas ou formatação extra.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const message = result.response.text().trim();
      return message;
    } catch (error) {
      console.error('❌ Erro ao gerar texto de compartilhamento:', error.message);
      throw error;
    }
  }

  /**
   * Gera epitáfio para ideia "revivida"
   * @param {Object} ideaData - Dados da ideia
   * @returns {Promise<string>} Epitáfio poético
   */
  async generateEpitaph(ideaData) {
    const { nome, survival_percentage, honor_count } = ideaData;

    const prompt = `
Você é a Curadora do Caos. Gere um epitáfio poético e sarcástico para esta ideia que foi "revivida" (arquivada):

Nome: ${nome}
Taxa de Sobrevivência: ${survival_percentage}%
Homenagens: ${honor_count || 0}

O epitáfio deve ser:
- Uma frase única e memorável
- Poética e sarcástica
- Celebrar o fracasso como parte do processo criativo
- Máximo 150 caracteres

Retorne APENAS o epitáfio, sem aspas ou formatação extra.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const epitaph = result.response.text().trim();
      return epitaph;
    } catch (error) {
      console.error('❌ Erro ao gerar epitáfio:', error.message);
      throw error;
    }
  }
}

// Singleton
let geminiService;

export function getGeminiService() {
  if (!geminiService) {
    geminiService = new GeminiService();
  }
  return geminiService;
}

export default GeminiService;
