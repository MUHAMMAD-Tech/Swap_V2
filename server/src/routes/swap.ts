import { Router, Request, Response } from 'express';
import { swapCore, QuoteRequest } from '../modules/swap-core/index.js';
import { tokenRegistry } from '../modules/token-registry/index.js';
import { historyService } from '../modules/history-service/index.js';
import { feeEngine } from '../modules/fee-engine/index.js';

const router = Router();

router.post('/quote', async (req: Request, res: Response) => {
  try {
    const { chainId, sellToken, buyToken, sellAmount, slippageBps, userAddress } = req.body;

    if (!chainId || !sellToken || !buyToken || !sellAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: chainId, sellToken, buyToken, sellAmount'
      });
    }

    const request: QuoteRequest = {
      chainId,
      sellToken,
      buyToken,
      sellAmount,
      slippageBps: slippageBps || 50,
      userAddress
    };

    const quote = await swapCore.getQuote(request);

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Quote error:', error);
