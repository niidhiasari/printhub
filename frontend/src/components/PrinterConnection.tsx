import React, { useEffect, useState } from 'react';
import WebSocketService from '../services/websocketService';
import { PrinterStatus } from '../types/websocket';
import { useParams } from 'react-router-dom';
import WiFiManager from './WiFiManager';
import PrinterControls from './PrinterControls';

const PrinterConnection: React.FC = () => {
  const { printerId } = useParams<{ printerId: string }>();
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus>({
    temperature: { nozzle: 0, bed: 0 },
    progress: 0,
    status: 'idle',
    position: { x: 0, y: 0, z: 0 },
    fanSpeed: 0,
    printSpeed: 100,
    timeRemaining: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    if (!printerId) return;

    const handleStatusUpdate = (data: { status: PrinterStatus }) => {
      setPrinterStatus(data.status);
    };

    const handleConnectionStatus = (data: { connected: boolean; printerId?: string }) => {
      if (!data.printerId || data.printerId === printerId) {
        setIsConnected(data.connected);
      }
    };

    const handleError = (data: { error: string; printerId?: string }) => {
      if (!data.printerId || data.printerId === printerId) {
        setError(data.error);
      }
    };

    // Set up WebSocket event listeners
    wsService.on('printer:status', handleStatusUpdate);
    wsService.on('printer:connectionStatus', handleConnectionStatus);
    wsService.on('printer:error', handleError);

    // Connect to the printer
    wsService.connectToPrinter(printerId);

    return () => {
      wsService.off('printer:status', handleStatusUpdate);
      wsService.off('printer:connectionStatus', handleConnectionStatus);
      wsService.off('printer:error', handleError);
      wsService.disconnectFromPrinter(printerId);
    };
  }, [printerId]);

  const handleCommand = (command: string, params?: any) => {
    if (!printerId) return;
    wsService.sendCommand(printerId, command, params);
  };

  if (!printerId) {
    return <div className="p-4">No printer ID provided</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Printer Connection</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your printer's connection and WiFi settings
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {error && (
              <div className="text-red-600 text-sm">
                Error: {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* WiFi Management */}
        <div>
          <WiFiManager printerId={printerId} />
        </div>

        {/* Printer Controls */}
        <div>
          <PrinterControls
            printerId={printerId}
            status={printerStatus}
            onCommand={handleCommand}
          />
        </div>
      </div>
    </div>
  );
};

export default PrinterConnection; 