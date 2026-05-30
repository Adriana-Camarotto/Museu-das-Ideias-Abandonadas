/**
 * Rotas de Ideias - FASE 3 (Autenticação Supabase)
 * 
 * Todas as rotas requerem autenticação via JWT
 * 
 * Fluxo:
 * 1. Frontend envia JWT no header: Authorization: Bearer <token>
 * 2. authMiddleware valida token
 * 3. req.user é criado com id e email
 * 4. Controller usa req.user.id (não userId do body)
 * 5. IdeaService filtra por user_id
 * 
 * @author Backend Sênior
 * @version 3.0.0
 */

import express from 'express';
import { authMiddleware, requireAuth } from '../middleware/authMiddleware.js';
import * as IdeaController from '../controllers/IdeaController.js';

const router = express.Router();

// ============================================
// APLICAR AUTENTICAÇÃO EM TODAS AS ROTAS
// ============================================

router.use(authMiddleware);
router.use(requireAuth);

// ============================================
// ANÁLISE E PERSISTÊNCIA
// ============================================

// Análise de ideia (com autenticação)
// POST /api/ideas/analyze
// Header: Authorization: Bearer <token>
// Body: { nome, categoria, empolgacao, motivo }
router.post('/analyze', IdeaController.analyzeIdea);

// ============================================
// LISTAGEM E BUSCA
// ============================================

// Listar ideias do usuário autenticado
// GET /api/ideas?status=active&limit=50&offset=0
router.get('/', IdeaController.listIdeas);

// Obter ideia específica (apenas se pertencer ao usuário)
// GET /api/ideas/:id
router.get('/:id', IdeaController.getIdea);

// ============================================
// AÇÕES EM IDEIAS
// ============================================

// Adicionar homenagem
// POST /api/ideas/:id/honor
router.post('/:id/honor', IdeaController.honorIdea);

// Ressuscitar ideia (arquivar)
// POST /api/ideas/:id/revive
router.post('/:id/revive', IdeaController.reviveIdea);

// ============================================
// ESTATÍSTICAS
// ============================================

// Obter estatísticas do usuário autenticado
// GET /api/ideas/stats
router.get('/stats/user', IdeaController.getStatistics);

export default router;
