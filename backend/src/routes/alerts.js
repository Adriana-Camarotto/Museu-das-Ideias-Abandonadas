/**
 * Rota POST /api/assinar-alertas
 *
 * Recebe um e-mail e envia confirmacao de assinatura do museu.
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
      error: "Forneca um e-mail valido para assinar os alertas.",
    });
  }

  try {
    await sendSubscriptionEmail(email);

    return res.status(200).json({
      success: true,
      message: "E-mail de confirmacao enviado com sucesso.",
    });
  } catch (error) {
    logger.error({ err: error.message }, "Erro ao enviar e-mail de assinatura");

    const isConfigError = error.message.includes("incompleta no servidor");
    const canSimulateInDev = isConfigError && process.env.NODE_ENV !== "production";

    if (canSimulateInDev) {
      logger.warn(
        { email },
        "SMTP ausente em ambiente local; assinatura registrada como simulada"
      );

      return res.status(200).json({
        success: true,
        simulated: true,
        message:
          "A Curadoria registrou sua assinatura. Em ambiente local, o setor postal do museu ainda esta em ensaio geral.",
      });
    }

    return res.status(isConfigError ? 500 : 502).json({
      success: false,
      error: isConfigError
        ? "A Curadoria tentou enviar o aviso, mas o setor postal do museu ainda nao foi configurado."
        : "Nao foi possivel enviar o aviso agora. O mensageiro tropecou nos degraus do acervo.",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }
});

export default router;
