import { networkInterfaces } from 'os';
import dgram from 'dgram';
import { WebSocketService } from './websocketService';

interface DiscoveredPrinter {
  id: string;
  name: string;
  ip: string;
  port: number;
  firmwareVersion?: string;
}

class PrinterDiscoveryService {
  private static instance: PrinterDiscoveryService;
  private wsService: WebSocketService;
  private discoverySocket: dgram.Socket | null = null;
  private discoveryTimeout: NodeJS.Timeout | null = null;
  private readonly DISCOVERY_PORT = 8888;
  private readonly DISCOVERY_MESSAGE = 'PRINTER_DISCOVERY_REQUEST';

  private constructor(wsService: WebSocketService) {
    this.wsService = wsService;
  }

  public static getInstance(wsService: WebSocketService): PrinterDiscoveryService {
    if (!PrinterDiscoveryService.instance) {
      PrinterDiscoveryService.instance = new PrinterDiscoveryService(wsService);
    }
    return PrinterDiscoveryService.instance;
  }

  public async startDiscovery(): Promise<void> {
    try {
      // Create UDP socket for discovery
      this.discoverySocket = dgram.createSocket('udp4');

      // Handle incoming messages
      this.discoverySocket.on('message', (msg, rinfo) => {
        try {
          const response = JSON.parse(msg.toString());
          if (response.type === 'PRINTER_DISCOVERY_RESPONSE') {
            const printer: DiscoveredPrinter = {
              id: response.id,
              name: response.name,
              ip: rinfo.address,
              port: response.port,
              firmwareVersion: response.firmwareVersion
            };
            this.handleDiscoveredPrinter(printer);
          }
        } catch (error) {
          console.error('Error parsing discovery response:', error);
        }
      });

      // Get all network interfaces
      const interfaces = networkInterfaces();
      const broadcastAddresses: string[] = [];

      // Collect broadcast addresses
      Object.values(interfaces).forEach((iface) => {
        if (iface) {
          iface.forEach((details) => {
            if (details.family === 'IPv4' && !details.internal) {
              const broadcast = this.getBroadcastAddress(details.address, details.netmask);
              if (broadcast) {
                broadcastAddresses.push(broadcast);
              }
            }
          });
        }
      });

      // Send discovery request to all broadcast addresses
      broadcastAddresses.forEach((broadcast) => {
        this.discoverySocket?.send(
          this.DISCOVERY_MESSAGE,
          this.DISCOVERY_PORT,
          broadcast,
          (err) => {
            if (err) {
              console.error(`Error sending discovery request to ${broadcast}:`, err);
            }
          }
        );
      });

      // Set timeout to stop discovery after 5 seconds
      this.discoveryTimeout = setTimeout(() => {
        this.stopDiscovery();
      }, 5000);

    } catch (error) {
      console.error('Error starting printer discovery:', error);
      throw error;
    }
  }

  private handleDiscoveredPrinter(printer: DiscoveredPrinter): void {
    // Notify WebSocket clients about discovered printer
    this.wsService.broadcast('printer:discovered', {
      printers: [printer]
    });
  }

  private getBroadcastAddress(ip: string, netmask: string): string | null {
    try {
      const ipParts = ip.split('.').map(Number);
      const netmaskParts = netmask.split('.').map(Number);
      
      const broadcastParts = ipParts.map((part, index) => {
        return part | (255 - netmaskParts[index]);
      });

      return broadcastParts.join('.');
    } catch (error) {
      console.error('Error calculating broadcast address:', error);
      return null;
    }
  }

  public stopDiscovery(): void {
    if (this.discoveryTimeout) {
      clearTimeout(this.discoveryTimeout);
      this.discoveryTimeout = null;
    }

    if (this.discoverySocket) {
      this.discoverySocket.close();
      this.discoverySocket = null;
    }
  }
}

export default PrinterDiscoveryService; 