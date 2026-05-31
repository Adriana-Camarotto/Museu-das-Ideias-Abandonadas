/**
 * Rota POST /api/assinar-alertas
 *
 * Recebe um e-mail e envia confirmação de assinatura do museu.
 */

import { Router } from "express";
import { sendSubscriptionEmail } from "../services/MailService.js";
import logger from "../config/logger.js";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/assinar-alertas", async (req, res) => {
  const email = String(req.body?.email ?? "").trim();

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Forneça um e-mail válido para assinar os alertas.",
    });
  }

  try {
    await sendSubscriptionEmail(email);

    return res.status(200).json({
      success: true,
      message: "E-mail de confirmação enviado com sucesso.",
    });
  } catch (error) {
    logger.error({ err: error.message }, "Erro ao enviar e-mail de assinatura");

    // Distingue erro de config do servidor (500) de falha de envio (502)
    const isConfigError = error.message.includes("incompleta no servidor");

    return res.status(isConfigError ? 500 : 502).json({
      success: false,
      error: isConfigError
        ? "Configuração de e-mail ausente no servidor. Contate o suporte."
        : "Não foi possível enviar o e-mail de confirmação. Tente novamente.",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }
});

export default router;
