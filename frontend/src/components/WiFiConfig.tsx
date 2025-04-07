import React, { useState, useEffect } from 'react';
import WebSocketService from '../services/websocketService';

interface WiFiConfigProps {
  printerId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface Network {
  ssid: string;
  strength: number;
  security: string;
}

const WiFiConfig: React.FC<WiFiConfigProps> = ({
  printerId,
  onSuccess,
  onError
}) => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [wifiStatus, setWifiStatus] = useState<{
    connected: boolean;
    ssid?: string;
    ipAddress?: string;
    signalStrength?: number;
  }>({ connected: false });

  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    // Set up WebSocket event listeners
    const handleNetworksFound = (data: { networks: Network[] }) => {
      setNetworks(data.networks);
      setIsScanning(false);
    };

    const handleWiFiStatus = (data: any) => {
      setWifiStatus(data);
    };

    const handleWiFiError = (data: { error: string }) => {
      setIsConfiguring(false);
      onError?.(data.error);
    };

    wsService.on('printer:networksFound', handleNetworksFound);
    wsService.on('printer:wiFiStatus', handleWiFiStatus);
    wsService.on('printer:wiFiError', handleWiFiError);

    // Get initial WiFi status
    fetchWiFiStatus();

    return () => {
      wsService.off('printer:networksFound', handleNetworksFound);
      wsService.off('printer:wiFiStatus', handleWiFiStatus);
      wsService.off('printer:wiFiError', handleWiFiError);
    };
  }, [printerId]);

  const fetchWiFiStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/printers/${printerId}/wifi/status`);
      const data = await response.json();
      setWifiStatus(data);
    } catch (error) {
      console.error('Error fetching WiFi status:', error);
      onError?.('Failed to fetch WiFi status');
    }
  };

  const handleScanNetworks = async () => {
    setIsScanning(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/printers/${printerId}/wifi/scan`);
      const data = await response.json();
      setNetworks(data.networks);
    } catch (error) {
      console.error('Error scanning networks:', error);
      onError?.('Failed to scan networks');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfigureWiFi = async () => {
    if (!selectedNetwork) {
      onError?.('Please select a network');
      return;
    }

    setIsConfiguring(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/printers/${printerId}/wifi/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ssid: selectedNetwork,
          password,
          securityType: networks.find(n => n.ssid === selectedNetwork)?.security || 'WPA'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to configure WiFi');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error configuring WiFi:', error);
      onError?.('Failed to configure WiFi');
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">WiFi Configuration</h2>

      {/* Current WiFi Status */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Current Status</h3>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${wifiStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>
            {wifiStatus.connected
              ? `Connected to ${wifiStatus.ssid}`
              : 'Not Connected'}
          </span>
        </div>
        {wifiStatus.connected && (
          <div className="mt-2 text-sm text-gray-600">
            <p>IP Address: {wifiStatus.ipAddress}</p>
            <p>Signal Strength: {wifiStatus.signalStrength}%</p>
          </div>
        )}
      </div>

      {/* Network Selection */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Available Networks</h3>
          <button
            onClick={handleScanNetworks}
            disabled={isScanning}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Scan Networks'}
          </button>
        </div>

        <div className="space-y-2">
          {networks.map((network) => (
            <div
              key={network.ssid}
              className={`p-2 border rounded cursor-pointer ${
                selectedNetwork === network.ssid
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedNetwork(network.ssid)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{network.ssid}</span>
                <span className="text-sm text-gray-500">{network.security}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-24 h-1 bg-gray-200 rounded">
                  <div
                    className="h-full bg-blue-500 rounded"
                    style={{ width: `${network.strength}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">{network.strength}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Network Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter network password"
        />
      </div>

      {/* Configure Button */}
      <button
        onClick={handleConfigureWiFi}
        disabled={isConfiguring || !selectedNetwork}
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        {isConfiguring ? 'Configuring...' : 'Configure WiFi'}
      </button>
    </div>
  );
};

export default WiFiConfig; 