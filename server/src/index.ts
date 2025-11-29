import express from 'express';
import cors from 'cors';
import configRoutes from './routes/config.js';
import swapRoutes from './routes/swap.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'lethex-backend',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/config', configRoutes);
app.use('/api/swap', swapRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Lethex backend running on port ${PORT}`);
});

export default app;
