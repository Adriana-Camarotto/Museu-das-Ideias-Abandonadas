/**
 * Sidebar - Navegação lateral do Museu
 * Gerencia os botões que abrem modais
 */

import ApiStatus from './ApiStatus';
import Button from './Button';

export default function Sidebar({ onNavigate }) {
  const menuItems = [
    {
      id: 'analyze',
      icon: '🔮',
      label: 'Analisar Ideia',
      active: true
    },
    {
      id: 'about',
      icon: 'ℹ️',
      label: 'Sobre o Museu'
    },
    {
      id: 'memorial',
      icon: '📜',
      label: 'Memorial'
    }
  ];

  return (
    <aside className="w-[220px] fixed top-0 left-0 h-screen bg-[#161020] border-r border-[rgba(180,140,255,0.15)] flex flex-col z-50">
      {/* Logo/Branding */}
      <div className="p-5 border-b border-[rgba(180,140,255,0.15)] flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#7c5ce8] to-[#c4a8ff] rounded-xl flex items-center justify-center text-xl">
          🏛️
        </div>
        <div className="leading-tight">
          <strong className="block font-['Cinzel'] text-[11px] font-bold text-[#c4a8ff] tracking-widest">
            MUSEU
          </strong>
          <span className="text-[9px] text-[#6a5c8a] tracking-widest uppercase">
            DAS IDEIAS ABANDONADAS
          </span>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="p-5 flex-1">
        <ul className="space-y-2 text-sm">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                onClick={() => onNavigate(item.id)}
                variant="nav"
                active={item.active}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Status da API */}
      <div className="p-5 border-t border-[rgba(180,140,255,0.15)]">
        <ApiStatus />
      </div>
    </aside>
  );
}
