import { useState } from 'react';
import Sidebar from './components/Sidebar';
import IdeaForm from './components/IdeaForm';
import MuseumModal from './components/MuseumModal';
import { MODAL_CONTENTS } from './components/ModalContent';

export default function App() {
  const [activeModal, setActiveModal] = useState(null);

  const handleNavigate = (modalId) => {
    if (modalId === 'analyze') {
      setActiveModal(null); // Fecha modal e volta ao formulário
    } else {
      setActiveModal(modalId);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#0f0b18] text-[#e8e0f5] font-['DM_Sans'] flex">
      
      {/* Sidebar */}
      <Sidebar onNavigate={handleNavigate} />

      {/* ─── CONTEÚDO PRINCIPAL ─── */}
      <main className="ml-[220px] flex-1 min-h-screen flex flex-col">
        
        {/* TOPBAR */}
        <header className="flex items-center justify-between p-3 px-6 border-b border-[rgba(180,140,255,0.15)] bg-[#161020] sticky top-0 z-40">
          <div className="text-xs text-[#6a5c8a]">
            Museu das Ideias Quase Boas · Startups que nunca deveriam ter existido · Desde sempre
          </div>
        </header>

        {/* ÁREA DO HERO (Bem-vindo) */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0f30] via-[#0d0820] to-[#1a1030] p-10 border-b border-[rgba(180,140,255,0.15)]">
          <div className="relative z-10 max-w-lg">
            <div className="text-[11px] tracking-widest uppercase text-[#e8b86d] mb-2 flex items-center gap-2">
              <span className="w-5 h-[1px] bg-[#e8b86d]"></span> Bem-vindo ao
            </div>
            <h1 className="font-['Cinzel'] text-4xl font-bold text-white mb-4 leading-tight">
              Museu das Ideias Quase Boas
            </h1>
            <p className="text-[#a898c8] text-sm mb-6">
              Startups que nunca deveriam ter existido. Preservamos os pitches mais corajosos, e questionaveis, da historia do empreendedorismo.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#6a5c8a]">
              <div className="flex items-center gap-2">
                <span>🤔</span>
                <span>+4.200 startups exibidas</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💸</span>
                <span>831 investidores enganados</span>
              </div>
            </div>
          </div>
          {/* Estátua de fundo */}
          <div className="absolute right-10 top-0 bottom-0 flex items-center opacity-20 text-[160px] pointer-events-none sepia hue-rotate-180">
            🤔
          </div>
        </section>

        {/* FORMULÁRIO DE ANÁLISE */}
        <section className="p-6 flex-1">
          <IdeaForm />
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[rgba(180,140,255,0.15)] p-4 text-center text-xs text-[#6a5c8a]">
          <p>Desenvolvido com humor, risco desnecessario e validacao de mercado tardia</p>
        </footer>

      </main>

      {/* MODAIS */}
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
    </div>
  );
}