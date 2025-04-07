export interface PrinterStatus {
  temperature: {
    bed: number;
    nozzle: number;
  };
  progress: number;
  status: 'idle' | 'printing' | 'paused' | 'error' | 'offline';
  position: {
    x: number;
    y: number;
    z: number;
  };
  fanSpeed: number;
  printSpeed: number;
  timeRemaining: number;
  error?: string;
}

export interface PrintJobProgress {
  jobId: string;
  progress: number;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  timeElapsed: number;
  timeRemaining: number;
  error?: string;
}

export interface PrinterConnection {
  socketId: string;
  printerId: string;
  status: 'connected' | 'disconnected';
  lastUpdate: Date;
  ipAddress?: string;
  port?: number;
  firmwareVersion?: string;
}

export interface WebSocketEvents {
  // Client to Server events
  'printer:connect': (printerId: string) => void;
  'printer:disconnect': (printerId: string) => void;
  'printer:status': (data: { printerId: string; status: PrinterStatus }) => void;
  'printer:command': (data: { printerId: string; command: string; params?: any }) => void;
  'printJob:progress': (data: PrintJobProgress) => void;
  'printer:discover': () => void;

  // Server to Client events
  'printer:connected': (data: { printerId: string; status: 'connected' }) => void;
  'printer:disconnected': (data: { printerId: string }) => void;
  'printer:statusUpdate': (data: { printerId: string; status: PrinterStatus; timestamp: Date }) => void;
  'printer:discovered': (data: { printers: Array<{ id: string; name: string; ip: string; port: number }> }) => void;
  'printer:error': (data: { printerId: string; error: string }) => void;
  'printJob:progressUpdate': (data: PrintJobProgress) => void;
  'error': (data: { message: string }) => void;
} 