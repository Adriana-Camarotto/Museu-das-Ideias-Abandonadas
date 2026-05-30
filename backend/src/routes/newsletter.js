/**
 * Rotas de Newsletter
 * Endpoints relacionados a assinatura e alertas
 */

import express from 'express';
import NewsletterController from '../controllers/NewsletterController.js';

const router = express.Router();

/**
 * POST /api/assinar-alertas
 * Assina newsletter
 */
router.post('/api/assinar-alertas', (req, res) => NewsletterController.subscribe(req, res));

export default router;
