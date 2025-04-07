import React, { useState, useEffect } from 'react';
import WebSocketService from '../services/websocketService';
import { Network, WiFiStatus } from '../types/websocket';

interface WiFiManagerProps {
  printerId: string;
}

const WiFiManager: React.FC<WiFiManagerProps> = ({ printerId }) => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wifiStatus, setWifiStatus] = useState<WiFiStatus>({ connected: false });

  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    const handleNetworksFound = (data: { networks: Network[] }) => {
      setNetworks(data.networks);
      setIsScanning(false);
    };

    const handleWiFiStatus = (data: { status: WiFiStatus }) => {
      setWifiStatus(data.status);
    };

    const handleWiFiError = (data: { error: string }) => {
      setError(data.error);
      setIsConfiguring(false);
    };

    wsService.on('printer:networksFound', handleNetworksFound);
    wsService.on('printer:wiFiStatus', handleWiFiStatus);
    wsService.on('printer:wiFiError', handleWiFiError);

    // Get initial WiFi status
    wsService.emit('printer:scanNetworks', printerId);

    return () => {
      wsService.off('printer:networksFound', handleNetworksFound);
      wsService.off('printer:wiFiStatus', handleWiFiStatus);
      wsService.off('printer:wiFiError', handleWiFiError);
    };
  }, [printerId]);

  const handleScan = () => {
    setIsScanning(true);
    setError(null);
    wsService.emit('printer:scanNetworks', printerId);
  };

  const handleConnect = async () => {
    if (!selectedNetwork || (!selectedNetwork.open && !password)) {
      setError('Please select a network and enter password if required');
      return;
    }

    setIsConfiguring(true);
    setError(null);

    wsService.emit('printer:configureWiFi', {
      printerId,
      config: {
        ssid: selectedNetwork.ssid,
        password: password,
        securityType: selectedNetwork.security
      }
    });
  };

  const getSignalStrengthIcon = (strength: number) => {
    if (strength >= 80) return '📶';
    if (strength >= 60) return '▂▄▆_';
    if (strength >= 40) return '▂▄__';
    return '▂___';
  };

  const getSecurityIcon = (security: string) => {
    return security === 'none' ? '🔓' : '🔒';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">WiFi Networks</h3>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isScanning ? 'Scanning...' : 'Scan Networks'}
        </button>
      </div>

      {/* Current Connection Status */}
      {wifiStatus.connected && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-medium">Connected to {wifiStatus.ssid}</p>
              <p className="text-sm text-green-600">IP: {wifiStatus.ipAddress}</p>
            </div>
            <div className="text-green-700">
              {getSignalStrengthIcon(wifiStatus.signalStrength || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Network List */}
      <div className="space-y-4 mb-6">
        {networks.map((network) => (
          <div
            key={network.ssid}
            onClick={() => setSelectedNetwork(network)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedNetwork?.ssid === network.ssid
                ? 'border-blue-500 bg-blue-50'
                : 'hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{network.ssid}</span>
                  <span className="text-gray-500">{getSecurityIcon(network.security)}</span>
                </div>
                <p className="text-sm text-gray-500">{network.security}</p>
              </div>
              <div className="text-gray-600">
                {getSignalStrengthIcon(network.strength)}
                <span className="ml-2 text-sm">{network.strength}%</span>
              </div>
            </div>
          </div>
        ))}

        {networks.length === 0 && !isScanning && (
          <div className="text-center py-8 text-gray-500">
            No networks found. Click "Scan Networks" to search for available networks.
          </div>
        )}

        {isScanning && (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-gray-600">Scanning for networks...</p>
          </div>
        )}
      </div>

      {/* Connection Form */}
      {selectedNetwork && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium mb-4">Connect to {selectedNetwork.ssid}</h4>
          
          {!selectedNetwork.open && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter network password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setSelectedNetwork(null);
                setPassword('');
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={isConfiguring}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isConfiguring ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WiFiManager; 