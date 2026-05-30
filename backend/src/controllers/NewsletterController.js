/**
 * Controller de Newsletter
 * Gerencia requisições de assinatura e alertas
 */

import EmailService from '../services/EmailService.js';
import { validateNewsletterData } from '../utils/validators.js';

class NewsletterController {
  /**
   * Assina newsletter
   * POST /api/assinar-alertas
   */
  async subscribe(req, res) {
    try {
      const { email } = req.body;

      // Validação
      const validation = validateNewsletterData(email);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
        });
      }

      // Envio de email
      await EmailService.sendSubscriptionConfirmation(email.trim());

      return res.status(200).json({
        success: true,
        message: 'Email de confirmação enviado com sucesso!',
      });
    } catch (error) {
      console.error('❌ Erro ao processar assinatura:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao processar assinatura. Tente novamente em breve.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

export default new NewsletterController();
