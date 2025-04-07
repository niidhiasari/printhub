import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Printer } from '../models/Printer';
import { PrintJob } from '../models/PrintJob';

interface PrinterConnection {
  socketId: string;
  printerId: string;
  status: 'connected' | 'disconnected';
  lastUpdate: Date;
}

class WebSocketService {
  private io: Server;
  private printerConnections: Map<string, PrinterConnection> = new Map();

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      // Handle printer connection
      socket.on('printer:connect', async (printerId: string) => {
        try {
          const printer = await Printer.findById(printerId);
          if (!printer) {
            socket.emit('error', { message: 'Printer not found' });
            return;
          }

          this.printerConnections.set(printerId, {
            socketId: socket.id,
            printerId,
            status: 'connected',
            lastUpdate: new Date()
          });

          socket.join(`printer:${printerId}`);
          socket.emit('printer:connected', { printerId, status: 'connected' });
        } catch (error) {
          socket.emit('error', { message: 'Failed to connect to printer' });
        }
      });

      // Handle printer disconnection
      socket.on('printer:disconnect', (printerId: string) => {
        this.printerConnections.delete(printerId);
        socket.leave(`printer:${printerId}`);
        socket.emit('printer:disconnected', { printerId });
      });

      // Handle printer status updates
      socket.on('printer:status', async (data: { printerId: string; status: any }) => {
        try {
          const { printerId, status } = data;
          const connection = this.printerConnections.get(printerId);
          
          if (connection) {
            connection.lastUpdate = new Date();
            this.io.to(`printer:${printerId}`).emit('printer:statusUpdate', {
              printerId,
              status,
              timestamp: new Date()
            });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to update printer status' });
        }
      });

      // Handle print job progress updates
      socket.on('printJob:progress', async (data: { jobId: string; progress: number }) => {
        try {
          const { jobId, progress } = data;
          const job = await PrintJob.findById(jobId);
          
          if (job) {
            job.progress = progress;
            await job.save();
            
            this.io.emit('printJob:progressUpdate', {
              jobId,
              progress,
              timestamp: new Date()
            });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to update print job progress' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Clean up printer connections
        for (const [printerId, connection] of this.printerConnections.entries()) {
          if (connection.socketId === socket.id) {
            this.printerConnections.delete(printerId);
            this.io.emit('printer:disconnected', { printerId });
            break;
          }
        }
      });
    });
  }

  // Method to get all connected printers
  public getConnectedPrinters(): string[] {
    return Array.from(this.printerConnections.keys());
  }

  // Method to get printer connection status
  public getPrinterConnection(printerId: string): PrinterConnection | undefined {
    return this.printerConnections.get(printerId);
  }

  // Method to broadcast to all clients
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Method to broadcast to specific printer room
  public broadcastToPrinter(printerId: string, event: string, data: any) {
    this.io.to(`printer:${printerId}`).emit(event, data);
  }
}

export default WebSocketService; 