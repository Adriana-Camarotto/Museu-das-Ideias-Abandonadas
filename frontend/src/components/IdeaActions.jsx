/**
 * Ações de Ideia
 * Componente para reviver, homenagear e compartilhar ideias
 */

import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

export default function IdeaActions({ ideaId, ideaNome, onActionComplete }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleRevive = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/api/ideias/${ideaId}/reviver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setFeedback({
          type: 'success',
          message: '💀 Ideia arquivada com sucesso!',
        });
        if (onActionComplete) onActionComplete();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Erro ao arquivar ideia',
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Erro ao arquivar ideia',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleHonor = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/api/ideias/${ideaId}/homenagear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setFeedback({
          type: 'success',
          message: `🏆 Homenagem adicionada! (Total: ${data.data.honor_count})`,
        });
        if (onActionComplete) onActionComplete();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Erro ao homenagear ideia',
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Erro ao homenagear ideia',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/api/ideias/${ideaId}/compartilhar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'whatsapp' }),
      });

      const data = await response.json();

      if (data.success) {
        // Copiar mensagem para clipboard
        navigator.clipboard.writeText(data.data.message);
        setFeedback({
          type: 'success',
          message: '📋 Mensagem copiada! Abra WhatsApp para compartilhar.',
        });

        // Abrir WhatsApp
        setTimeout(() => {
          window.open(data.data.whatsappUrl, '_blank');
        }, 500);
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Erro ao gerar mensagem',
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Erro ao compartilhar ideia',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="idea-actions">
      <div className="actions-buttons">
        <button
          className="btn btn-action honor-btn"
          onClick={handleHonor}
          disabled={loading}
          title="Homenagear esta ideia"
        >
          🏆 Homenagear
        </button>

        <button
          className="btn btn-action share-btn"
          onClick={handleShare}
          disabled={loading}
          title="Compartilhar no WhatsApp"
        >
          📤 Compartilhar
        </button>

        <button
          className="btn btn-action revive-btn"
          onClick={handleRevive}
          disabled={loading}
          title="Arquivar esta ideia"
        >
          💀 Reviver
        </button>
      </div>

      {feedback && (
        <div className={`feedback feedback-${feedback.type}`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
}
