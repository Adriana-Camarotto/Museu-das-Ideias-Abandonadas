/**
 * Ideas API.
 *
 * Single clean flow:
 * request -> validation -> AI analysis -> persistence -> formatted response.
 *
 * `/api/analisar-ideia` is kept as a compatibility alias for the current
 * frontend service. New code should prefer `/api/ideas/analyze`.
 */

import { Router } from "express";
import { ideaLimiter } from "../middleware/rateLimiter.js";
import { validateIdeia } from "../middleware/validateIdeia.js";
import { optionalAuthMiddleware, requireAuth } from "../middleware/authMiddleware.js";
import { analisarIdeia } from "../services/GeminiService.js";
import { getIdeaService } from "../services/IdeaService.js";
import logger from "../config/logger.js";

const router = Router();
const ideaService = getIdeaService();

function getUserId(req) {
  return req.user?.id || process.env.DEV_USER_ID || "dev-user";
}

function formatIdeaForFrontend(idea) {
  if (!idea) return null;
  const year = idea.created_at ? new Date(idea.created_at).getFullYear() : new Date().getFullYear();

  return {
    ...idea,
    icon: idea.icon || "🕯️",
    dates: idea.dates || `${year} - ${year}`,
    cause: idea.cause || idea.cause_of_death_summary,
  };
}

async function analyzeAndPersist(req, res) {
  const { nome, categoria, empolgacao, motivo } = req.body;
  const userId = getUserId(req);

  try {
    const ideaHash = ideaService.generateIdeaHash(nome, motivo);
    const existingIdea = await ideaService.findIdeaByHash(ideaHash, userId);

    if (existingIdea) {
      return res.status(200).json({
        success: true,
        data: formatIdeaForFrontend(existingIdea),
        message: "Esta ideia ja foi analisada antes. Retornando o memorial existente.",
      });
    }

    const analysis = await analisarIdeia({ nome, categoria, empolgacao, motivo });
    const createdIdea = await ideaService.createIdea({
      nome,
      categoria,
      empolgacao,
      motivo,
      analysis,
      userId,
    });

    return res.status(201).json({
      success: true,
      data: formatIdeaForFrontend(createdIdea),
      message: "Ideia analisada e salva com sucesso.",
    });
  } catch (error) {
    logger.error({ err: error.message, stack: error.stack }, "Erro ao analisar e salvar ideia");

    return res.status(500).json({
      success: false,
      error:
        "A Curadora do Caos teve um colapso existencial tentando processar tanto fracasso de uma vez. Tente novamente em breve.",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }
}

router.post(
  "/analisar-ideia",
  ideaLimiter,
  optionalAuthMiddleware,
  requireAuth,
  validateIdeia,
  analyzeAndPersist
);

router.post(
  "/ideas/analyze",
  ideaLimiter,
  optionalAuthMiddleware,
  requireAuth,
  validateIdeia,
  analyzeAndPersist
);

router.get("/ideas", optionalAuthMiddleware, requireAuth, async (req, res) => {
  try {
    const status = req.query.status || "active";
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;
    const result = await ideaService.listIdeas({
      status,
      userId: getUserId(req),
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: result.ideas.map(formatIdeaForFrontend),
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.limit < result.total,
      },
    });
  } catch (error) {
    logger.error({ err: error.message }, "Erro ao listar ideias");
    return res.status(500).json({ success: false, error: "Nao foi possivel listar ideias." });
  }
});

router.get("/ideas/stats/user", optionalAuthMiddleware, requireAuth, async (req, res) => {
  try {
    const stats = await ideaService.getStatistics(getUserId(req));
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    logger.error({ err: error.message }, "Erro ao obter estatisticas");
    return res.status(500).json({ success: false, error: "Nao foi possivel obter estatisticas." });
  }
});

router.get("/ideas/:id", optionalAuthMiddleware, requireAuth, async (req, res) => {
  try {
    const idea = await ideaService.getIdea(req.params.id, getUserId(req));
    if (!idea) {
      return res.status(404).json({ success: false, error: "Ideia nao encontrada." });
    }
    return res.status(200).json({ success: true, data: formatIdeaForFrontend(idea) });
  } catch (error) {
    logger.error({ err: error.message }, "Erro ao obter ideia");
    return res.status(500).json({ success: false, error: "Nao foi possivel obter ideia." });
  }
});

router.post("/ideas/:id/honor", optionalAuthMiddleware, requireAuth, async (req, res) => {
  try {
    await ideaService.incrementHonor(req.params.id, getUserId(req));
    const idea = await ideaService.getIdea(req.params.id, getUserId(req));
    return res.status(200).json({
      success: true,
      data: formatIdeaForFrontend(idea),
      message: "Homenagem adicionada com sucesso.",
    });
  } catch (error) {
    logger.error({ err: error.message }, "Erro ao homenagear ideia");
    return res.status(500).json({ success: false, error: "Nao foi possivel homenagear ideia." });
  }
});

router.post("/ideas/:id/candle", optionalAuthMiddleware, requireAuth, async (req, res) => {
  try {
    const idea = await ideaService.lightCandle(req.params.id, getUserId(req));
    return res.status(200).json({
      success: true,
      data: formatIdeaForFrontend(idea),
      message: "Vela acesa com sucesso!",
    });
  } catch (error) {
    logger.error({ err: error.message }, "Erro ao acender vela na ideia");
    return res.status(500).json({ success: false, error: "Nao foi possivel acender a vela." });
  }
});

router.post("/ideas/:id/revive", optionalAuthMiddleware, requireAuth, async (req, res) => {
  try {
    const idea = await ideaService.archiveIdea(req.params.id, getUserId(req));
    return res.status(200).json({
      success: true,
      data: formatIdeaForFrontend(idea),
      message: "Tentativa de ressurreicao registrada.",
    });
  } catch (error) {
    logger.error({ err: error.message }, "Erro ao ressuscitar ideia");
    return res.status(500).json({ success: false, error: "Nao foi possivel ressuscitar ideia." });
  }
});

export default router;
