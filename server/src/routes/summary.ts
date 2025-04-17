// server/src/routes/summary.ts
import express from 'express';
import { getSummary, getAiSummary, getMonthlyTrend } from '../controllers/summary';

const router = express.Router();

router.get('/', getSummary);
router.post('/ai-summary', getAiSummary);
router.get('/trend', getMonthlyTrend);

export default router;