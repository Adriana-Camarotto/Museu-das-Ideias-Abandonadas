/**
 * Seção de Ranking
 * Exibe as ideias mais homenageadas
 */

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export default function RankingSection() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/api/ranking?limit=5`);
      const data = await response.json();

      if (data.success) {
        setRanking(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erro ao carregar ranking');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ranking-section">
      <h3>🏆 Ranking de Homenagens</h3>

      {loading && <p className="loading">Carregando ranking...</p>}
      {error && <p className="error">{error}</p>}

      {ranking.length > 0 ? (
        <div className="ranking-list">
          {ranking.map((idea, index) => (
            <div key={idea.id} className="ranking-item">
              <div className="ranking-position">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && `#${index + 1}`}
              </div>
              <div className="ranking-info">
                <h4>{idea.nome}</h4>
                <p className="category">{idea.categoria}</p>
              </div>
              <div className="ranking-honors">
                <span className="honor-count">{idea.honor_count}</span>
                <span className="honor-label">🏆</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="empty">Nenhuma ideia homenageada ainda</p>
      )}

      <button className="btn btn-secondary" onClick={fetchRanking}>
        Atualizar Ranking
      </button>
    </div>
  );
}
