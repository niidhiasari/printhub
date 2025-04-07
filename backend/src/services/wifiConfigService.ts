import { WebSocketService } from './websocketService';
import { Printer } from '../models/Printer';

interface WiFiConfig {
  ssid: string;
  password: string;
  securityType: 'WPA' | 'WEP' | 'OPEN';
}

class WiFiConfigService {
  private static instance: WiFiConfigService;
  private wsService: WebSocketService;

  private constructor(wsService: WebSocketService) {
    this.wsService = wsService;
  }

  public static getInstance(wsService: WebSocketService): WiFiConfigService {
    if (!WiFiConfigService.instance) {
      WiFiConfigService.instance = new WiFiConfigService(wsService);
    }
    return WiFiConfigService.instance;
  }

  public async configureWiFi(printerId: string, config: WiFiConfig): Promise<boolean> {
    try {
      // Validate printer exists
      const printer = await Printer.findById(printerId);
      if (!printer) {
        throw new Error('Printer not found');
      }

      // Send WiFi configuration to printer
      this.wsService.broadcastToPrinter(printerId, 'printer:wifiConfig', {
        printerId,
        config,
        timestamp: new Date()
      });

      // Update printer's WiFi information
      printer.wifiConfig = {
        ssid: config.ssid,
        lastConfigured: new Date()
      };
      await printer.save();

      return true;
    } catch (error) {
      console.error('Error configuring WiFi:', error);
      throw error;
    }
  }

  public async scanNetworks(printerId: string): Promise<Array<{ ssid: string; strength: number; security: string }>> {
    try {
      // Send network scan request to printer
      this.wsService.broadcastToPrinter(printerId, 'printer:scanNetworks', {
        printerId,
        timestamp: new Date()
      });

      // Return empty array for now - actual networks will be sent via WebSocket
      return [];
    } catch (error) {
      console.error('Error scanning networks:', error);
      throw error;
    }
  }

  public async getWiFiStatus(printerId: string): Promise<{
    connected: boolean;
    ssid?: string;
    ipAddress?: string;
    signalStrength?: number;
  }> {
    try {
      const printer = await Printer.findById(printerId);
      if (!printer) {
        throw new Error('Printer not found');
      }

      return {
        connected: !!printer.wifiConfig?.ssid,
        ssid: printer.wifiConfig?.ssid,
        ipAddress: printer.ipAddress,
        signalStrength: printer.wifiConfig?.signalStrength
      };
    } catch (error) {
      console.error('Error getting WiFi status:', error);
      throw error;
    }
  }
}

export default WiFiConfigService; 