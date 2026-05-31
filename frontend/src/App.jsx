import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MuseumModal from './components/MuseumModal';
import { MODAL_CONTENTS } from './components/ModalContent';
import IdeaForm from './components/IdeaForm';
import FormModal from './components/FormModal';
import { subscribeToAlerts } from './services/ideaService';
import { authService } from './services/authService';

export default function App() {
  // Estado da UI
  const [activeModal, setActiveModal] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [activeMemTab, setActiveMemTab] = useState('Sobre');
  const [activeRankTab, setActiveRankTab] = useState('Geral');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [candleCount, setCandleCount] = useState({});

  // Estado dinâmico das ideias (carregadas do backend)
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [selectedCandleIdea, setSelectedCandleIdea] = useState(null);

  const mainRef = useRef(null);
  const museumSectionRef = useRef(null);
  const memorialSectionRef = useRef(null);
  const reliquiarySectionRef = useRef(null);
  const rankingSectionRef = useRef(null);
  const achievementSectionRef = useRef(null);
  const timelineSectionRef = useRef(null);

  // Carrega ideias do backend ao montar o componente
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoadingIdeas(true);
        const response = await fetch('http://localhost:3001/api/ideas', {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar ideias');
        }

        const data = await response.json();
        
        // Backend retorna { success: true, data: [...], pagination: {...} }
        if (data.success && Array.isArray(data.data)) {
          setIdeas(data.data);
          // Define a primeira ideia como selecionada para o memorial
          if (data.data.length > 0) {
            setSelectedCandleIdea(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar ideias:', error);
        // Em caso de erro, mantém array vazio (sem ideias)
        setIdeas([]);
      } finally {
        setLoadingIdeas(false);
      }
    };

    fetchIdeas();
  }, []); // Dependência vazia = executa apenas uma vez ao montar

  // Callback para adicionar nova ideia ao estado quando IdeaForm submete com sucesso
  // Recebe a ideia formatada do backend e adiciona ao topo da lista
  const handleNewIdeaAdded = (novaIdeia) => {
    setIdeas(prev => [novaIdeia, ...prev]);
    // Se não havia ideias, define a primeira como selecionada
    if (ideas.length === 0) {
      setSelectedCandleIdea(novaIdeia.nome);
    }
  };

  const filters = ['Todas', 'Empreendedorismo', 'Estudos', 'Fitness', 'Hobbies', 'Criativas', 'Organização', 'Outros'];
  const survivalPcts = [7, 13, 19, 31, 48];
  const survivalPct = survivalPcts[selectedMood] ?? 13;

  const handleNavigate = (section) => {
    setActiveModal(null);

    const scrollToElement = (ref) => {
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const sectionMap = {
      'inicio': () => mainRef.current?.parentElement?.scrollTo({ top: 0, behavior: 'smooth' }),
      'museu': () => scrollToElement(museumSectionRef),
      'memorial': () => setActiveModal('memorial'),
      'reliquias': () => scrollToElement(reliquiarySectionRef),
      'ranking': () => scrollToElement(rankingSectionRef),
      'conquistas': () => scrollToElement(achievementSectionRef),
      'timeline': () => scrollToElement(timelineSectionRef),
      'comunidade': () => scrollToElement(museumSectionRef),
      'sobre': () => setActiveModal('about')
    };

    sectionMap[section]?.();
  };

  const closeModal = () => {
    setActiveModal(null);
    setIsFormModalOpen(false);
  };

  const handleLightCandle = () => {
    setCandleCount(prev => ({
      ...prev,
      [selectedCandleIdea]: (prev[selectedCandleIdea] || 0) + 1
    }));
    setIsVideoModalOpen(true);
  };

  const selectedIdea = museumCards.find(card => card.name === selectedCandleIdea) || museumCards[0];

  const handleNewsletterSubscribe = async () => {
    const email = newsletterEmail.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email || !isValidEmail) {
      setNewsletterFeedback({
        type: 'error',
        message: 'Digite um e-mail válido para assinar os alertas.'
      });
      return;
    }

    try {
      setNewsletterLoading(true);
      setNewsletterFeedback(null);
      await subscribeToAlerts(email);
      setNewsletterFeedback({
        type: 'success',
        message: 'E-mail de confirmacao enviado. Verifique sua caixa de entrada.'
      });
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterFeedback({
        type: 'error',
        message: error.message || 'Nao foi possivel enviar o e-mail de confirmacao.'
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div>
      <Sidebar onNavigate={handleNavigate} />

      <main className="main" ref={mainRef}>
        <header className="topbar">
          <div className="topbar-left">
            Museu das Ideias Abandonadas · Acervo vivo desde 2019
          </div>
          <div className="topbar-right">
            <button className="notif-btn" type="button" aria-label="Notificações">
              🔔
              <div className="notif-dot"></div>
            </button>
          </div>
        </header>

        <section className="hero">
          <div className="hero-statue">🗿</div>
          <div className="hero-inner">
            <div className="hero-tag">Bem-vindo ao</div>
            <h1>Museu das Ideias Abandonadas</h1>
            <p>
              Preservamos sonhos interrompidos, planos mirabolantes e projetos que não viraram realidade.
            </p>
            <div className="hero-btns">
              <button className="btn-primary" type="button">Entrar no Museu ✦</button>
              <button className="btn-outline" type="button">🎫 Fazer visita guiada</button>
            </div>
            <div className="hero-stats">
              <div><div className="hero-stat-label">Ideias enterradas</div><div className="hero-stat-val">12.842</div></div>
              <div><div className="hero-stat-label">Visitantes</div><div className="hero-stat-val">7.531</div></div>
              <div><div className="hero-stat-label">Memoriais criados</div><div className="hero-stat-val">3.219</div></div>
              <div><div className="hero-stat-label">Anos de promessas</div><div className="hero-stat-val">∞</div></div>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <div className="center-col">
            <div className="sec-header" ref={museumSectionRef}>
              <div>
                <div className="sec-title">Dentro do museu</div>
                <div className="sec-sub">Explore as alas do nosso acervo de sonhos não realizados.</div>
              </div>
            </div>

            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Buscar uma ideia..." />
            </div>

            <div className="filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="ideas-grid">
              {loadingIdeas ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
                  ⏳ Carregando ideias do museu...
                </div>
              ) : ideas.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
                  🏛️ O museu está vazio. Seja o primeiro a eternizar uma ideia!
                </div>
              ) : (
                ideas.map((card) => (
                  <div className="idea-card" key={card.id} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setSelectedCandleIdea(card.nome); memorialSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                    {candleCount[card.nome] > 0 && (
                      <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                        {candleCount[card.nome] > 1 && (
                          <div style={{ background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '-8px' }}>
                            {candleCount[card.nome]}
                          </div>
                        )}
                        <div style={{ fontSize: '20px', filter: 'drop-shadow(0 0 4px rgba(255, 100, 100, 0.6))' }}>🕯️</div>
                      </div>
                    )}
                    <div
                      className="idea-thumb"
                      style={{
                        background: 'linear-gradient(135deg, #1e1a30, #282048)'
                      }}
                    >
                      <span>{card.icon}</span>
                      <div className="idea-rip">🪦 RIP</div>
                    </div>
                    <div className="idea-body">
                      <div className="idea-name">{card.nome}</div>
                      <div className="idea-dates">{card.dates}</div>
                      <div className="idea-cause">
                        <strong>Causa da morte:</strong> {card.cause}
                      </div>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

          <div className="right-col">
            <div className="form-card">
              <div className="form-title">Adicionar nova tragédia</div>
              <div className="form-sub">Registre sua ideia para que ela seja eternizada.</div>
              <button
                className="btn-submit"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsFormModalOpen(true);
                }}
              >
                ✉ Abrir formulário
              </button>
            </div>

            <div className="prediction-card">
              <div className="prediction-header">
                <div>
                  <div className="pred-title">Previsão de sobrevivência pela IA</div>
                  <div className="pred-sub">Nossa IA analisou e prevê:</div>
                </div>
                <div className="crystal-ball">🔮</div>
              </div>
              <div className="survival-pct">{survivalPct}%</div>
              <div className="survival-label">Boa sorte.</div>
              <div style={{ marginTop: '14px', background: 'var(--bg3)', borderRadius: '8px', overflow: 'hidden', height: '6px' }}>
                <div style={{ width: `${survivalPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--danger), #e88000)', borderRadius: '8px', transition: 'width 0.8s ease' }}></div>
              </div>
            </div>

            <div className="curator-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Curadoria diz</div>
              <div className="curator-wrap">
                <div className="curator-face">🎭</div>
                <div>
                  <div className="curator-q">"Não é fracasso. É coleção. O museu sempre terá espaço para mais um sonho."</div>
                  <div className="curator-sig">- Curadora do Caos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <div className="sec-header" ref={memorialSectionRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="sec-title">Memorial de uma ideia</div>
              {selectedCandleIdea && candleCount[selectedCandleIdea] > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(224, 96, 96, 0.2)', padding: '6px 12px', borderRadius: '20px' }}>
                  <div style={{ fontSize: '16px' }}>🕯️</div>
                  {candleCount[selectedCandleIdea] > 1 && (
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--danger)' }}>{candleCount[selectedCandleIdea]}</div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>◀</button>
              <button type="button" style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>▶</button>
              <button type="button" style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--danger)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>💔</button>
            </div>
          </div>

          {selectedCandleIdea && ideas.length > 0 ? (
            <>
              {(() => {
                const selectedIdea = ideas.find(idea => idea.nome === selectedCandleIdea);
                return selectedIdea ? (
                  <>
                    <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', position: 'relative' }}>
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #2a1a1a, #4a2828)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '36px',
                          flexShrink: 0
                        }}
                      >
                        {selectedIdea.icon}
                      </div>
                      <div>
                        <div className="memorial-name">{selectedIdea.nome}</div>
                        <div className="memorial-dates">{selectedIdea.dates}</div>
                        <div className="memorial-cause-label">Causa da morte</div>
                        <div className="memorial-cause-val">{selectedIdea.cause}</div>
                        <div className="memorial-quote">"Só mais uma ideia que poderia ter mudado tudo."</div>
                      </div>
                    </div>

                    <div className="memorial-tabs">
                      {['Sobre', 'Linha do Tempo', 'Relíquias', 'Estatísticas', 'Conquistas'].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          className={`mem-tab ${activeMemTab === tab ? 'active' : ''}`}
                          onClick={() => setActiveMemTab(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="memorial-cols" style={{ background: activeMemTab === 'Sobre' ? 'var(--bg3)' : 'transparent', padding: activeMemTab === 'Sobre' ? '12px' : '0', margin: activeMemTab === 'Sobre' ? '8px' : '0', borderRadius: activeMemTab === 'Sobre' ? 'var(--radius-sm)' : '0', boxShadow: activeMemTab === 'Sobre' ? '0 0 20px rgba(155, 127, 244, 0.6), 0 0 40px rgba(155, 127, 244, 0.3)' : 'none', transition: 'all 0.2s' }}>
                      <div>
                        <div className="mem-col-title">Análise da IA</div>
                        <div className="mem-item">{selectedIdea.ai_verdict}</div>
                      </div>
                      <div>
                        <div className="mem-col-title">Sobrevivência</div>
                        <div className="mem-item">{selectedIdea.survival_percentage}% de chance</div>
                      </div>
                      <div>
                        <div className="mem-col-title">Homenagens</div>
                        <div className="mem-item">{selectedIdea.honor_count} velas acesas</div>
                      </div>
                    </div>
                  </>
                ) : null;
              })()}
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>
              Selecione uma ideia para ver seu memorial
            </div>
          )}
        </div>

        <div className="bottom-grid">
          <section className="bottom-sec" ref={timelineSectionRef} style={{ background: activeMemTab === 'Linha do Tempo' ? 'var(--bg3)' : 'transparent', padding: activeMemTab === 'Linha do Tempo' ? '12px' : '20px', margin: activeMemTab === 'Linha do Tempo' ? '8px' : '0', borderRadius: activeMemTab === 'Linha do Tempo' ? 'var(--radius-sm)' : '0', boxShadow: activeMemTab === 'Linha do Tempo' ? '0 0 20px rgba(155, 127, 244, 0.6), 0 0 40px rgba(155, 127, 244, 0.3)' : 'none', transition: 'all 0.2s' }}>
            <div className="sec-header">
              <div className="sec-title" style={{ fontSize: '14px' }}>Linha do tempo</div>
            </div>
            <div className="timeline">
              <div className="tl-item"><div className="tl-dot"></div><div><div className="tl-day">Dia 1</div><div className="tl-text">Ideia nasceu durante um café e um reels motivacional.</div></div></div>
              <div className="tl-item"><div className="tl-dot"></div><div><div className="tl-day">Dia 2</div><div className="tl-text">Pesquisa de fornecedores e preços.</div></div></div>
              <div className="tl-item"><div className="tl-dot"></div><div><div className="tl-day">Dia 3</div><div className="tl-text">Criação do nome, logo e bio no Instagram.</div></div></div>
              <div className="tl-item"><div className="tl-dot"></div><div><div className="tl-day">Dia 5</div><div className="tl-text">Compras de materiais que ainda não chegaram.</div></div></div>
              <div className="tl-item"><div className="tl-dot"></div><div><div className="tl-day">Dia 12</div><div className="tl-text">Planejamento da loja virtual (nunca lançada).</div></div></div>
              <div className="tl-item"><div className="tl-dot rip"></div><div><div className="tl-day" style={{ color: 'var(--danger)' }}>Dia 18</div><div className="tl-text"><strong>Última atividade detectada. Silêncio eterno.</strong></div></div></div>
            </div>
          </section>

          <section className="bottom-sec" ref={reliquiarySectionRef} style={{ background: activeMemTab === 'Relíquias' ? 'var(--bg3)' : 'transparent', padding: activeMemTab === 'Relíquias' ? '12px' : '20px', margin: activeMemTab === 'Relíquias' ? '8px' : '0', borderRadius: activeMemTab === 'Relíquias' ? 'var(--radius-sm)' : '0', boxShadow: activeMemTab === 'Relíquias' ? '0 0 20px rgba(155, 127, 244, 0.6), 0 0 40px rgba(155, 127, 244, 0.3)' : 'none', transition: 'all 0.2s' }}>
            <div className="sec-header">
              <div className="sec-title" style={{ fontSize: '14px' }}>Relíquias encontradas</div>
            </div>
            <div className="relics-grid">
              <div className="relic-item"><div className="relic-icon">📄</div><div className="relic-name">Plano de Negócios FINAL_v3_agoraVai.pdf</div></div>
              <div className="relic-item"><div className="relic-icon">📝</div><div className="relic-name">Lista de nomes para a marca</div></div>
              <div className="relic-item"><div className="relic-icon">🏷️</div><div className="relic-name">Rascunho do logo (nunca usado)</div></div>
              <div className="relic-item"><div className="relic-icon">🛒</div><div className="relic-name">Embalagens compradas por impulso</div></div>
            </div>
            <button className="btn-outline" type="button" style={{ width: '100%', marginTop: '12px', fontSize: '12px' }}>Ver todas as relíquias</button>
          </section>

          <section className="bottom-sec" ref={rankingSectionRef} style={{ background: activeMemTab === 'Estatísticas' ? 'var(--bg3)' : 'transparent', padding: activeMemTab === 'Estatísticas' ? '12px' : '20px', margin: activeMemTab === 'Estatísticas' ? '8px' : '0', borderRadius: activeMemTab === 'Estatísticas' ? 'var(--radius-sm)' : '0', boxShadow: activeMemTab === 'Estatísticas' ? '0 0 20px rgba(155, 127, 244, 0.6), 0 0 40px rgba(155, 127, 244, 0.3)' : 'none', transition: 'all 0.2s' }}>
            <div className="sec-header">
              <div className="sec-title" style={{ fontSize: '14px' }}>Rankings do caos</div>
            </div>
            <div className="rank-tabs">
              {['Geral', 'Por categoria', 'Por causa da morte'].map((tab) => (
                <button
                  key={tab}
                  className={`rank-tab ${activeRankTab === tab ? 'active' : ''}`}
                  type="button"
                  onClick={() => setActiveRankTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="rank-item"><div className="rank-num">1.</div><div className="rank-avatar">👑</div><div className="rank-info"><div className="rank-name">Rainha dos Começos</div><div className="rank-count">142 ideias abandonadas</div></div></div>
            <div className="rank-item"><div className="rank-num">2.</div><div className="rank-avatar">🐐</div><div className="rank-info"><div className="rank-name">Mestre da Procrastinação</div><div className="rank-count">97 ideias abandonadas</div></div></div>
            <div className="rank-item"><div className="rank-num">3.</div><div className="rank-avatar">⚡</div><div className="rank-info"><div className="rank-name">Deus do Potencial</div><div className="rank-count">73 ideias abandonadas</div></div></div>
            <div className="rank-item"><div className="rank-num">4.</div><div className="rank-avatar">🔮</div><div className="rank-info"><div className="rank-name">Imperador dos "Amanhãs"</div><div className="rank-count">65 ideias abandonadas</div></div></div>
            <div className="rank-item"><div className="rank-num">5.</div><div className="rank-avatar">🧩</div><div className="rank-info"><div className="rank-name">Senhor das Abas Abertas</div><div className="rank-count">61 ideias abandonadas</div></div></div>
            <button className="btn-outline" type="button" style={{ width: '100%', marginTop: '8px', fontSize: '12px' }}>Ver ranking completo</button>
          </section>

          <section className="bottom-sec" ref={achievementSectionRef} style={{ background: activeMemTab === 'Conquistas' ? 'var(--bg3)' : 'transparent', padding: activeMemTab === 'Conquistas' ? '12px' : '20px', margin: activeMemTab === 'Conquistas' ? '8px' : '0', borderRadius: activeMemTab === 'Conquistas' ? 'var(--radius-sm)' : '0', boxShadow: activeMemTab === 'Conquistas' ? '0 0 20px rgba(155, 127, 244, 0.6), 0 0 40px rgba(155, 127, 244, 0.3)' : 'none', transition: 'all 0.2s' }}>
            <div className="sec-header">
              <div className="sec-title" style={{ fontSize: '14px' }}>Conquistas desbloqueadas</div>
            </div>
            <div className="achievement"><div className="ach-medal">🎖</div><div><div className="ach-name">Colecionador de Começos</div><div className="ach-desc">Começou 10 projetos em um ano</div></div></div>
            <div className="achievement"><div className="ach-medal">🛍</div><div><div className="ach-name">Comprou Antes de Fazer</div><div className="ach-desc">Investiu em itens antes de validar a ideia</div></div></div>
            <div className="achievement"><div className="ach-medal">🎴</div><div><div className="ach-name">Especialista em Tutoriais</div><div className="ach-desc">Assistiu 50+ tutoriais e não fez nada</div></div></div>
            <div className="achievement"><div className="ach-medal">🗂️</div><div><div className="ach-name">Mestre do Planejamento</div><div className="ach-desc">Planejou mais do que executou</div></div></div>
            <button className="btn-outline" type="button" style={{ width: '100%', marginTop: '4px', fontSize: '12px' }}>Ver todas conquistas</button>
          </section>

        </div>

        <div className="footer-row">
          <section className="footer-widget">
            <div className="footer-title">🕯️ Homenagear uma ideia</div>
            <div className="footer-sub">Preste sua homenagem a este projeto que partiu cedo demais.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select
                value={selectedCandleIdea || ''}
                onChange={(e) => setSelectedCandleIdea(e.target.value)}
                className="form-select"
                style={{ marginBottom: '0' }}
              >
                <option value="">Selecione uma ideia...</option>
                {ideas.map((card) => (
                  <option key={card.id} value={card.nome}>
                    {card.icon} {card.nome}
                  </option>
                ))}
              </select>
              <button className="btn-primary" type="button" style={{ width: '100%', fontSize: '12px', padding: '8px 14px' }} onClick={handleLightCandle} disabled={!selectedCandleIdea}>Acender velinha</button>
            </div>
          </section>

          <section className="footer-widget">
            <div className="footer-title">📱 Compartilhar memorial</div>
            <div className="footer-sub">Mostre para o mundo o seu potencial desperdiçado.</div>
            <button className="btn-primary" type="button" style={{ fontSize: '12px' }}>📩 Gerar card para compartilhar</button>
          </section>

          <section className="footer-widget">
            <div className="footer-title">🔔 Receba alertas do museu</div>
            <div className="footer-sub">Novos achados, relíquias e verdades que você não pediu, mas precisa ouvir.</div>
            <div className="footer-input-row">
              <input
                className="footer-input"
                type="email"
                placeholder="Seu melhor e-mail"
                value={newsletterEmail}
                onChange={(event) => {
                  setNewsletterEmail(event.target.value);
                  if (newsletterFeedback) {
                    setNewsletterFeedback(null);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleNewsletterSubscribe();
                  }
                }}
                disabled={newsletterLoading}
              />
              <button
                className="btn-primary"
                type="button"
                onClick={handleNewsletterSubscribe}
                disabled={newsletterLoading}
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                {newsletterLoading ? 'Enviando...' : 'Assinar'}
              </button>
            </div>
            {newsletterFeedback && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  color: newsletterFeedback.type === 'success' ? '#7fd6a9' : 'var(--danger)'
                }}
              >
                {newsletterFeedback.message}
              </div>
            )}
          </section>
        </div>
      </main>

      {activeModal === 'about' && (
        <MuseumModal
          isOpen={true}
          onClose={closeModal}
          title={MODAL_CONTENTS.about.title}
        >
          {MODAL_CONTENTS.about.content}
        </MuseumModal>
      )}

      {activeModal === 'memorial' && (
        <MuseumModal
          isOpen={true}
          onClose={closeModal}
          title={MODAL_CONTENTS.memorial.title}
        >
          {MODAL_CONTENTS.memorial.content}
        </MuseumModal>
      )}

      <FormModal isOpen={isFormModalOpen} onClose={closeModal}>
        <IdeaForm onIdeaAdded={handleNewIdeaAdded} />
      </FormModal>

      {isVideoModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>🕯️ Homenagem a {selectedCandleIdea}</div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text2)',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
                onClick={() => setIsVideoModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
              <video
                width="100%"
                height="500"
                controls
                autoPlay
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <source src="/src/images/Firefly A memorial candle slowly burning in a luxury dark museum. The golden flame flickers naturall.mp4" type="video/mp4" />
                Seu navegador não suporta vídeo.
              </video>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}