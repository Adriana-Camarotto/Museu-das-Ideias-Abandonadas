import { useEffect, useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MuseumModal from './components/MuseumModal';
import { MODAL_CONTENTS } from './components/ModalContent';
import IdeaForm from './components/IdeaForm';
import FormModal from './components/FormModal';
import AuthScreen from './components/AuthScreen';
import MuseumAtmosphere from './components/MuseumAtmosphere';
import { seedIdeas } from './data/seedIdeas';
import { getRandomCuratorPhrase } from './data/curatorPhrases';
import { listIdeas, markIdeaDeadAgain, reviveIdea, subscribeToAlerts } from './services/ideaService';
import { authService } from './services/authService';
import { createCuratorNarration, narrateCuratorText, playMuseumCue } from './services/museumAudio';

const IDEA_LIFECYCLE_STORAGE_KEY = 'museum-idea-lifecycle-v1';
const IDEA_HONORS_STORAGE_KEY = 'museum-idea-honors-v1';
const DEFAULT_PREVENTIVE_DEATH_REASON = 'Tentativa de retorno bloqueada pela Curadoria por risco elevado de nova procrastinacao.';
const PREVENTIVE_DEATH_FEEDBACK = 'Pedido analisado. A Curadoria decidiu proteger seu foco e registrou uma nova morte preventiva.';

function readStoredIdeaLifecycle() {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(IDEA_LIFECYCLE_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function readStoredIdeaHonors() {
  if (typeof window === 'undefined') {
    return { counts: {}, honored: {} };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(IDEA_HONORS_STORAGE_KEY) || '{}');
    return {
      counts: parsed.counts || {},
      honored: parsed.honored || {},
    };
  } catch {
    return { counts: {}, honored: {} };
  }
}

const DEFAULT_IDEA_LIFECYCLE = {
  status: 'abandoned',
  revival_attempts: 0,
  last_revived_at: null,
  died_again_at: null,
  death_count: 0,
  last_death_reason: '',
};

function normalizeIdeaStatus(status) {
  if (status === 'reviving') {
    return 'dead_again';
  }

  if (status === 'dead_again' || status === 'abandoned') {
    return status;
  }

  return 'abandoned';
}

function getCategoryIcon(category = '') {
  const normalized = category.toLowerCase();

  if (normalized.includes('startup') || normalized.includes('empreendedor')) return '🚀';
  if (normalized.includes('curso') || normalized.includes('estudo')) return '📚';
  if (normalized.includes('fitness') || normalized.includes('academia')) return '💪';
  if (normalized.includes('livro') || normalized.includes('blog')) return '📖';
  if (normalized.includes('podcast')) return '🎙️';
  if (normalized.includes('app') || normalized.includes('saas')) return '💻';
  if (normalized.includes('jogo')) return '🎮';
  if (normalized.includes('e-commerce')) return '🛒';

  return '🕯️';
}

function adaptIdeaToCard(idea) {
  const createdAt = idea.created_at ? new Date(idea.created_at) : new Date();
  const year = Number.isNaN(createdAt.getFullYear()) ? new Date().getFullYear() : createdAt.getFullYear();
  const name = idea.nome || idea.name || 'Ideia sem placa';
  const category = idea.categoria || idea.category || 'Outros';
  const status = normalizeIdeaStatus(idea.status);
  const isSeed = Boolean(idea.is_seed || idea.isSeed);
  const isFallbackSeed = idea.source === 'fallback' || (isSeed && String(idea.id || '').startsWith('seed-'));
  const source = isFallbackSeed
    ? 'fallback'
    : idea.source || (isSeed ? 'curadoria' : 'usuario');

  return {
    ...idea,
    id: idea.id,
    source,
    isSeed,
    icon: idea.icon || getCategoryIcon(category),
    name,
    category,
    dates: idea.dates || `${year} - ${year}`,
    cause: idea.cause || idea.cause_of_death_summary || idea.motivo || 'Causa ainda sob analise da curadoria',
    status,
    revival_attempts: Number(idea.revival_attempts || 0),
    last_revived_at: idea.last_revived_at || null,
    died_again_at: idea.died_again_at || null,
    death_count: Number(idea.death_count || 0),
    last_death_reason: idea.last_death_reason || '',
  };
}

function sortMuseumCards(cards) {
  return [...cards].sort((a, b) => {
    const aCurator = a.source === 'curadoria' || a.source === 'fallback' || a.isSeed;
    const bCurator = b.source === 'curadoria' || b.source === 'fallback' || b.isSeed;

    if (aCurator !== bCurator) return aCurator ? 1 : -1;

    const aDate = new Date(a.created_at || 0).getTime();
    const bDate = new Date(b.created_at || 0).getTime();
    return bDate - aDate;
  });
}

function getOriginBadge(card) {
  if (card.source === 'fallback') return 'Acervo demonstrativo';
  if (card.source === 'curadoria' || card.isSeed) return 'Acervo da Curadoria';
  return 'Reliquia registrada';
}

export default function App() {
  const [authUser, setAuthUser] = useState(() => authService.getStoredUser());
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [activeModal, setActiveModal] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);
  const [museumViewMode, setMuseumViewMode] = useState('recentes');
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [activeMemTab, setActiveMemTab] = useState('Sobre');
  const [activeRankTab, setActiveRankTab] = useState('Geral');
  const [selectedMood, setSelectedMood] = useState(4);
  const [abandonReason, setAbandonReason] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [curatorPhrase] = useState(() => getRandomCuratorPhrase());
  const [notificationLog, setNotificationLog] = useState(() => [
    {
      id: 'welcome',
      icon: '\u{1F3DB}\uFE0F',
      title: 'O museu recebeu mais uma visita.',
      text: 'As vitrines fingiram naturalidade. A Curadoria nao.',
    },
    {
      id: 'curator-phrase',
      icon: '\u{1F4DC}',
      title: 'Bilhete da Curadoria',
      text: curatorPhrase.text,
    },
  ]);
  const [selectedCandleIdea, setSelectedCandleIdea] = useState('Loja de Velas Aromáticas');
  const [candleCount, setCandleCount] = useState({});
  const [memorialHonors, setMemorialHonors] = useState(() => readStoredIdeaHonors().counts);
  const [honoredIdeas, setHonoredIdeas] = useState(() => readStoredIdeaHonors().honored);
  const [realIdeaCards, setRealIdeaCards] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ideaLifecycle, setIdeaLifecycle] = useState(readStoredIdeaLifecycle);
  const [lifecycleModal, setLifecycleModal] = useState(null);
  const [activeLifecycleIdeaName, setActiveLifecycleIdeaName] = useState(null);
  const [newDeathReason, setNewDeathReason] = useState('');

  const mainRef = useRef(null);
  const museumSectionRef = useRef(null);
  const memorialSectionRef = useRef(null);
  const reliquiarySectionRef = useRef(null);
  const rankingSectionRef = useRef(null);
  const achievementSectionRef = useRef(null);
  const timelineSectionRef = useRef(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const syncedUser = await authService.syncSupabaseSession();
      if (!active) return;

      if (syncedUser) {
        setAuthUser(syncedUser);
        return;
      }

      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setAuthUser(storedUser);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(IDEA_LIFECYCLE_STORAGE_KEY, JSON.stringify(ideaLifecycle));
  }, [ideaLifecycle]);

  useEffect(() => {
    window.localStorage.setItem(IDEA_HONORS_STORAGE_KEY, JSON.stringify({
      counts: memorialHonors,
      honored: honoredIdeas,
    }));
  }, [memorialHonors, honoredIdeas]);

  useEffect(() => {
    if (!actionFeedback) return undefined;

    const timer = window.setTimeout(() => {
      setActionFeedback(null);
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [actionFeedback]);


  const filters = ['Todas', 'Empreendedorismo', 'Estudos', 'Fitness', 'Hobbies', 'Criativas', 'Organização', 'Outros'];
  useEffect(() => {
    if (!authUser) return undefined;

    let active = true;

    async function loadIdeas() {
      try {
        setIdeasLoading(true);
        setIdeasError(null);
        const response = await listIdeas({ status: 'active', limit: 100 });
        if (!active) return;

        const cards = sortMuseumCards((response.data || []).map(adaptIdeaToCard));
        setRealIdeaCards(cards);

        if (cards.length > 0) {
          setSelectedCandleIdea((current) => (
            cards.some((card) => card.name === current) ? current : cards[0].name
          ));
        }
      } catch (error) {
        if (active) {
          setIdeasError(error.message || 'Nao foi possivel carregar o acervo real.');
        }
      } finally {
        if (active) {
          setIdeasLoading(false);
        }
      }
    }

    loadIdeas();

    return () => {
      active = false;
    };
  }, [authUser]);

  const museumCards = realIdeaCards.length > 0
    ? realIdeaCards
    : seedIdeas.map(adaptIdeaToCard);

  const allFilters = Array.from(new Set([
    ...filters,
    ...museumCards
      .map((card) => card.category)
      .filter((category) => category && !filters.includes(category)),
  ]));

  const visibleMuseumCards = museumCards.filter((card) => {
    const matchesFilter = activeFilter === 'Todas' || card.category === activeFilter;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || [card.name, card.category, card.cause]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  const displayedMuseumCards = museumViewMode === 'recentes'
    ? visibleMuseumCards.slice(0, 4)
    : visibleMuseumCards;

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
      'inicio': () => {
        setMuseumViewMode('recentes');
        mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        mainRef.current?.parentElement?.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      'museu': () => scrollToElement(museumSectionRef),
      'memorial': () => {
        setActiveMemTab('Sobre');
        scrollToElement(memorialSectionRef);
      },
      'reliquias': () => scrollToElement(reliquiarySectionRef),
      'ranking': () => scrollToElement(rankingSectionRef),
      'conquistas': () => scrollToElement(achievementSectionRef),
      'timeline': () => scrollToElement(timelineSectionRef),
      'comunidade': () => setActiveModal('community'),
      'sobre': () => setActiveModal('about')
    };

    sectionMap[section]?.();
  };

  const scrollToMuseumCollection = () => {
    museumSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnterMuseum = () => {
    setActiveModal(null);
    setMuseumViewMode('recentes');
    scrollToMuseumCollection();
    announceCuratorAction('A Curadoria abriu os portoes principais. Recentes primeiro, como manda o protocolo dramatico.');
  };

  const handleOpenGuidedVisit = () => {
    setActiveModal('guided-tour');
    announceCuratorAction('A Curadoria separou um roteiro curto. Prometeu solenidade, mas trouxe ironia no bolso.');
  };

  const handleStartGuidedVisit = () => {
    setActiveModal(null);
    setMuseumViewMode('recentes');
    scrollToMuseumCollection();
    announceCuratorAction('Visita guiada iniciada. Por favor, nao toque nas reliquias nem nas promessas antigas.');
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const credentials = {
        email: authEmail.trim(),
        password: authPassword,
      };

      if (authMode === 'signup' && authName.trim()) {
        credentials.name = authName.trim();
      }

      const session = authMode === 'signup'
        ? await authService.signup(credentials)
        : await authService.login(credentials);

      const user = session?.user || authService.getStoredUser();
      if (session?.token && user) {
        authService.setToken(session.token);
        authService.setUser(user);
        setAuthUser(user);
        return;
      }

      if (user) {
        setAuthUser(user);
        return;
      }

      if (session?.needsEmailConfirmation) {
        setAuthError('Credencial criada. Verifique seu e-mail para concluir o acesso.');
        return;
      }

      throw new Error('Os portões recusaram sua entrada. Verifique os dados e tente novamente.');
    } catch (error) {
      setAuthError(error.message || 'Os portões recusaram sua entrada. Verifique os dados e tente novamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await authService.loginWithGoogle();
    } catch (error) {
      setAuthError(error.message || 'Nao foi possivel iniciar o login com Google.');
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setAuthUser(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthMode('login');
  };

  const closeModal = () => {
    setActiveModal(null);
    setIsFormModalOpen(false);
  };

  const closeLifecycleModal = () => {
    setLifecycleModal(null);
    setActiveLifecycleIdeaName(null);
    setNewDeathReason('');
  };

  const handleLightCandle = () => {
    setCandleCount(prev => ({
      ...prev,
      [selectedCandleIdea]: (prev[selectedCandleIdea] || 0) + 1
    }));
    playMuseumCue('honor');
    setIsVideoModalOpen(true);
  };

  const selectedIdea = museumCards.find(card => card.name === selectedCandleIdea) || museumCards[0];
  const selectedIdeaIndex = museumCards.findIndex((card) => card.name === selectedIdea.name);
  const hasMultipleIdeas = museumCards.length > 1;
  const selectedIdeaHonorCount = Number(memorialHonors[selectedIdea.name] || 0);
  const selectedIdeaHonored = Boolean(honoredIdeas[selectedIdea.name]);

  const getRelicsForIdea = (idea) => {
    const category = String(idea?.category || '').toLowerCase();
    const name = idea?.name || 'esta ideia';

    if (category.includes('curso') || category.includes('estudo')) {
      return [
        { icon: '\u{1F4DC}', name: 'Certificado incompleto', description: `Emitido em nome de ${name}, sem modulo final localizado.` },
        { icon: '\u{1F4D6}', name: 'Apostila fechada no capitulo 2', description: 'As paginas seguintes seguem em excelente estado, infelizmente.' },
        { icon: '\u{1F516}', name: 'Marcador parado', description: 'Encontrado exatamente onde o entusiasmo pediu intervalo.' },
        { icon: '\u{270F}\uFE0F', name: 'Caderno de primeira pagina', description: 'A caligrafia inicial era forte. A continuidade, nem tanto.' },
      ];
    }

    if (category.includes('fitness') || category.includes('academia')) {
      return [
        { icon: '\u{1F3CB}\uFE0F', name: 'Halter esquecido', description: `Associado a ${name}, com poeira de janeiro preservada.` },
        { icon: '\u{1F45F}', name: 'Tenis empoeirado', description: 'Prometeu voltar segunda-feira e nunca protocolou presenca.' },
        { icon: '\u{1F6B0}', name: 'Garrafa vazia', description: 'Hidratacao planejada, execucao pendente.' },
        { icon: '\u{1F9FA}', name: 'Toalha dobrada desde janeiro', description: 'Objeto raro: disciplina em estado decorativo.' },
      ];
    }

    if (category.includes('livro') || category.includes('criativ') || category.includes('blog')) {
      return [
        { icon: '\u{1F4D3}', name: 'Manuscrito inacabado', description: `Primeiro ato de ${name}; segundo ato ainda em neblina.` },
        { icon: '\u{2328}\uFE0F', name: 'Maquina de escrever em repouso', description: 'Dramatica, bonita e absolutamente sem prazo.' },
        { icon: '\u{1F4C4}', name: 'Pagina rasgada', description: 'Versao final agora vai, revisao emocional numero seis.' },
        { icon: '\u{1F58B}\uFE0F', name: 'Caneta com tinta de intencao', description: 'Escreveu o titulo. Considerou isso um marco.' },
      ];
    }

    return [
      { icon: '\u{1F4BD}', name: 'Dominio comprado e esquecido', description: `Registro vinculado a ${name}, renovado por culpa e debito automatico.` },
      { icon: '\u{1F4CB}', name: 'Pitch deck empoeirado', description: 'Doze slides, tres fontes e nenhuma validacao conclusiva.' },
      { icon: '\u{1F4CC}', name: 'Post-it amassado', description: 'Continha a frase mercado enorme, escrita com perigosa confianca.' },
      { icon: '\u{2615}', name: 'Caneca fria', description: 'Ultima testemunha da reuniao em que tudo parecia possivel.' },
    ];
  };

  const selectedIdeaRelics = getRelicsForIdea(selectedIdea);
  const timelineSteps = [
    { icon: '\u{2615}', day: 'Marco 1', text: 'Ideia nasceu durante um cafe e uma confianca dificil de auditar.' },
    { icon: '\u{1F3F7}\uFE0F', day: 'Marco 2', text: 'Nome escolhido com otimismo perigoso e baixa consulta a realidade.' },
    { icon: '\u{1F50E}', day: 'Marco 3', text: 'Primeira pesquisa feita. Foram abertas abas suficientes para parecer trabalho.' },
    { icon: '\u{1F4CB}', day: 'Marco 4', text: 'O planejamento ficou bonito demais para ser interrompido por execucao.' },
    { icon: '\u{1F570}\uFE0F', day: 'Marco 5', text: 'Silencio operacional detectado pela Curadoria.' },
    { icon: '\u{1F3DB}\uFE0F', day: 'Marco 6', text: 'Ideia entrou no acervo com dignidade, poeira e uma etiqueta provisoria.' },
  ];

  const getLifecycleRecord = (ideaName) => {
    const card = museumCards.find((idea) => idea.name === ideaName);

    if (card?.id && card?.source === 'usuario') {
      return {
        ...DEFAULT_IDEA_LIFECYCLE,
        status: card.status,
        revival_attempts: card.revival_attempts,
        last_revived_at: card.last_revived_at,
        died_again_at: card.died_again_at,
        death_count: card.death_count,
        last_death_reason: card.last_death_reason,
      };
    }

    const seedLifecycle = card?.isSeed
      ? {
          status: card.status,
          revival_attempts: card.revival_attempts,
          last_revived_at: card.last_revived_at,
          died_again_at: card.died_again_at,
          death_count: card.death_count,
          last_death_reason: card.last_death_reason,
        }
      : {};

    const record = {
      ...DEFAULT_IDEA_LIFECYCLE,
      ...seedLifecycle,
      ...(ideaLifecycle[ideaName] || {}),
    };

    return {
      ...record,
      status: normalizeIdeaStatus(record.status),
    };
  };

  const getLifecycleCopy = (status) => {
    if (status === 'reviving') {
      return {
        badge: 'Em observacao',
        note: 'A ideia saiu temporariamente da ala dos abandonados. A curadoria observa com cautela.',
        button: 'Declarar Obito Novamente',
      };
    }

    if (status === 'dead_again') {
      return {
        badge: 'Morreu novamente',
        note: 'Tentativa registrada. Sobrevivencia nao autorizada pela Curadoria.',
        button: 'Tentar Insistir de Novo',
      };
    }

    return {
      badge: 'Abandonada',
      note: 'A curadoria informa que esta ideia ja conhece o caminho de volta para o museu.',
      button: 'Realizar Nova Tentativa',
    };
  };

  const openLifecycleModal = (card, event) => {
    event.stopPropagation();
    const { status } = getLifecycleRecord(card.name);
    setActiveLifecycleIdeaName(card.name);
    setLifecycleModal(status === 'reviving' ? 'death' : 'revive');
    setNewDeathReason('');
    playMuseumCue(status === 'reviving' ? 'modal' : 'revive');
  };

  const updateRealIdeaCard = (updatedIdea) => {
    const adapted = adaptIdeaToCard(updatedIdea);
    setRealIdeaCards((current) => (
      current.map((card) => (card.id === adapted.id ? adapted : card))
    ));
    setSelectedCandleIdea(adapted.name);
  };

  const handleIdeaAdded = (idea) => {
    const adapted = adaptIdeaToCard(idea);
    setRealIdeaCards((current) => {
      const withoutDuplicate = current.filter((card) => card.id !== adapted.id);
      return [adapted, ...withoutDuplicate];
    });
    setSelectedCandleIdea(adapted.name);
    setIsFormModalOpen(false);
    museumSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const confirmRevivalAttempt = async () => {
    const ideaName = activeLifecycleIdeaName;
    if (!ideaName) return;
    const now = new Date().toISOString();

    if (activeLifecycleIdea?.id && activeLifecycleIdea?.source === 'usuario') {
      await reviveIdea(activeLifecycleIdea.id);
      const updatedIdea = await markIdeaDeadAgain(activeLifecycleIdea.id, DEFAULT_PREVENTIVE_DEATH_REASON);
      updateRealIdeaCard({
        ...updatedIdea,
        status: 'dead_again',
        last_death_reason: updatedIdea.last_death_reason || DEFAULT_PREVENTIVE_DEATH_REASON,
      });
      playMuseumCue('honor');
      announceCuratorAction(PREVENTIVE_DEATH_FEEDBACK);
      closeLifecycleModal();
      return;
    }

    setIdeaLifecycle((current) => {
      const previous = { ...DEFAULT_IDEA_LIFECYCLE, ...(current[ideaName] || {}) };

      return {
        ...current,
        [ideaName]: {
          ...previous,
          status: 'dead_again',
          revival_attempts: previous.revival_attempts + 1,
          death_count: previous.death_count + 1,
          last_revived_at: now,
          died_again_at: now,
          last_death_reason: DEFAULT_PREVENTIVE_DEATH_REASON,
        },
      };
    });

    playMuseumCue('honor');
    announceCuratorAction(PREVENTIVE_DEATH_FEEDBACK);
    closeLifecycleModal();
  };

  const confirmDeathAgain = async () => {
    const ideaName = activeLifecycleIdeaName;
    if (!ideaName) return;
    const reason = newDeathReason.trim() || DEFAULT_PREVENTIVE_DEATH_REASON;

    if (activeLifecycleIdea?.id && activeLifecycleIdea?.source === 'usuario') {
      const updatedIdea = await markIdeaDeadAgain(activeLifecycleIdea.id, reason);
      updateRealIdeaCard(updatedIdea);
      playMuseumCue('honor');
      closeLifecycleModal();
      return;
    }

    setIdeaLifecycle((current) => {
      const previous = { ...DEFAULT_IDEA_LIFECYCLE, ...(current[ideaName] || {}) };

      return {
        ...current,
        [ideaName]: {
          ...previous,
          status: 'dead_again',
          death_count: previous.death_count + 1,
          died_again_at: new Date().toISOString(),
          last_death_reason: reason,
        },
      };
    });

    playMuseumCue('honor');
    closeLifecycleModal();
  };

  const activeLifecycleIdea = museumCards.find(card => card.name === activeLifecycleIdeaName);
  const activeLifecycleRecord = activeLifecycleIdeaName
    ? getLifecycleRecord(activeLifecycleIdeaName)
    : DEFAULT_IDEA_LIFECYCLE;
  const selectedLifecycleRecord = getLifecycleRecord(selectedIdea.name);
  const selectedLifecycleCopy = getLifecycleCopy(selectedLifecycleRecord.status);

  const getSurvivalPercentage = (card) => {
    const value = Number(
      card.survival_percentage ??
      card.survivalPercentage ??
      card.analysis?.survival_percentage ??
      card.analysis?.survivalPercentage ??
      13
    );

    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 13;
  };

  const rankingCards = [...museumCards]
    .map((card) => ({
      ...card,
      survivalPercentage: getSurvivalPercentage(card),
    }))
    .sort((a, b) => a.survivalPercentage - b.survivalPercentage);

  const countByField = (fieldName) => (
    Object.values(museumCards.reduce((acc, card) => {
      const rawValue = String(card[fieldName] || 'Sem registro').trim() || 'Sem registro';
      const key = rawValue.length > 54 ? `${rawValue.slice(0, 51)}...` : rawValue;
      acc[key] = acc[key] || { name: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  );

  const generalRankingItems = rankingCards.slice(0, 5).map((card, index) => ({
    icon: index === 0 ? '\u{1F451}' : card.icon,
    name: card.name,
    count: `${card.survivalPercentage}% de sobrevivencia - ${card.category}`,
  }));

  const categoryRankingItems = countByField('category').map((item) => ({
    icon: '\u{1F3F7}\uFE0F',
    name: item.name,
    count: `${item.count} reliquia${item.count === 1 ? '' : 's'} nesta ala`,
  }));

  const causeRankingItems = countByField('cause').map((item) => ({
    icon: '\u{1F50E}',
    name: item.name,
    count: `${item.count} caso${item.count === 1 ? '' : 's'} com esta causa`,
  }));

  const displayedRankingItems = activeRankTab === 'Por categoria'
    ? categoryRankingItems
    : activeRankTab === 'Por causa da morte'
      ? causeRankingItems
      : generalRankingItems;

  const totalCandlesLit = Object.values(candleCount).reduce((sum, count) => sum + Number(count || 0), 0);
  const hasUserIdea = museumCards.some((card) => card.source === 'usuario');
  const hasRevivalAttempt = museumCards.some((card) => getLifecycleRecord(card.name).revival_attempts > 0);
  const hasDeadAgain = museumCards.some((card) => {
    const record = getLifecycleRecord(card.name);
    return record.status === 'dead_again' || record.death_count > 1;
  });
  const mostFragileIdea = rankingCards[0];
  const mostHopefulIdea = rankingCards[rankingCards.length - 1];

  const achievementItems = [
    {
      icon: '\u{1F3DB}\uFE0F',
      name: 'Primeira Reliquia Registrada',
      description: hasUserIdea
        ? 'Uma reliquia sua ja recebeu placa no acervo.'
        : 'A Curadoria ainda aguarda sua primeira doacao tragicamente promissora.',
      unlocked: hasUserIdea,
    },
    {
      icon: '\u{1F56F}\uFE0F',
      name: 'Primeira Homenagem Prestada',
      description: totalCandlesLit > 0
        ? `${totalCandlesLit} vela${totalCandlesLit === 1 ? '' : 's'} acesa${totalCandlesLit === 1 ? '' : 's'} em memoria do potencial interrompido.`
        : 'Nenhuma vela acesa ainda. As reliquias fingem que nao se importam.',
      unlocked: totalCandlesLit > 0,
    },
    {
      icon: '\u{1F52E}',
      name: 'Primeira Tentativa de Ressurreicao',
      description: hasRevivalAttempt
        ? 'Uma ideia deixou a ala dos abandonados sob observacao cautelosa.'
        : 'Nenhuma ressurreicao registrada. Por enquanto, repouso administrativo.',
      unlocked: hasRevivalAttempt,
    },
    {
      icon: '\u{1F494}',
      name: 'Ideia Morreu Novamente',
      description: hasDeadAgain
        ? 'O retorno ao acervo foi documentado com a serenidade que o caso permite.'
        : 'Ainda nao houve segunda morte. A Curadoria chama isso de progresso provisorio.',
      unlocked: hasDeadAgain,
    },
    {
      icon: '\u{1F3C6}',
      name: 'Curadoria Impressionada, Mas Com Ressalvas',
      description: mostHopefulIdea
        ? `${mostHopefulIdea.name} sobreviveu estatisticamente a ${mostHopefulIdea.survivalPercentage}% do pessimismo oficial.`
        : 'Sem dados suficientes para elogios comedidos.',
      unlocked: Boolean(mostHopefulIdea),
    },
    {
      icon: '\u{1F4C9}',
      name: 'Otimismo Estatisticamente Comprometido',
      description: mostFragileIdea
        ? `${mostFragileIdea.name} lidera a ala da fragilidade com ${mostFragileIdea.survivalPercentage}% de sobrevivencia.`
        : 'A Curadoria ainda procura uma estatistica digna de moldura.',
      unlocked: Boolean(mostFragileIdea),
    },
  ];

  const getExhibitScene = (card) => {
    if (card.name.includes('Startup')) return 'startup-desk';
    if (card.name.includes('Curso')) return 'course-desk';
    if (card.name.includes('Fitness')) return 'fitness-relic';
    if (card.name.includes('Podcast')) return 'podcast-booth';
    if (card.name.includes('Canal')) return 'content-studio';
    if (card.name.includes('Aquarela')) return 'book-table';
    return 'candle-shop';
  };

  const getCuratorNote = (card) => {
    if (card.name.includes('Startup')) return 'Os registros indicam que o projeto morreu logo apos a criacao do logo.';
    if (card.name.includes('Curso')) return 'Detectamos um caso de entusiasmo agudo seguido de fadiga gramatical.';
    if (card.name.includes('Fitness')) return 'A disciplina resistiu bravamente ate encontrar vida social com carboidrato.';
    if (card.name.includes('Podcast')) return 'Apos extensa investigacao, concluimos que o microfone ouviu mais do que o publico.';
    if (card.name.includes('Canal')) return 'A Curadoria encontrou um roteiro, tres thumbnails e nenhum segundo episodio.';
    if (card.name.includes('Aquarela')) return 'As evidencias mostram pigmentos, papel caro e uma serenidade que durou pouco.';
    return 'Mais uma promessa preservada desde o primeiro agora vai.';
  };

  const handleShareMemorial = () => {
    const narration = createCuratorNarration({
      ...selectedIdea,
      category: selectedIdea.name.includes('Startup') ? 'Startup' : selectedIdea.name.includes('Fitness') ? 'Fitness' : undefined
    });
    playMuseumCue('share');
    narrateCuratorText(narration);
  };

  const announceCuratorAction = (message, type = 'info') => {
    setActionFeedback({
      id: Date.now(),
      type,
      message,
    });
    setNotificationsSeen(false);
    setNotificationLog((current) => [
      {
        id: `notice-${Date.now()}`,
        icon: type === 'error' ? '\u{26A0}\uFE0F' : '\u{1F56F}\uFE0F',
        title: 'Chamado da Curadoria',
        text: message,
      },
      ...current,
    ].slice(0, 6));
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((current) => {
      const next = !current;
      if (next) {
        setNotificationsSeen(true);
      }
      return next;
    });
  };

  const handleMemorialHonor = () => {
    if (!selectedIdea?.name) return;

    if (selectedIdeaHonored) {
      announceCuratorAction('Homenagem ja registrada nesta visita. A Curadoria aprecia consistencia, mas controla o protocolo.');
      return;
    }

    setMemorialHonors((current) => ({
      ...current,
      [selectedIdea.name]: Number(current[selectedIdea.name] || 0) + 1,
    }));
    setHonoredIdeas((current) => ({
      ...current,
      [selectedIdea.name]: true,
    }));
    playMuseumCue('honor');
    announceCuratorAction('Homenagem registrada. A ideia recebeu mais um sopro de validacao tardia.');
  };

  const selectAdjacentIdea = (direction) => {
    if (!hasMultipleIdeas) return;

    const nextIndex = (selectedIdeaIndex + direction + museumCards.length) % museumCards.length;
    const nextIdea = museumCards[nextIndex];
    setSelectedCandleIdea(nextIdea.name);
    announceCuratorAction(`A Curadoria deslocou a moldura para ${nextIdea.name}.`);
  };

  const openCollectionExpansion = ({ modal, tab, ref, message }) => {
    if (modal === 'relics') {
      setActiveFilter('Todas');
      setSearchTerm('');
      setMuseumViewMode('todas');
      museumSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setActiveMemTab(tab);
    setActiveModal(modal);
    if (modal !== 'relics') {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    announceCuratorAction(message);
  };

  const handleViewAllRelics = (event) => {
    event?.stopPropagation();
    setActiveFilter('Todas');
    setSearchTerm('');
    setMuseumViewMode('todas');
    setActiveModal('relics');
    museumSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    announceCuratorAction('A Curadoria limpou filtros, poeira e suspeitas. Todas as reliquias voltaram para a vitrine.');
  };

  const handleViewFullRanking = (event) => {
    event?.stopPropagation();
    setActiveModal('ranking');
    rankingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    announceCuratorAction('O ranking completo foi retirado do cofre. A gloria e questionavel, mas esta catalogada.');
  };

  const handleViewAllAchievements = (event) => {
    event?.stopPropagation();
    setActiveModal('achievements');
    achievementSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    announceCuratorAction('Todas as conquistas foram expostas. Algumas merecem aplausos, outras silencio respeitoso.');
  };

  const handleBottomGridClick = (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const label = button.textContent.toLowerCase();

    if (label.includes('ranking completo')) {
      openCollectionExpansion({
        modal: 'ranking',
        tab: 'EstatÃ­sticas',
        ref: rankingSectionRef,
        message: 'O ranking completo foi retirado do cofre. A gloria e questionavel, mas esta catalogada.',
      });
      return;
    }

    if (label.includes('conquistas')) {
      openCollectionExpansion({
        modal: 'achievements',
        tab: 'Conquistas',
        ref: achievementSectionRef,
        message: 'Todas as conquistas foram expostas. Algumas merecem aplausos, outras silencio respeitoso.',
      });
      return;
    }

    if (label.includes('rel')) {
      openCollectionExpansion({
        modal: 'relics',
        tab: 'RelÃ­quias',
        ref: reliquiarySectionRef,
        message: 'A Curadoria abriu a reserva tecnica das reliquias. Cuidado com os PDFs ritualisticos.',
      });
    }
  };

  const getNewsletterErrorMessage = (error) => {
    const message = String(error?.message || '').toLowerCase();

    if (
      message.includes('smtp') ||
      message.includes('e-mail') ||
      message.includes('email') ||
      message.includes('servidor')
    ) {
      return 'A Curadoria tentou enviar o aviso, mas o setor postal do museu ainda nao foi configurado.';
    }

    return 'Os alertas estao temporariamente em manutencao no acervo. A reliquia foi preservada, mas o mensageiro ainda nao recebeu credenciais.';
  };

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
      const result = await subscribeToAlerts(email);
      setNewsletterFeedback({
        type: 'success',
        message: result?.devMode
          ? 'A Curadoria registrou sua assinatura. Em ambiente local, o setor postal do museu ainda esta em ensaio geral.'
          : result?.message || 'E-mail de confirmacao enviado. Verifique sua caixa de entrada.'
      });
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterFeedback({
        type: 'error',
        message: getNewsletterErrorMessage(error)
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (!authUser) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authName={authName}
        setAuthName={setAuthName}
        authLoading={authLoading}
        authError={authError}
        onSubmit={handleAuthSubmit}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  return (
    <div>
      <Sidebar onNavigate={handleNavigate} />

      <main className="main" ref={mainRef}>
        <MuseumAtmosphere variant="page" />
        <header className="topbar">
          <div className="topbar-left">
            Museu das Ideias Abandonadas · Acervo vivo desde 2019
          </div>
          <div className="topbar-right">
            <button className="notif-btn" type="button" aria-label="Notificacoes" onClick={toggleNotifications}>
              <span aria-hidden="true">{'\u{1F514}'}</span>
              {!notificationsSeen && <div className="notif-dot"></div>}
            </button>
            {isNotificationsOpen && (
              <>
                <button
                  className="notifications-scrim"
                  type="button"
                  aria-label="Fechar chamados da Curadoria"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="notifications-panel">
                  <div className="notifications-header">
                    <div className="notifications-title">Chamados da Curadoria</div>
                    <button
                      className="notifications-close"
                      type="button"
                      aria-label="Fechar notificacoes"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      {'\u{2715}'}
                    </button>
                  </div>
                  {notificationLog.length > 0 ? (
                    <div className="notifications-list">
                      {notificationLog.map((notification) => (
                        <div className="notification-item" key={notification.id}>
                          <div className="notification-icon" aria-hidden="true">{notification.icon}</div>
                          <div>
                            <strong>{notification.title}</strong>
                            <span>{notification.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="notifications-empty">
                      Nenhum chamado da Curadoria no momento. Aproveite o silencio institucional.
                    </div>
                  )}
                </div>
              </>
            )}
            <button className="btn-outline" type="button" onClick={handleLogout} style={{ padding: '8px 12px' }}>
              Sair
            </button>
          </div>
        </header>

        {actionFeedback && (
          <div className={`curator-action-feedback curator-action-feedback--${actionFeedback.type}`}>
            {actionFeedback.message}
          </div>
        )}

        <section className="hero">
          <div className="hero-statue">🗿</div>
          <div className="hero-inner">
            <div className="hero-tag">Bem-vindo ao</div>
            <h1>Museu das Ideias Abandonadas</h1>
            <p>
              Preservamos sonhos interrompidos, planos mirabolantes e projetos que não viraram realidade.
            </p>
            <div className="hero-btns">
              <button className="btn-primary" type="button" onClick={handleEnterMuseum}>Entrar no Museu ✦</button>
              <button className="btn-outline" type="button" onClick={handleOpenGuidedVisit}>🎫 Fazer visita guiada</button>
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
            <div className="sec-header" id="dentro-do-museu" ref={museumSectionRef}>
              <div>
                <div className="sec-title">Dentro do museu</div>
                <div className="sec-sub">Explore as alas do nosso acervo de sonhos não realizados.</div>
              </div>
            </div>

            <div className="museum-view-tabs" aria-label="Modo de exibicao do acervo">
              <button
                className={`museum-view-tab ${museumViewMode === 'recentes' ? 'active' : ''}`}
                type="button"
                onClick={() => setMuseumViewMode('recentes')}
              >
                Recentes
              </button>
              <button
                className={`museum-view-tab ${museumViewMode === 'todas' ? 'active' : ''}`}
                type="button"
                onClick={() => setMuseumViewMode('todas')}
              >
                Todas
              </button>
              <span>A Curadoria exibe primeiro os casos mais recentes. Os demais seguem arquivados, mas nao esquecidos.</span>
            </div>

            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar uma ideia..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            {ideasLoading && (
              <div className="ideas-state">A curadoria esta abrindo os arquivos reais...</div>
            )}

            {ideasError && (
              <div className="ideas-state ideas-state--error">{ideasError}</div>
            )}

            <div className="filters">
              {allFilters.map((filter) => (
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
              {displayedMuseumCards.map((card) => {
                const lifecycleRecord = getLifecycleRecord(card.name);
                const lifecycleCopy = getLifecycleCopy(lifecycleRecord.status);

                return (
                <div className={`idea-card idea-card--${lifecycleRecord.status}`} key={card.id || card.name} style={{ position: 'relative', cursor: 'pointer' }} onMouseEnter={() => playMuseumCue('hover')} onClick={() => { setSelectedCandleIdea(card.name); memorialSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                  {candleCount[card.name] > 0 && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                      {candleCount[card.name] > 1 && (
                        <div style={{ background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '-8px' }}>
                          {candleCount[card.name]}
                        </div>
                      )}
                      <div style={{ fontSize: '20px', filter: 'drop-shadow(0 0 4px rgba(255, 100, 100, 0.6))' }}>🕯️</div>
                    </div>
                  )}
                  <div className={`idea-status-badge idea-status-badge--${lifecycleRecord.status}`}>
                    {lifecycleCopy.badge}
                  </div>
                  <div className={`idea-origin-badge idea-origin-badge--${card.source}`}>
                    {getOriginBadge(card)}
                  </div>
                  <div
                    className={`idea-thumb exhibit-scene exhibit-scene--${getExhibitScene(card)}`}
                    style={{
                      background:
                        card.name === 'Loja de Velas Aromáticas'
                          ? 'linear-gradient(135deg, #2a1a1a, #3d2020)'
                          : card.name === 'Canal de Produtividade'
                            ? 'linear-gradient(135deg, #1a2a1a, #203520)'
                            : card.name === 'Curso de Alemão B1'
                              ? 'linear-gradient(135deg, #1a1a2a, #202040)'
                              : card.name === 'Projeto Fitness'
                                ? 'linear-gradient(135deg, #201a2a, #30203d)'
                                : card.name === 'Podcast sobre Mindset'
                                  ? 'linear-gradient(135deg, #1a2028, #20283d)'
                                  : card.name === 'Aprender Aquarela'
                                    ? 'linear-gradient(135deg, #28201a, #3d3020)'
                                    : 'linear-gradient(135deg, #1e1a30, #282048)'
                    }}
                  >
                    <div className="exhibit-stage" aria-hidden="true">
                      <span className="exhibit-object exhibit-object--one" />
                      <span className="exhibit-object exhibit-object--two" />
                      <span className="exhibit-object exhibit-object--three" />
                      <span className="exhibit-object exhibit-object--four" />
                    </div>
                    <div className="idea-rip">🪦 RIP</div>
                  </div>
                  <div className="idea-body">
                    <div className="idea-name">{card.name}</div>
                    <div className="idea-dates">{card.dates}</div>
                    <div className="idea-cause">
                      <strong>Causa da morte:</strong> {card.cause}
                    </div>
                    <div className="curator-note">{getCuratorNote(card)}</div>
                    <div className="idea-lifecycle-note">{lifecycleCopy.note}</div>
                    <button
                      className={`idea-lifecycle-btn idea-lifecycle-btn--${lifecycleRecord.status}`}
                      type="button"
                      onClick={(event) => openLifecycleModal(card, event)}
                    >
                      {lifecycleCopy.button}
                    </button>
                  </div>
                </div>
                );
              })}

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
                  <div className="curator-q">"{curatorPhrase.text}"</div>
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
              {candleCount[selectedCandleIdea] > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(224, 96, 96, 0.2)', padding: '6px 12px', borderRadius: '20px' }}>
                  <div style={{ fontSize: '16px' }}>🕯️</div>
                  {candleCount[selectedCandleIdea] > 1 && (
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--danger)' }}>{candleCount[selectedCandleIdea]}</div>
                  )}
                </div>
              )}
            </div>
            <div className="memorial-controls">
              <button
                type="button"
                className="memorial-nav-btn"
                onClick={() => selectAdjacentIdea(-1)}
                disabled={!hasMultipleIdeas}
                aria-label="Reliquia anterior"
              >
                {'\u{25C0}'}
              </button>
              <button
                type="button"
                className="memorial-nav-btn"
                onClick={() => selectAdjacentIdea(1)}
                disabled={!hasMultipleIdeas}
                aria-label="Proxima reliquia"
              >
                {'\u{25B6}'}
              </button>
              <button
                type="button"
                className={`memorial-heart-btn ${selectedIdeaHonored ? 'memorial-heart-btn--honored' : ''}`}
                onClick={handleMemorialHonor}
                aria-label="Prestar homenagem"
              >
                {'\u{1F494}'}
                {selectedIdeaHonorCount > 0 && <span>{selectedIdeaHonorCount}</span>}
              </button>
            </div>
          </div>

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
                <div className="memorial-name">{selectedIdea.name}</div>
                <div className="memorial-dates">{selectedIdea.dates}</div>
                <div className="memorial-cause-label">Causa da morte</div>
                <div className="memorial-cause-val">{selectedIdea.cause}</div>
                <div className={`memorial-lifecycle-panel memorial-lifecycle-panel--${selectedLifecycleRecord.status}`}>
                  <div>
                    <div className="memorial-lifecycle-status">{selectedLifecycleCopy.badge}</div>
                    <div className="memorial-lifecycle-copy">{selectedLifecycleCopy.note}</div>
                    {(selectedLifecycleRecord.revival_attempts > 0 || selectedLifecycleRecord.death_count > 0) && (
                      <div className="memorial-lifecycle-meta">
                        Tentativas: {selectedLifecycleRecord.revival_attempts} - retornos ao acervo: {selectedLifecycleRecord.death_count}
                      </div>
                    )}
                  </div>
                  <button
                    className={`idea-lifecycle-btn idea-lifecycle-btn--${selectedLifecycleRecord.status}`}
                    type="button"
                    onClick={(event) => openLifecycleModal(selectedIdea, event)}
                  >
                    {selectedLifecycleCopy.button}
                  </button>
                </div>
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
                <div className="mem-col-title">Biografia</div>
                <div className="mem-item">Nasceu de um surto de criatividade numa madrugada de domingo. Teve um início promissor, nome, logo, moodboard e até público-alvo imaginário.</div>
              </div>
              <div>
                <div className="mem-col-title">Expectativa</div>
                <div className="mem-item">💸 Independência financeira</div>
                <div className="mem-item" style={{ marginTop: '4px' }}>🏷️ Marca autoral</div>
                <div className="mem-item" style={{ marginTop: '4px' }}>🌿 Vida tranquila no campo</div>
              </div>
              <div>
                <div className="mem-col-title">Realidade</div>
                <div className="mem-item bad">✘ 0 vendas</div>
                <div className="mem-item bad" style={{ marginTop: '4px' }}>✘ 14 abas abertas</div>
                <div className="mem-item bad" style={{ marginTop: '4px' }}>✘ 3 carrinhos abandonados</div>
              </div>
            </div>
        </div>

        <div className="bottom-grid" onClick={handleBottomGridClick}>
          <section className="bottom-sec" ref={timelineSectionRef} style={{ background: activeMemTab === 'Linha do Tempo' ? 'var(--bg3)' : 'transparent', padding: activeMemTab === 'Linha do Tempo' ? '12px' : '20px', margin: activeMemTab === 'Linha do Tempo' ? '8px' : '0', borderRadius: activeMemTab === 'Linha do Tempo' ? 'var(--radius-sm)' : '0', boxShadow: activeMemTab === 'Linha do Tempo' ? '0 0 20px rgba(155, 127, 244, 0.6), 0 0 40px rgba(155, 127, 244, 0.3)' : 'none', transition: 'all 0.2s' }}>
            <div className="sec-header">
              <div className="sec-title" style={{ fontSize: '14px' }}>Linha do tempo</div>
            </div>
            <div className="timeline timeline--trail">
              {timelineSteps.map((step, index) => (
                <div className="tl-item tl-item--trail" key={step.day}>
                  <div className={`tl-dot ${index === timelineSteps.length - 1 ? 'rip' : ''}`}>{step.icon}</div>
                  <div>
                    <div className="tl-day">{step.day}</div>
                    <div className="tl-text">{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bottom-sec" ref={reliquiarySectionRef} style={{ background: activeMemTab === 'Relíquias' ? 'var(--bg3)' : 'transparent', padding: activeMemTab === 'Relíquias' ? '12px' : '20px', margin: activeMemTab === 'Relíquias' ? '8px' : '0', borderRadius: activeMemTab === 'Relíquias' ? 'var(--radius-sm)' : '0', boxShadow: activeMemTab === 'Relíquias' ? '0 0 20px rgba(155, 127, 244, 0.6), 0 0 40px rgba(155, 127, 244, 0.3)' : 'none', transition: 'all 0.2s' }}>
            <div className="sec-header">
              <div className="sec-title" style={{ fontSize: '14px' }}>Relíquias encontradas</div>
            </div>
            <div className="relics-grid relics-grid--found">
              {selectedIdeaRelics.slice(0, 4).map((relic, index) => (
                <div className="relic-item relic-item--found" key={relic.name}>
                  <div className="relic-icon">{relic.icon}</div>
                  <div>
                    <div className="relic-evidence">Evidencia {index + 1}</div>
                    <div className="relic-name">{relic.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-outline" type="button" onClick={handleViewAllRelics} style={{ width: '100%', marginTop: '12px', fontSize: '12px' }}>Ver todas as relíquias</button>
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
            {displayedRankingItems.map((item, index) => (
              <div className="rank-item" key={`${activeRankTab}-${item.name}`}>
                <div className="rank-num">{index + 1}.</div>
                <div className="rank-avatar">{item.icon}</div>
                <div className="rank-info">
                  <div className="rank-name">{item.name}</div>
                  <div className="rank-count">{item.count}</div>
                </div>
              </div>
            ))}
            <button className="btn-outline" type="button" onClick={handleViewFullRanking} style={{ width: '100%', marginTop: '8px', fontSize: '12px' }}>Ver ranking completo</button>
          </section>

          <section className="bottom-sec" ref={achievementSectionRef} style={{ background: activeMemTab === 'Conquistas' ? 'var(--bg3)' : 'transparent', padding: activeMemTab === 'Conquistas' ? '12px' : '20px', margin: activeMemTab === 'Conquistas' ? '8px' : '0', borderRadius: activeMemTab === 'Conquistas' ? 'var(--radius-sm)' : '0', boxShadow: activeMemTab === 'Conquistas' ? '0 0 20px rgba(155, 127, 244, 0.6), 0 0 40px rgba(155, 127, 244, 0.3)' : 'none', transition: 'all 0.2s' }}>
            <div className="sec-header">
              <div className="sec-title" style={{ fontSize: '14px' }}>Conquistas desbloqueadas</div>
            </div>
            <div className="achievement-badges">
              {achievementItems.slice(0, 4).map((achievement) => (
                <div
                  className={`achievement-badge ${achievement.unlocked ? 'achievement-badge--unlocked' : 'achievement-badge--locked'}`}
                  key={achievement.name}
                >
                  <div className="achievement-badge-medal">{achievement.unlocked ? achievement.icon : '\u{1F512}'}</div>
                  <div className="achievement-badge-copy">
                    <div className="ach-name">{achievement.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-outline" type="button" onClick={handleViewAllAchievements} style={{ width: '100%', marginTop: '4px', fontSize: '12px' }}>Ver todas conquistas</button>
          </section>

        </div>

        <div className="footer-row">
          <section className="footer-widget">
            <div className="footer-title">🕯️ Homenagear uma ideia</div>
            <div className="footer-sub">Preste sua homenagem a este projeto que partiu cedo demais.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select
                value={selectedCandleIdea}
                onChange={(e) => setSelectedCandleIdea(e.target.value)}
                className="form-select"
                style={{ marginBottom: '0' }}
              >
                {museumCards.map((card) => (
                  <option key={card.name} value={card.name}>
                    {card.icon} {card.name}
                  </option>
                ))}
              </select>
              <button className="btn-primary" type="button" style={{ width: '100%', fontSize: '12px', padding: '8px 14px' }} onClick={handleLightCandle}>Acender velinha</button>
            </div>
          </section>

          <section className="footer-widget" onClick={handleShareMemorial}>
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

      {activeModal === 'guided-tour' && (
        <MuseumModal
          isOpen={true}
          onClose={closeModal}
          title="Visita Guiada da Curadoria"
          hideFooter
        >
          <div className="guided-tour-modal">
            <p>
              A Curadoria preparou um trajeto breve pelo acervo: ideias recentes, memorial,
              reliquias e conquistas duvidosas. Nada sera julgado em voz alta. Provavelmente.
            </p>
            <div className="guided-tour-steps">
              <div className="guided-tour-step">
                <span aria-hidden="true">{'\u{1F3DB}\uFE0F'}</span>
                <div>
                  <strong>Primeira sala</strong>
                  <em>As reliquias recentes aparecem primeiro, porque o drama ainda esta fresco.</em>
                </div>
              </div>
              <div className="guided-tour-step">
                <span aria-hidden="true">{'\u{1F56F}\uFE0F'}</span>
                <div>
                  <strong>Memorial</strong>
                  <em>Cada ideia pode receber homenagem, velinha e um pouco de dignidade tardia.</em>
                </div>
              </div>
              <div className="guided-tour-step">
                <span aria-hidden="true">{'\u{1F5DD}'}</span>
                <div>
                  <strong>Reserva tecnica</strong>
                  <em>Relatos, objetos e evidencias de planejamento excessivo ficam catalogados aqui.</em>
                </div>
              </div>
            </div>
            <div className="lifecycle-modal-actions">
              <button className="btn-primary" type="button" onClick={handleStartGuidedVisit}>
                Iniciar visita
              </button>
              <button className="btn-outline" type="button" onClick={closeModal}>
                Permanecer no saguao
              </button>
            </div>
          </div>
        </MuseumModal>
      )}

      {activeModal === 'community' && (
        <MuseumModal
          isOpen={true}
          onClose={closeModal}
          title="Mural da Comunidade"
          hideFooter
        >
          <div className="collection-modal-list">
            <div className="collection-modal-item collection-modal-item--with-icon">
              <div className="collection-modal-icon" aria-hidden="true">{'\u{1F465}'}</div>
              <div>
                <span>Visitantes</span>
                <strong>Comunidade em observacao</strong>
                <em>O mural publico ainda esta sendo catalogado. Por enquanto, a Curadoria registra sua presenca com um aceno solene.</em>
              </div>
            </div>
            <div className="collection-modal-item collection-modal-item--with-icon">
              <div className="collection-modal-icon" aria-hidden="true">{'\u{1F56F}\uFE0F'}</div>
              <div>
                <span>Ritual coletivo</span>
                <strong>Homenagens recentes</strong>
                <em>Use o memorial para acender velinhas, alternar reliquias e preservar o potencial desperdicado com dignidade teatral.</em>
              </div>
            </div>
          </div>
        </MuseumModal>
      )}

      {activeModal === 'relics' && (
        <MuseumModal
          isOpen={true}
          onClose={closeModal}
          title="Reserva Tecnica de Reliquias"
          hideFooter
        >
          <div className="collection-modal-list">
            {selectedIdeaRelics.map((relic) => (
              <div className="collection-modal-item collection-modal-item--with-icon" key={relic.name}>
                <div className="collection-modal-icon" aria-hidden="true">{relic.icon}</div>
                <div>
                  <span>Arquivado</span>
                  <strong>{relic.name}</strong>
                  <em>{relic.description}</em>
                </div>
              </div>
            ))}
          </div>
        </MuseumModal>
      )}

      {activeModal === 'ranking' && (
        <MuseumModal
          isOpen={true}
          onClose={closeModal}
          title="Ranking Completo da Curadoria"
          hideFooter
        >
          <p className="collection-modal-intro">
            As reliquias abaixo foram classificadas pela Curadoria conforme seu grau de otimismo estatisticamente comprometido.
          </p>
          <div className="collection-modal-list">
            {rankingCards.map((card, index) => (
              <div className="collection-modal-item collection-modal-item--with-icon" key={card.id || card.name}>
                <div className="collection-modal-icon" aria-hidden="true">
                  {index === 0 ? '\u{1F4C9}' : card.icon}
                </div>
                <div>
                  <span>{index + 1}. {card.category}</span>
                  <strong>{card.name}</strong>
                  <em>{card.survivalPercentage}% de sobrevivencia - {card.cause}</em>
                </div>
              </div>
            ))}
          </div>
        </MuseumModal>
      )}

      {activeModal === 'achievements' && (
        <MuseumModal
          isOpen={true}
          onClose={closeModal}
          title="Galeria de Conquistas Duvidosas"
          hideFooter
        >
          <div className="collection-modal-list">
            {achievementItems.map((achievement) => (
              <div
                className={`collection-modal-item collection-modal-item--with-icon ${achievement.unlocked ? 'collection-modal-item--unlocked' : 'collection-modal-item--locked'}`}
                key={achievement.name}
              >
                <div className="collection-modal-icon" aria-hidden="true">{achievement.icon}</div>
                <div>
                  <span>{achievement.unlocked ? 'Desbloqueada' : 'Em observacao'}</span>
                  <strong>{achievement.name}</strong>
                  <em>{achievement.description}</em>
                </div>
              </div>
            ))}
          </div>
        </MuseumModal>
      )}

      <FormModal isOpen={isFormModalOpen} onClose={closeModal}>
        <IdeaForm onIdeaAdded={handleIdeaAdded} />
      </FormModal>

      {lifecycleModal === 'revive' && activeLifecycleIdea && (
        <MuseumModal
          isOpen={true}
          onClose={closeLifecycleModal}
          title="A Curadoria precisa intervir"
          hideFooter
        >
          <div className="lifecycle-modal-copy">
            <p>
              Os registros indicam que esta ideia ja passou por aqui antes.
            </p>
            <p>
              Deseja mesmo tentar traze-la de volta, mesmo sabendo que ela provavelmente
              vai ocupar mais uma pasta chamada agora vai?
            </p>
            {activeLifecycleRecord.revival_attempts > 0 && (
              <p className="lifecycle-footnote">
                Tentativas anteriores registradas: {activeLifecycleRecord.revival_attempts}.
              </p>
            )}
          </div>
          <div className="lifecycle-modal-actions">
            <button className="btn-primary" type="button" onClick={confirmRevivalAttempt}>
              Sim, insistir mesmo assim
            </button>
            <button className="btn-outline" type="button" onClick={closeLifecycleModal}>
              Melhor preservar minha paz
            </button>
          </div>
        </MuseumModal>
      )}

      {lifecycleModal === 'death' && activeLifecycleIdea && (
        <MuseumModal
          isOpen={true}
          onClose={closeLifecycleModal}
          title="Registrar Nova Morte"
          hideFooter
        >
          <div className="lifecycle-modal-copy">
            <p>
              Aconteceu de novo. A curadoria solicita apenas um breve registro para fins
              historicos.
            </p>
            <label className="lifecycle-death-field">
              <span>Qual foi a causa desta nova morte?</span>
              <textarea
                value={newDeathReason}
                onChange={(event) => setNewDeathReason(event.target.value)}
                placeholder="Ex: entusiasmo durou menos que a reuniao de planejamento"
                rows="4"
              />
            </label>
          </div>
          <div className="lifecycle-modal-actions">
            <button className="btn-primary" type="button" onClick={confirmDeathAgain}>
              Registrar nos arquivos
            </button>
            <button className="btn-outline" type="button" onClick={closeLifecycleModal}>
              Cancelar autopsia
            </button>
          </div>
        </MuseumModal>
      )}

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
          <MuseumAtmosphere variant="modal" />
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
