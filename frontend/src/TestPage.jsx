import RipModalTest from './components/RipModalTest';

export default function TestPage() {
  return (
    <div style={{
      background: '#0f0b18',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{
          textAlign: 'center',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(180, 140, 255, 0.2)'
        }}>
          <h1 style={{ color: '#c4a8ff', margin: '0 0 8px 0' }}>
            🧪 Página de Teste RIP Modal
          </h1>
          <p style={{ color: '#a89cc4', margin: '0', fontSize: '14px' }}>
            Teste completo da funcionalidade do botão RIP com modal, sparkles e certificado de morte
          </p>
        </header>

        <RipModalTest />

        <footer style={{
          marginTop: '60px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(180, 140, 255, 0.2)',
          textAlign: 'center',
          color: '#8a7f9e',
          fontSize: '12px'
        }}>
          <p>Esta é uma página de teste para a funcionalidade RIP Modal</p>
          <p>Para usar no App.jsx, importe o RipModal em vez deste TestPage</p>
        </footer>
      </div>
    </div>
  );
}
