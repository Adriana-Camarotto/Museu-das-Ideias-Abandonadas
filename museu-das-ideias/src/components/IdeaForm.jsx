/**
 * Formulario para submissao de startups quase boas.
 * Coleta dados e envia para analise da IA.
 */

import { useState } from 'react';
import { analyzeIdea } from '../services/ideaService';
import AnalysisResult from './AnalysisResult';
import Button from './Button';
import Alert from './Alert';

export default function IdeaForm() {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    empolgacao: 3,
    motivo: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeIdea(formData);
      setResult(analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'empolgacao' ? Number(value) : value
    }));
  };

  const handleReset = () => {
    setFormData({
      nome: '',
      categoria: '',
      empolgacao: 3,
      motivo: ''
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Formulário */}
      <div className="bg-[#161020] border border-[rgba(180,140,255,0.15)] rounded-xl p-8 mb-6">
        <div className="mb-6">
          <h2 className="font-['Cinzel'] text-2xl text-[#c4a8ff] mb-2">
            Confesse sua Startup Quase Boa
          </h2>
          <p className="text-sm text-[#a898c8]">
            Compartilhe conosco a startup que parecia brilhante no pitch e duvidosa na execucao.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da Startup */}
          <div>
            <label className="block text-sm font-medium text-[#c4a8ff] mb-2">
              Nome da Startup *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-[#0f0b18] border border-[rgba(180,140,255,0.2)] rounded-lg text-[#e8e0f5] placeholder-[#6a5c8a] focus:outline-none focus:border-[#7c5ce8] transition-colors disabled:opacity-50"
              placeholder="Ex: Uber para Pombos"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-[#c4a8ff] mb-2">
              Categoria *
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-[#0f0b18] border border-[rgba(180,140,255,0.2)] rounded-lg text-[#e8e0f5] focus:outline-none focus:border-[#7c5ce8] transition-colors disabled:opacity-50"
            >
              <option value="">Selecione uma categoria...</option>
              <option value="Animais">🐦 Animais</option>
              <option value="Comida">🍔 Comida</option>
              <option value="Transporte">🚕 Transporte</option>
              <option value="Tecnologia">💻 Tecnologia</option>
              <option value="Relacionamentos">💘 Relacionamentos</option>
              <option value="Outro">🎯 Outro</option>
            </select>
          </div>

          {/* Empolgação */}
          <div>
            <label className="block text-sm font-medium text-[#c4a8ff] mb-2">
              Nivel de Viabilidade: <span className="text-[#e8b86d] font-bold">{formData.empolgacao}/5</span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#6a5c8a]">💀 Inviavel</span>
              <input
                type="range"
                name="empolgacao"
                min="1"
                max="5"
                value={formData.empolgacao}
                onChange={handleChange}
                disabled={loading}
                className="flex-1 h-2 bg-[#0f0b18] rounded-lg appearance-none cursor-pointer accent-[#7c5ce8] disabled:opacity-50"
              />
              <span className="text-xs text-[#6a5c8a]">🤡 Quase Genial</span>
            </div>
          </div>

          {/* Causa da Falencia */}
          <div>
            <label className="block text-sm font-medium text-[#c4a8ff] mb-2">
              Por que nunca deu certo? *
            </label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              required
              disabled={loading}
              rows="4"
              className="w-full px-4 py-3 bg-[#0f0b18] border border-[rgba(180,140,255,0.2)] rounded-lg text-[#e8e0f5] placeholder-[#6a5c8a] focus:outline-none focus:border-[#7c5ce8] transition-colors resize-none disabled:opacity-50"
              placeholder="Conte sem filtro o motivo da falencia..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Analisando...
                </span>
              ) : (
                '🤔 Analisar Startup'
              )}
            </Button>
            
            {(result || error) && (
              <Button
                type="button"
                onClick={handleReset}
                disabled={loading}
                variant="secondary"
              >
                Nova Analise
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Erro */}
      {error && (
        <Alert
          variant="error"
          title="Erro ao Processar"
          message={error}
          className="mb-6"
        />
      )}

      {/* Resultado */}
      {result && <AnalysisResult data={result} ideaName={formData.nome} />}
    </div>
  );
}
