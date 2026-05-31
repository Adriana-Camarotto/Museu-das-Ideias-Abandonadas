import './AuthScreen.css';
import MuseumAtmosphere from './MuseumAtmosphere';

export default function AuthScreen({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authName,
  setAuthName,
  authLoading,
  authError,
  onSubmit,
  onGoogleLogin,
}) {
  const isSignup = authMode === 'signup';

  function handleModeToggle() {
    setAuthMode(isSignup ? 'login' : 'signup');
  }

  return (
    <main className="auth-screen">
      <div className="auth-museum-backdrop" />
      <MuseumAtmosphere variant="login" />
      <div className="auth-candles auth-candles-left" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="auth-candles auth-candles-right" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <section className="auth-gate" aria-label="Autenticacao do Museu">
        <div className="auth-kicker">Portaria oficial</div>
        <h1>Bem-vindo ao Museu das Ideias Abandonadas.</h1>
        <p className="auth-copy">
          Preservando promessas desde o primeiro "agora vai".
        </p>

        <div className="auth-mode-switch" aria-label="Alternar modo de autenticacao">
          <button
            type="button"
            className={!isSignup ? 'active' : ''}
            onClick={() => setAuthMode('login')}
            disabled={authLoading}
          >
            Entrar
          </button>
          <button
            type="button"
            className={isSignup ? 'active' : ''}
            onClick={() => setAuthMode('signup')}
            disabled={authLoading}
          >
            Criar conta
          </button>
        </div>

<<<<<<< Updated upstream
        <form className="auth-form" onSubmit={onSubmit}>
          {isSignup && (
=======
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {isSignup ? (
>>>>>>> Stashed changes
            <label>
              <span>Nome da credencial</span>
              <input
                type="text"
                value={authName}
                onChange={(event) => setAuthName(event.target.value)}
<<<<<<< Updated upstream
                placeholder="Curador anônimo"
=======
                placeholder="Curador anonimo"
>>>>>>> Stashed changes
                autoComplete="name"
                disabled={authLoading}
              />
            </label>
<<<<<<< Updated upstream
          )}
=======
          ) : null}
>>>>>>> Stashed changes

          <label>
            <span>E-mail da credencial</span>
            <input
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="visitante@museu.dev"
              autoComplete="email"
              disabled={authLoading}
              required
            />
          </label>

          <label>
            <span>Senha lacrada</span>
            <input
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Minimo de 6 caracteres"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={6}
              disabled={authLoading}
              required
            />
          </label>

<<<<<<< Updated upstream
          {authError && (
            <div className="auth-error" role="alert">
              {authError}
            </div>
          )}
=======
          {authError ? (
            <div className="auth-error" role="alert">
              {authError}
            </div>
          ) : null}
>>>>>>> Stashed changes

          <button className="auth-submit" type="submit" disabled={authLoading}>
            {authLoading
              ? 'Consultando os arquivos esquecidos...'
              : isSignup
<<<<<<< Updated upstream
                ? 'Registrar credencial'
                : 'Abrir os portões'}
=======
                ? 'Criar credencial'
                : 'Entrar'}
>>>>>>> Stashed changes
          </button>
        </form>

        <div className="auth-divider" aria-hidden="true">
<<<<<<< Updated upstream
          <span>ou atravesse os portões com</span>
=======
          <span>ou atravesse os portoes com</span>
>>>>>>> Stashed changes
        </div>

        <button
          className="auth-google"
          type="button"
          onClick={onGoogleLogin}
          disabled={authLoading || typeof onGoogleLogin !== 'function'}
        >
          <span className="auth-google-mark" aria-hidden="true">G</span>
          <span>Entrar com Google</span>
        </button>

        <button
          className="auth-alt"
          type="button"
          onClick={handleModeToggle}
          disabled={authLoading}
        >
          {isSignup
<<<<<<< Updated upstream
            ? 'Já possui credencial? Volte ao acervo.'
            : 'Ainda não possui credencial? Registre-se no museu.'}
=======
            ? 'Ja possui credencial? Volte ao acervo.'
            : 'Ainda nao possui credencial? Registre-se no museu.'}
>>>>>>> Stashed changes
        </button>
      </section>
    </main>
  );
}
