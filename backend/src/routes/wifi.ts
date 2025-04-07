import express from 'express';
import { Router } from 'express';
import WiFiConfigService from '../services/wifiConfigService';
import WebSocketService from '../services/websocketService';

const router: Router = express.Router();
const wsService = WebSocketService.getInstance();
const wifiService = WiFiConfigService.getInstance(wsService);

// Get WiFi status for a printer
router.get('/:printerId/status', async (req, res) => {
  try {
    const { printerId } = req.params;
    const status = await wifiService.getWiFiStatus(printerId);
    res.json(status);
  } catch (error) {
    console.error('Error getting WiFi status:', error);
    res.status(500).json({ error: 'Failed to get WiFi status' });
  }
});

// Scan for available networks
router.get('/:printerId/scan', async (req, res) => {
  try {
    const { printerId } = req.params;
    const networks = await wifiService.scanNetworks(printerId);
    res.json({ networks });
  } catch (error) {
    console.error('Error scanning networks:', error);
    res.status(500).json({ error: 'Failed to scan networks' });
  }
});

// Configure WiFi for a printer
router.post('/:printerId/configure', async (req, res) => {
  try {
    const { printerId } = req.params;
    const { ssid, password, securityType } = req.body;

    if (!ssid || !password || !securityType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const success = await wifiService.configureWiFi(printerId, {
      ssid,
      password,
      securityType
    });

    if (success) {
      res.json({ message: 'WiFi configuration successful' });
    } else {
      res.status(500).json({ error: 'Failed to configure WiFi' });
    }
  } catch (error) {
    console.error('Error configuring WiFi:', error);
    res.status(500).json({ error: 'Failed to configure WiFi' });
  }
});

export default router; 