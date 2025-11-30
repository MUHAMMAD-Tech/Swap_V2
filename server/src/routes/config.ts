import { Router, Request, Response } from "express";
import { chainRegistry } from "../modules/chain-registry/index.js";
import { tokenRegistry } from "../modules/token-registry/index.js";
import { feeEngine } from "../modules/fee-engine/index.js";

const router = Router();

router.get("/chains", (_req: Request, res: Response) => {
  try {
    const chains = chainRegistry.getAllChains();
    res.json({
      success: true,
      data: chains,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch chains",
    });
  }
});

router.get("/chains/:chainId", (req: Request, res: Response) => {
  try {
    const chain = chainRegistry.getChain(req.params.chainId);
    if (!chain) {
      return res.status(404).json({
        success: false,
        error: "Chain not found",
      });
    }
    res.json({
      success: true,
      data: chain,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch chain",
    });
  }
});

router.get("/tokens", (req: Request, res: Response) => {
  try {
    const { chainId } = req.query;
    if (chainId && typeof chainId === "string") {
      const tokens = tokenRegistry.getTokensForChain(chainId);
      return res.json({
        success: true,
        data: tokens,
      });
    }
    const allTokens = tokenRegistry.getAllTokens();
    res.json({
      success: true,
      data: allTokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch tokens",
    });
  }
});

router.get("/tokens/search", (req: Request, res: Response) => {
  try {
    const { chainId, query } = req.query;
    if (
      !chainId ||
      !query ||
      typeof chainId !== "string" ||
      typeof query !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "chainId and query are required",
      });
    }
    const tokens = tokenRegistry.searchTokens(chainId, query);
    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to search tokens",
    });
  }
});

router.get("/fees", (_req: Request, res: Response) => {
  try {
    const config = feeEngine.getConfig();
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch fee config",
    });
  }
});

export default router;
