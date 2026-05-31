/**
 * Sidebar - Navegacao lateral do Museu
 * Gerencia os botoes que abrem secoes e modais.
 */

import { useState } from 'react';
import ApiStatus from './ApiStatus';

export default function Sidebar({ onNavigate }) {
  const [activeLabel, setActiveLabel] = useState('Inicio');

  const handleLogoClick = () => {
    setActiveLabel('Inicio');
    onNavigate('inicio');
  };

  const menuItems = [
    { id: 'inicio', icon: '\u{1F3DB}\uFE0F', label: 'Inicio' },
    { id: 'museu', icon: '\u{1F5BC}\uFE0F', label: 'Dentro do Museu' },
    { id: 'memorial', icon: '\u{1FAA6}', label: 'Memorial' },
    { id: 'reliquias', icon: '\u{1F3FA}', label: 'Reliquias' },
    { id: 'ranking', icon: '\u{1F3C6}', label: 'Ranking do Caos', badge: '5' },
    { id: 'conquistas', icon: '\u{1F6E1}\uFE0F', label: 'Conquistas' },
    { id: 'timeline', icon: '\u{231B}', label: 'Linha do Tempo', section: 'Explorar' },
    { id: 'comunidade', icon: '\u{1F465}', label: 'Comunidade' },
    { id: 'sobre', icon: '\u{1F4DC}', label: 'Sobre o Museu' },
  ];

  return (
    <aside className="sidebar">
      <button className="logo-wrap logo-wrap--button" type="button" onClick={handleLogoClick}>
        <div className="logo-icon">
          {'\u{1F3DB}\uFE0F'}
        </div>
        <div className="logo-text">
          <strong>MUSEU</strong>
          <span>DAS IDEIAS ABANDONADAS</span>
        </div>
      </button>

      <nav>
        <div className="nav-label">Navegacao</div>
        <div>
          {menuItems.map((item) => (
            <div key={`${item.label}-${item.icon}`}>
              {item.section ? <div className="nav-label">{item.section}</div> : null}
              <button
                type="button"
                onClick={() => {
                  setActiveLabel(item.label);
                  onNavigate(item.id);
                }}
                className={`nav-item ${activeLabel === item.label ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </button>
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div>Visitantes hoje</div>
        <div className="visitor-count">
          <div className="visitor-dot"></div>
          <strong>1.247</strong>
        </div>
        <div style={{ marginTop: '10px' }}>
          <ApiStatus />
        </div>
      </div>
    </aside>
  );
}
