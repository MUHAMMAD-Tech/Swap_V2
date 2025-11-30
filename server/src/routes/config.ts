import { Router, Request, Response } from 'express';
import { chainRegistry } from '../modules/chain-registry/index.js';
import { tokenRegistry } from '../modules/token-registry/index.js';
import { feeEngine } from '../modules/fee-engine/index.js';

const router = Router();

router.get('/chains', (_req: Request, res: Response) => {
  try {
    const chains = chainRegistry.getAllChains();
    res.json({
      success: true,
      data: chains
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chains'
    });
  }
});

router.get('/chains/:chainId', (req: Request, res: Response) => {
  try {
    const chain = chainRegistry.getChain(req.params.chainId);
    if (!chain) {
      return res.status(404).json({
        success: false,
        error: 'Chain not found'
      });
    }
    res.json({
      success: true,
      data: chain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
