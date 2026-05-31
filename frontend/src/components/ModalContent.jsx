/**
 * ModalContent - Conteúdo dos modais do Museu
 * Centraliza os textos e estruturas dos diferentes modais
 */

export const MODAL_CONTENTS = {
  about: {
    title: 'Sobre o Museu',
    content: (
      <>
        <p>
    Bem-vindo ao <strong>Museu das Ideias Abandonadas</strong>, o único espaço dedicado à preservação,
    estudo e contemplação de projetos que tinham tudo para dar certo... até deixarem de ter.
  </p>

  <p>
    Aqui repousam startups revolucionárias, aplicativos geniais, canais promissores,
    cursos comprados com entusiasmo excessivo e planos que morreram logo após a fase
    do "agora vai".
  </p>

  <div className="bg-[rgba(180,140,255,0.05)] border border-[rgba(180,140,255,0.15)] rounded-lg p-4 my-4">
    <p className="text-sm">
  <strong>Nossa Missão:</strong> preservar sonhos interrompidos, documentar fracassos
  criativos e promover o avanço sistemático da procrastinação aplicada.
  <br />
  <br />
  <em>Porque toda ideia merece uma chance... de ser abandonada!</em>
</p>
  </div>

  <p>
  Utilizando inteligência artificial, sarcasmo acadêmico e uma metodologia altamente questionável,
  nossa <strong>Curadoria do Caos</strong> investiga cada projeto, identifica sua causa oficial de morte
  e garante que aquela ideia jamais volte para assombrar sua lista de objetivos.
</p>

<p className="text-center italic text-[#c4a8ff] mt-4">
  Museu das Ideias Abandonadas — ajudando grandes ideias a não saírem do papel desde 2026.
</p>

  <div className="bg-[rgba(180,140,255,0.05)] border border-[rgba(180,140,255,0.15)] rounded-lg p-4 my-4">
    <h3 className="text-[#c4a8ff] font-semibold mb-3">
      🏛️ Conselho Supremo das Ideias Abandonadas
    </h3>

    <p className="text-sm mb-4 italic">
      Quem deveria ter impedido isso... mas preferiu documentar.
    </p>

    <div className="space-y-3 text-sm">
      <div>
        <strong>🎤 Pamela · Nível 99</strong><br/>
        Visionária do Caos Criativo<br/>
        <span className="text-[#c4a8ff]">Diretora de Sonhos Não Realizados</span><br/>
        ✨ Transformar delírios de madrugada em funcionalidades oficialmente questionáveis.
      </div>

      <div>
        <strong>💻 Adriana · Nível 99</strong><br/>
        Conjuradora de Interfaces<br/>
        <span className="text-[#c4a8ff]">Diretora de Materialização Digital</span><br/>
        ✨ Converter caos conceitual em telas clicáveis e perigosamente bonitas.
      </div>

      <div>
        <strong>⚙️ Carla · Nível 99</strong><br/>
        Alquimista de Sistemas<br/>
        <span className="text-[#c4a8ff]">Diretora de Engenharia das Gambiarras Nobres</span><br/>
        ✨ Convencer APIs e integrações a cooperarem contra todas as probabilidades.
      </div>

      <div>
        <strong>🚀 Lua · Nível 99</strong><br/>
        Exploradora de Possibilidades<br/>
        <span className="text-[#c4a8ff]">Diretora de Pesquisas Altamente Questionáveis</span><br/>
        ✨ Transformar ideias improváveis em protótipos funcionais.
      </div>
    </div>
  </div>

  <p className="text-xs text-[#6a5c8a] italic">
    Fundado em 2026 · Porque toda desistência merece um memorial
  </p>
</>   
    )
  },

  memorial: {
    title: 'Memorial das Ideias',
    content: (
      <>
        <p>
          Este é o memorial sagrado onde cada ideia abandonada encontra seu lugar na história.
        </p>

        <div className="space-y-4">
          <div className="bg-[rgba(180,140,255,0.05)] border border-[rgba(180,140,255,0.15)] rounded-lg p-4">
            <h3 className="text-[#c4a8ff] font-semibold mb-2">💀 Ideias Catalogadas</h3>
            <p className="text-sm">
              Mais de 1.247 ideias já passaram pela análise da Curadora do Caos, cada uma com sua 
              própria história de fracasso e aprendizado.
            </p>
          </div>

          <div className="bg-[rgba(180,140,255,0.05)] border border-[rgba(180,140,255,0.15)] rounded-lg p-4">
            <h3 className="text-[#c4a8ff] font-semibold mb-2">🎭 Categorias</h3>
            <p className="text-sm">
              Apps, Startups, Projetos Pessoais, SaaS, E-commerce, Jogos, Blogs e muito mais. 
              Cada categoria tem seu próprio espaço no museu.
            </p>
          </div>

          <div className="bg-[rgba(180,140,255,0.05)] border border-[rgba(180,140,255,0.15)] rounded-lg p-4">
            <h3 className="text-[#c4a8ff] font-semibold mb-2">🔮 Análise por IA</h3>
            <p className="text-sm">
              Cada ideia recebe uma análise profunda: porcentagem de sobrevivência, causa da morte 
              e um veredito sarcástico mas reconfortante.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#6a5c8a] italic mt-4">
          "Todo fracasso é um passo em direção ao sucesso" — Curadora do Caos
        </p>
      </>
    )
  }
};
