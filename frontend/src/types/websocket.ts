export interface PrinterStatus {
  temperature: number;
  progress: number;
  status: 'idle' | 'printing' | 'paused' | 'error';
  position: { x: number; y: number; z: number };
  fanSpeed: number;
  printSpeed: number;
  timeRemaining: number;
}

export interface PrintJobProgress {
  jobId: string;
  progress: number;
  status: 'printing' | 'paused' | 'completed' | 'cancelled' | 'error';
  timeElapsed: number;
  timeRemaining: number;
  error?: string;
}

export interface Network {
  ssid: string;
  security: string;
  strength: number;
  open: boolean;
}

export interface WiFiStatus {
  connected: boolean;
  ssid?: string;
  ipAddress?: string;
  signalStrength?: number;
  error?: string;
}

export interface DiscoveredPrinter {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  firmwareVersion?: string;
}

export interface WebSocketEvents {
  'printer:connect': (printerId: string) => void;
  'printer:disconnect': (printerId: string) => void;
  'printer:status': (printerId: string, status: PrinterStatus) => void;
  'printer:error': (printerId: string, error: string) => void;
  'printer:job-progress': (printerId: string, progress: PrintJobProgress) => void;
  'printer:wifi-status': (printerId: string, status: WiFiStatus) => void;
  'printer:discovered': (printer: DiscoveredPrinter) => void;
} 