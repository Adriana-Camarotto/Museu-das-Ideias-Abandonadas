import { useState } from 'react';
import RipModal from './RipModal';
import './RipModalTest.css';

export default function RipModalTest() {
  const [isRipModalOpen, setIsRipModalOpen] = useState(false);
  const [ripTargetIdea, setRipTargetIdea] = useState(null);
  const [deletedIdeas, setDeletedIdeas] = useState([]);

  const testIdea = {
    icon: '🧪',
    name: 'Projeto de Teste RIP',
    dates: '2026 – 2026',
    cause: 'Para demonstrar a funcionalidade do botão RIP'
  };

  const handleRipClick = () => {
    setRipTargetIdea(testIdea);
    setIsRipModalOpen(true);
  };

  const handleRipConfirm = () => {
    setDeletedIdeas((prev) => [...prev, testIdea.name]);
    setRipTargetIdea(null);
  };

  const handleReset = () => {
    setDeletedIdeas([]);
  };

  return (
    <div className="rip-test-container">
      <div className="rip-test-header">
        <h2>🧪 Teste do Modal RIP</h2>
        <p>Clique no botão RIP para testar toda a funcionalidade</p>
      </div>

      <div className="rip-test-card">
        <div className="test-card-icon">{testIdea.icon}</div>
        <div className="test-card-content">
          <div className="test-card-name">{testIdea.name}</div>
          <div className="test-card-dates">{testIdea.dates}</div>
          <div className="test-card-cause">
            <strong>Causa:</strong> {testIdea.cause}
          </div>
        </div>
        <button
          className="test-rip-button"
          onClick={handleRipClick}
          disabled={deletedIdeas.includes(testIdea.name)}
        >
          🪦 RIP
        </button>
      </div>

      {deletedIdeas.includes(testIdea.name) && (
        <div className="test-deleted-message">
          ✨ Este card foi deletado com sucesso! ✨
          <button className="test-reset-btn" onClick={handleReset}>
            ↻ Resetar Teste
          </button>
        </div>
      )}

      <div className="test-instructions">
        <h3>📋 O que testar:</h3>
        <ul>
          <li>✓ Modal aparece ao clicar em RIP</li>
          <li>✓ Modal mostra advertências divertidas</li>
          <li>✓ Sparkles caem quando clica "Sim"</li>
          <li>✓ Certificado de morte aparece</li>
          <li>✓ Pode imprimir o certificado</li>
          <li>✓ Card é deletado após confirmar</li>
          <li>✓ Botão RIP fica desabilitado após deleção</li>
        </ul>
      </div>

      <RipModal
        isOpen={isRipModalOpen}
        onClose={() => setIsRipModalOpen(false)}
        idea={ripTargetIdea}
        onConfirm={handleRipConfirm}
      />
    </div>
  );
}
