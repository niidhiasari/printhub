import React, { useState, useEffect } from 'react';
import WebSocketService from '../services/websocketService';
import { Network, WiFiStatus } from '../types/websocket';

interface WiFiConfigWizardProps {
  printerId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

interface ConnectionTestResult {
  status: 'success' | 'error' | 'testing';
  message: string;
  details?: string;
}

const WiFiConfigWizard: React.FC<WiFiConfigWizardProps> = ({
  printerId,
  onSuccess,
  onError,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [wifiStatus, setWifiStatus] = useState<WiFiStatus>({ connected: false });
  const [showPassword, setShowPassword] = useState(false);
  const [savedNetworks, setSavedNetworks] = useState<Network[]>([]);
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult>({
    status: 'testing',
    message: 'Testing connection...'
  });
  const [testProgress, setTestProgress] = useState(0);

  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    // Set up WebSocket event listeners
    const handleNetworksFound = (data: { networks: Network[] }) => {
      setNetworks(data.networks);
      setIsScanning(false);
    };

    const handleWiFiStatus = (data: { status: WiFiStatus }) => {
      setWifiStatus(data.status);
    };

    const handleWiFiError = (data: { error: string }) => {
      setIsConfiguring(false);
      onError?.(data.error);
    };

    const handleConnectionTest = (data: { success: boolean; message: string; details?: string }) => {
      setConnectionTest({
        status: data.success ? 'success' : 'error',
        message: data.message,
        details: data.details
      });
      setTestProgress(100);
    };

    wsService.on('printer:networksFound', handleNetworksFound);
    wsService.on('printer:wiFiStatus', handleWiFiStatus);
    wsService.on('printer:wiFiError', handleWiFiError);
    wsService.on('printer:connectionTest', handleConnectionTest);

    // Get initial WiFi status
    fetchWiFiStatus();

    return () => {
      wsService.off('printer:networksFound', handleNetworksFound);
      wsService.off('printer:wiFiStatus', handleWiFiStatus);
      wsService.off('printer:wiFiError', handleWiFiError);
      wsService.off('printer:connectionTest', handleConnectionTest);
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
      setSavedNetworks(data.networks);
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
    setConnectionTest({ status: 'testing', message: 'Testing connection...' });
    setTestProgress(0);

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

      // Start connection test
      const testInterval = setInterval(() => {
        setTestProgress(prev => {
          if (prev >= 90) {
            clearInterval(testInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Wait for test result
      await new Promise(resolve => setTimeout(resolve, 5000));

      if (connectionTest.status === 'success') {
        onSuccess?.();
        onClose?.();
      } else {
        throw new Error(connectionTest.message);
      }
    } catch (error) {
      console.error('Error configuring WiFi:', error);
      onError?.('Failed to configure WiFi');
    } finally {
      setIsConfiguring(false);
    }
  };

  const renderConnectionTest = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-4">Testing Connection</h3>
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="36"
              cx="64"
              cy="64"
            />
            <circle
              className={`text-blue-500 transition-all duration-500 ${
                connectionTest.status === 'success' ? 'text-green-500' :
                connectionTest.status === 'error' ? 'text-red-500' : ''
              }`}
              strokeWidth="8"
              strokeDasharray={226}
              strokeDashoffset={226 - (226 * testProgress) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="36"
              cx="64"
              cy="64"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold">{testProgress}%</span>
          </div>
        </div>
        <div className="mt-4">
          <p className={`text-sm ${
            connectionTest.status === 'success' ? 'text-green-600' :
            connectionTest.status === 'error' ? 'text-red-600' :
            'text-blue-600'
          }`}>
            {connectionTest.message}
          </p>
          {connectionTest.details && (
            <p className="text-sm text-gray-600 mt-2">{connectionTest.details}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium">Current WiFi Status</h3>
        <div className="mt-2 flex items-center justify-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${
            wifiStatus.connected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm">
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
      <button
        onClick={() => setCurrentStep(2)}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Configure WiFi
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Available Networks</h3>
        <button
          onClick={handleScanNetworks}
          disabled={isScanning}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isScanning ? 'Scanning...' : 'Scan Networks'}
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {networks.map((network) => (
          <div
            key={network.ssid}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedNetwork === network.ssid
                ? 'border-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedNetwork(network.ssid)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{network.ssid}</span>
                <span className="text-sm text-gray-500">{network.security}</span>
              </div>
              <span className="text-sm text-gray-500">{network.strength}%</span>
            </div>
            <div className="mt-2">
              <div className="w-full h-1 bg-gray-200 rounded">
                <div
                  className="h-full bg-blue-500 rounded transition-all"
                  style={{ width: `${network.strength}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          disabled={!selectedNetwork}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Enter Network Password</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter the password for {selectedNetwork}
        </p>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter network password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={handleConfigureWiFi}
          disabled={isConfiguring || !password}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isConfiguring ? 'Configuring...' : 'Connect'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">WiFi Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                step < 4 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mt-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderConnectionTest()}
        </div>
      </div>
    </div>
  );
};

export default WiFiConfigWizard; 
