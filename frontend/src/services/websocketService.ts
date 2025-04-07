import { io, Socket } from 'socket.io-client';
import { WebSocketEvents, DiscoveredPrinter, Network, WiFiStatus, PrinterStatus, PrintJobProgress } from '../types/websocket';

type EventCallback = (data: any) => void;

class WebSocketService {
  private static _instance: WebSocketService;
  private socket: Socket;
  private eventHandlers: Map<keyof WebSocketEvents, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    this.socket = io('http://localhost:3000', {
      autoConnect: true,
      transports: ['websocket']
    });

    this.setupEventListeners();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService._instance) {
      WebSocketService._instance = new WebSocketService();
    }
    return WebSocketService._instance;
  }

  private setupEventListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.handleReconnect();
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    // Set up event listeners for all WebSocket events
    Object.keys(this.eventHandlers).forEach((event) => {
      this.socket?.on(event, (data) => {
        this.emit(event as keyof WebSocketEvents, data);
      });
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.socket.connect();
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  public connectToPrinter(printerId: string) {
    if (!this.socket) return;
    this.socket.emit('printer:connect', printerId);
  }

  public disconnectFromPrinter(printerId: string) {
    if (!this.socket) return;
    this.socket.emit('printer:disconnect', printerId);
  }

  public sendCommand(printerId: string, command: string, params?: any) {
    if (!this.socket) return;
    this.socket.emit('printer:command', { printerId, command, params });
  }

  public updatePrinterStatus(printerId: string, status: PrinterStatus) {
    if (!this.socket) return;
    this.socket.emit('printer:updateStatus', { printerId, status });
  }

  public updatePrintJobProgress(printerId: string, progress: PrintJobProgress) {
    if (!this.socket) return;
    this.socket.emit('printer:updateProgress', { printerId, progress });
  }

  public discoverPrinters(callback: (printers: DiscoveredPrinter[]) => void) {
    if (!this.socket) return;

    this.socket.emit('printer:discover');
    this.on('printer:discovered', (data) => {
      callback(data.printers);
    });
  }

  // WiFi-related methods
  public scanNetworks(printerId: string): void {
    if (!this.socket) return;

    this.socket.emit('printer:scanNetworks', printerId);
  }

  public configureWiFi(printerId: string, config: { ssid: string; password: string; security: string }): void {
    if (!this.socket) return;

    this.socket.emit('printer:configureWiFi', printerId, config);
  }

  public getWiFiStatus(printerId: string, callback: (status: WiFiStatus) => void) {
    if (!this.socket) return;

    this.on('printer:wiFiStatus', (data) => {
      if (data.printerId === printerId) {
        callback(data.status);
      }
    });
  }

  public testConnection(printerId: string): void {
    if (!this.socket) return;

    this.socket.emit('printer:testConnection', printerId);
  }

  public on<T extends keyof WebSocketEvents>(event: T, callback: EventCallback) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(callback);
  }

  public off<T extends keyof WebSocketEvents>(event: T, callback: EventCallback) {
    this.eventHandlers.get(event)?.delete(callback);
  }

  public emit<T extends keyof WebSocketEvents>(
    event: T,
    ...args: Parameters<WebSocketEvents[T]>
  ): void {
    if (!this.socket) return;
    this.socket.emit(event, ...args);
  }

  public onWiFiStatus(callback: (status: WiFiStatus) => void): void {
    this.socket.on('printer:wifi-status', callback);
  }

  public onNetworksFound(callback: (networks: Network[]) => void): void {
    this.socket.on('printer:networksFound', callback);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default WebSocketService; 