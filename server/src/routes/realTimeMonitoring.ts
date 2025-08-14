// server/src/routes/realTimeMonitoring.ts
import { Router } from 'express';
import { realTimeMonitoringService } from '../services/realTimeMonitoringService';
import { protect } from '../middleware/auth';

const router = Router();

// Get all active alerts for user
router.get('/alerts', protect, async (req, res) => {
  try {
    const alerts = await realTimeMonitoringService.getActiveAlerts((req as any).userId);
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert configuration
router.get('/config', protect, async (req, res) => {
  try {
    const config = await realTimeMonitoringService.getAlertConfig((req as any).userId);
    res.json(config);
  } catch (error) {
    console.error('Get alert config error:', error);
    res.status(500).json({ error: 'Failed to fetch alert configuration' });
  }
});

// Update alert configuration
router.put('/config', protect, async (req, res) => {
  try {
    const { spendingThresholds, alertTypes } = req.body;
    const config = await realTimeMonitoringService.updateAlertConfig(
      (req as any).userId,
      { spendingThresholds, alertTypes }
    );
    res.json(config);
  } catch (error) {
    console.error('Update alert config error:', error);
    res.status(500).json({ error: 'Failed to update alert configuration' });
  }
});

// Process new transaction for real-time monitoring
router.post('/process-transaction', protect, async (req, res) => {
  try {
    const { transaction } = req.body;
    const alerts = await realTimeMonitoringService.processTransaction(
      (req as any).userId,
      transaction
    );
    res.json({ alerts });
  } catch (error) {
    console.error('Process transaction error:', error);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
});

// Dismiss an alert
router.put('/alerts/:alertId/dismiss', protect, async (req, res) => {
  try {
    await realTimeMonitoringService.dismissAlert(req.params.alertId);
    res.json({ success: true });
  } catch (error) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({ error: 'Failed to dismiss alert' });
  }
});

// Get financial health monitoring status
router.get('/health-status', protect, async (req, res) => {
  try {
    const status = await realTimeMonitoringService.getFinancialHealthStatus((req as any).userId);
    res.json(status);
  } catch (error) {
    console.error('Get health status error:', error);
    res.status(500).json({ error: 'Failed to fetch health status' });
  }
});

// Get upcoming bill predictions
router.get('/bill-predictions', protect, async (req, res) => {
  try {
    const predictions = await realTimeMonitoringService.predictUpcomingBills((req as any).userId);
    res.json(predictions);
  } catch (error) {
    console.error('Get bill predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch bill predictions' });
  }
});

export default router;
