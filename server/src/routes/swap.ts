import { Router } from 'express';
import { swapCore, QuoteRequest } from '../modules/swap-core/index.js';
import { tokenRegistry } from '../modules/token-registry/index.js';
import { historyService } from '../modules/history-service/index.js';
import { feeEngine } from '../modules/fee-engine/index.js';

const router = Router();

router.post('/quote', async (req, res) => {
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
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get quote'
    });
  }
});

router.post('/validate-token', async (req, res) => {
  try {
    const { chainId, address } = req.body;

    if (!chainId || !address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: chainId, address'
      });
    }

    const token = await swapCore.validateToken(chainId, address);

    if (!token) {
      return res.status(404).json({
        success: false,
        error: 'Token not found or invalid'
      });
    }

    tokenRegistry.addToken(chainId, token);

    res.json({
      success: true,
      data: token
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate token'
    });
  }
});

router.post('/record', (req, res) => {
  try {
    const { 
      walletAddress, 
      chainId, 
      fromToken, 
      toToken, 
      feeAmount,
      feeFormatted,
      txHash,
      status 
    } = req.body;

    if (!walletAddress || !chainId || !fromToken || !toToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const record = historyService.addSwap({
      walletAddress,
      chainId,
      timestamp: Date.now(),
      fromToken,
      toToken,
      feeAmount: feeAmount || '0',
      feeFormatted: feeFormatted || '0',
      txHash,
      status: status || 'pending'
    });

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Record swap error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record swap'
    });
  }
});

router.patch('/record/:id/status', (req, res) => {
  try {
    const { walletAddress, status, txHash } = req.body;
    const { id } = req.params;

    if (!walletAddress || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: walletAddress, status'
      });
    }

    historyService.updateSwapStatus(walletAddress, id, status, txHash);

    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update swap status'
    });
  }
});

router.get('/history', (req, res) => {
  try {
    const { walletAddress, limit, offset } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'walletAddress is required'
      });
    }

    const swaps = historyService.getSwapsForWallet(
      walletAddress,
      Number(limit) || 50,
      Number(offset) || 0
    );

    res.json({
      success: true,
      data: swaps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
});

router.get('/stats', (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (walletAddress && typeof walletAddress === 'string') {
      const stats = historyService.getWalletStats(walletAddress);
      return res.json({
        success: true,
        data: stats
      });
    }

    const globalStats = historyService.getGlobalStats();
    res.json({
      success: true,
      data: globalStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

router.post('/calculate-fee', (req, res) => {
  try {
    const { amount, decimals, chainType } = req.body;

    if (!amount || decimals === undefined || !chainType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, decimals, chainType'
      });
    }

    const feeCalc = feeEngine.calculateFee(amount, decimals, chainType);

    res.json({
      success: true,
      data: feeCalc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate fee'
    });
  }
});

export default router;
