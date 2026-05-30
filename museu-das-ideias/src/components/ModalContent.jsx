/**
 * ModalContent - Conteúdo dos modais do Museu
 * Centraliza os textos e estruturas dos diferentes modais
 */

import Panel from './Panel';

export const MODAL_CONTENTS = {
  about: {
    title: 'Sobre o Museu',
    content: (
      <>
        <p>
          O <strong>Museu das Ideias Quase Boas</strong> e um espaco digital para registrar startups
          que pareciam geniais no pitch e duvidosas na vida real.
        </p>
        
        <p>
          Aqui, cada projeto recebe o destaque que merece: da ideia brilhante de 3h da manha
          ao plano de negocio que assustou ate o Canva.
        </p>

        <Panel className="p-4 my-4">
          <p className="text-sm">
            <strong>Nossa Missao:</strong> Transformar pitches exagerados em aprendizado real, com humor
            e sem passar pano para as planilhas otimistas.
          </p>
        </Panel>

        <p>
          Com IA e ironia, a <strong>Curadoria do Caos</strong> avalia cada startup quase boa
          para separar visao de ilusao com carinho critico.
        </p>

        <p className="text-xs text-[#6a5c8a] italic">
          Fundado para proteger investidores de planilhas criativas desde sempre
        </p>
      </>
    )
  },

  memorial: {
    title: 'Memorial das Ideias',
    content: (
      <>
        <p>
          Este e o hall da fama indevida, onde toda startup quase boa encontra seu lugar na historia.
        </p>

        <div className="space-y-4">
          <Panel className="p-4">
            <h3 className="text-[#c4a8ff] font-semibold mb-2">💀 Startups Catalogadas</h3>
            <p className="text-sm">
              Mais de 4.200 projetos ja passaram pela curadoria, cada um com sua
              historia unica de hype, pivot e queda livre.
            </p>
          </Panel>

          <Panel className="p-4">
            <h3 className="text-[#c4a8ff] font-semibold mb-2">🎭 Categorias</h3>
            <p className="text-sm">
              Animais, Comida, Transporte, Tecnologia, Relacionamentos e outras categorias
              que jamais deveriam ter recebido investimento-anjo.
            </p>
          </Panel>

          <Panel className="p-4">
            <h3 className="text-[#c4a8ff] font-semibold mb-2">🔮 Análise por IA</h3>
            <p className="text-sm">
              Cada startup recebe uma analise completa: chance de vingar,
              causa da falencia e veredito da curadoria.
            </p>
          </Panel>
        </div>

        <p className="text-xs text-[#6a5c8a] italic mt-4">
          "Nao e loucura. E visao. O problema e que o futuro discordou." - Curadoria
        </p>
      </>
    )
  }
};
