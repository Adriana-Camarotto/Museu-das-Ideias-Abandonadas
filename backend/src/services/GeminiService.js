/**
 * Serviço de Integração com Google Gemini
 * Centraliza toda a lógica de comunicação com a API Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/environment.js';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Analisa uma ideia abandonada usando a IA
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
      console.log('🤖 Enviando ideia para análise da Curadora do Caos...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let aiText = response.text();

      console.log('📥 Resposta bruta da IA:', aiText);

      // Remove possíveis marcações markdown
      aiText = aiText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Parse do JSON
      const aiAnalysis = JSON.parse(aiText);

      // Validação da estrutura
      this._validateAnalysisResponse(aiAnalysis);

      console.log('✅ Análise concluída com sucesso!');
      return aiAnalysis;
    } catch (error) {
      console.error('❌ Erro ao processar ideia:', error);
      throw error;
    }
  }

  /**
   * Valida a estrutura da resposta da IA
   * @private
   */
  _validateAnalysisResponse(response) {
    if (
      typeof response.survival_percentage !== 'number' ||
      typeof response.cause_of_death_summary !== 'string' ||
      typeof response.ai_verdict !== 'string'
    ) {
      throw new Error('Resposta da IA em formato inválido');
    }
  }
}

export default new GeminiService();
