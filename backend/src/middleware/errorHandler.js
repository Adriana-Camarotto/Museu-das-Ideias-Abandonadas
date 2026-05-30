/**
 * Middleware de Tratamento de Erros
 * Centraliza o tratamento de erros da aplicação
 */

/**
 * Middleware de erro centralizado
 */
export function errorHandler(err, req, res, next) {
  console.error('❌ Erro não tratado:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  return res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

/**
 * Middleware para rotas não encontradas
 */
export function notFoundHandler(req, res) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'Esta rota também foi abandonada... assim como suas ideias! 💀',
    });
  }

  // Para SPA, retornar index.html
  res.status(404).json({
    success: false,
    error: 'Página não encontrada',
  });
}
