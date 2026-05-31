/**
 * Formulário para submissão de ideias abandonadas
 * Coleta dados do usuário e envia para análise da IA
 */

import { useState } from 'react';
import { analyzeIdea } from '../services/ideaService';
import { validateIdeaData } from '../utils/validators';
import { useMuseum } from '../hooks/useMuseum';
import AnalysisResult from './AnalysisResult';

export default function IdeaForm({ onIdeaAdded }) {
  const { setAnalysisResult, setAnalysisLoading, setAnalysisError } = useMuseum();
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    empolgacao: 3,
    motivo: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [ideaId, setIdeaId] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors([]);
    setError(null);
    setResult(null);
    setIdeaId(null);

    // Validação local
    const validation = validateIdeaData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setLoading(true);
    setAnalysisLoading(true);

    try {
      const analysis = await analyzeIdea(formData);
      setResult(analysis);
      setIdeaId(analysis.id);
      setAnalysisResult(analysis);
      
      // Callback para atualizar a lista de ideias no App.jsx
      // Permite que a nova ideia apareça instantaneamente sem reload
      if (onIdeaAdded && typeof onIdeaAdded === 'function') {
        onIdeaAdded(analysis);
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao analisar ideia';
      setError(errorMessage);
      setAnalysisError(errorMessage);
    } finally {
      setLoading(false);
      setAnalysisLoading(false);
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
    setError(null);
    setResult(null);
    setValidationErrors([]);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="idea-form">
        <h2>Envie sua Ideia Abandonada</h2>

        {validationErrors.length > 0 && (
          <div className="error-box">
            <ul>
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="error-box">
            <p>{error}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="nome">Nome da Ideia *</label>
          <input
            id="nome"
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Ex: App de Delivery de Comida"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoria *</label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Selecione uma categoria</option>
            <option value="App">App</option>
            <option value="Startup">Startup</option>
            <option value="Projeto Pessoal">Projeto Pessoal</option>
            <option value="Negócio">Negócio</option>
            <option value="Hobby">Hobby</option>
            <option value="Estudo">Estudo</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="empolgacao">Empolgação Inicial (1-5) *</label>
          <div className="mood-selector">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                className={`mood-btn ${formData.empolgacao === num ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, empolgacao: num }))}
                disabled={loading}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="motivo">Motivo do Abandono *</label>
          <textarea
            id="motivo"
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            placeholder="Por que você abandonou essa ideia?"
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Analisando...' : 'Analisar Ideia'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Limpar
          </button>
        </div>
      </form>

      {result && <AnalysisResult result={result} ideaId={ideaId} ideaNome={formData.nome} />}
    </div>
  );
}
      motivo: ''
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-5">
      {/* Formulário */}
      <div className="bg-[#161020] border border-[rgba(180,140,255,0.15)] rounded-xl p-12 sm:p-14 mb-8">
        <div className="mb-10">
          <h2 className="font-['Cinzel'] text-2xl text-[#c4a8ff] mb-2">
            Confesse sua Ideia Abandonada
          </h2>
          <p className="text-sm text-[#a898c8]">
            Compartilhe conosco o projeto que nunca saiu do papel. A Curadora do Caos está pronta para julgar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Nome da Ideia */}
          <div>
            <label className="block text-sm font-medium text-[#c4a8ff] mb-3">
              Nome da Ideia *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-6 py-4 bg-[#0f0b18] border border-[rgba(180,140,255,0.2)] rounded-lg text-[#e8e0f5] placeholder-[#6a5c8a] focus:outline-none focus:border-[#7c5ce8] transition-colors disabled:opacity-50"
              placeholder="Ex: App de delivery de sonhos"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-[#c4a8ff] mb-3">
              Categoria *
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-6 py-4 bg-[#0f0b18] border border-[rgba(180,140,255,0.2)] rounded-lg text-[#e8e0f5] focus:outline-none focus:border-[#7c5ce8] transition-colors disabled:opacity-50"
            >
              <option value="">Selecione uma categoria...</option>
              <option value="App">📱 App</option>
              <option value="Startup">🚀 Startup</option>
              <option value="Projeto Pessoal">💡 Projeto Pessoal</option>
              <option value="SaaS">☁️ SaaS</option>
              <option value="E-commerce">🛒 E-commerce</option>
              <option value="Jogo">🎮 Jogo</option>
              <option value="Blog/Conteúdo">✍️ Blog/Conteúdo</option>
              <option value="Outro">🎯 Outro</option>
            </select>
          </div>

          {/* Empolgação */}
          <div>
            <label className="block text-sm font-medium text-[#c4a8ff] mb-3">
              Empolgação Inicial: <span className="text-[#e8b86d] font-bold">{formData.empolgacao}/5</span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#6a5c8a]">😐 Meh</span>
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
              <span className="text-xs text-[#6a5c8a]">🔥 Hype</span>
            </div>
          </div>

          {/* Motivo do Abandono */}
          <div>
            <label className="block text-sm font-medium text-[#c4a8ff] mb-3">
              Por que foi abandonada? *
            </label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              required
              disabled={loading}
              rows="4"
              className="w-full px-6 py-4 bg-[#0f0b18] border border-[rgba(180,140,255,0.2)] rounded-lg text-[#e8e0f5] placeholder-[#6a5c8a] focus:outline-none focus:border-[#7c5ce8] transition-colors resize-none disabled:opacity-50"
              placeholder="Conte-nos a triste (ou hilária) história do abandono..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#7c5ce8] to-[#c4a8ff] text-white font-medium py-3.5 px-7 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Analisando...
                </span>
              ) : (
                '🔮 Analisar Ideia'
              )}
            </button>

            {(result || error) && (
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-7 py-3.5 border border-[rgba(180,140,255,0.3)] text-[#c4a8ff] rounded-lg hover:bg-[rgba(180,140,255,0.1)] transition-colors disabled:opacity-50"
              >
                Nova Análise
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-6 rounded-xl border border-[rgba(224,96,96,0.35)] bg-[#2d1a1a] p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💀</span>
            <div>
              <h3 className="text-[#e06060] font-semibold mb-1">
                Erro ao Processar
              </h3>
              <p className="text-[#d4a8a8] text-sm">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && <AnalysisResult data={result} ideaName={formData.nome} />}
    </div>
  );
}
