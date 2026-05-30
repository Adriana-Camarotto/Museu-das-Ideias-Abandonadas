/**
 * Serviço de Email
 * Centraliza toda a lógica de envio de emails
 */

import nodemailer from 'nodemailer';
import { config } from '../config/environment.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this._initializeTransporter();
  }

  /**
   * Inicializa o transporter de email
   * @private
   */
  _initializeTransporter() {
    const { smtp } = config;

    if (!smtp.host || !smtp.port || !smtp.user || !smtp.pass) {
      console.warn('⚠️ Configuração de SMTP incompleta. Emails não serão enviados.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }

  /**
   * Envia email de confirmação de assinatura
   * @param {string} email - Email do destinatário
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendSubscriptionConfirmation(email) {
    if (!this.transporter) {
      throw new Error('Serviço de email não configurado. Verifique as variáveis SMTP no .env');
    }

    const { smtp } = config;

    const mailOptions = {
      from: smtp.from,
      to: email,
      subject: '🏛️ Bem-vindo ao Museu das Ideias Abandonadas!',
      html: this._getSubscriptionEmailTemplate(email),
    };

    try {
      console.log(`📧 Enviando email de confirmação para ${email}...`);
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado com sucesso! ID: ${result.messageId}`);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao enviar email para ${email}:`, error);
      throw error;
    }
  }

  /**
   * Template HTML do email de confirmação
   * @private
   */
  _getSubscriptionEmailTemplate(email) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'DM Sans', sans-serif; background: #0f0b18; color: #e8e0f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #c4a8ff; }
            .content { padding: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #c4a8ff; font-size: 12px; color: #a898c8; }
            h1 { color: #c4a8ff; font-size: 24px; }
            p { line-height: 1.6; }
            .button { display: inline-block; padding: 12px 24px; background: #c4a8ff; color: #0f0b18; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏛️ Museu das Ideias Abandonadas</h1>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Obrigado por se inscrever nos alertas do Museu das Ideias Abandonadas!</p>
              <p>Você receberá notificações sobre:</p>
              <ul>
                <li>🎭 Novas ideias no acervo</li>
                <li>📊 Análises especiais</li>
                <li>🏆 Homenagens e rankings</li>
                <li>💀 Histórias de fracassos épicos</li>
              </ul>
              <p>Prepare-se para celebrar o fracasso de forma poética e sarcástica!</p>
              <p><strong>Email confirmado:</strong> ${email}</p>
            </div>
            <div class="footer">
              <p>© 2026 Museu das Ideias Abandonadas. Todos os fracassos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default new EmailService();
