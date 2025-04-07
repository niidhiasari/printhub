import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { WifiRounded, WifiOff, CheckCircle, Warning, Refresh } from '@mui/icons-material';
import { Network } from '../types/websocket';
import MockApiService from '../services/mockApiService';

interface DeviceWiFiStatusProps {
  printerNetworks?: Network[];
  onRefresh?: () => void;
}

const DeviceWiFiStatus: React.FC<DeviceWiFiStatusProps> = ({ 
  printerNetworks = [],
  onRefresh 
}) => {
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDemoMode = true;
  const mockApi = MockApiService.getInstance();

  // Function to get network information
  const getDeviceNetworkInfo = async () => {
    setIsLoading(true);
    
    try {
      // Get network from our mock API
      const networkName = await mockApi.getCurrentNetwork();
      setCurrentNetwork(networkName);
      setError(null);
    } catch (err) {
      console.error("Failed to get network info:", err);
      setError('Unable to detect network connection');
      setCurrentNetwork(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDeviceNetworkInfo();
  }, []);

  const refreshNetworkStatus = () => {
    getDeviceNetworkInfo();
    if (onRefresh) onRefresh();
  };

  // Check if printer is on same network as device
  const isPrinterOnSameNetwork = printerNetworks.some(
    network => network.ssid === currentNetwork
  );

  return (
    <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" color="primary.main" fontWeight="bold">
          Your Device Connection
        </Typography>
        <Button 
          startIcon={<Refresh />}
          size="medium" 
          variant="contained"
          onClick={refreshNetworkStatus}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>
      
      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          For security reasons, browsers restrict access to WiFi information. 
          This is a simulated connection for demonstration.
        </Alert>
      )}
      
      <Divider sx={{ mb: 2 }} />
      
      {isLoading ? (
        <Box display="flex" alignItems="center" gap={2} p={3} justifyContent="center">
          <CircularProgress size={24} />
          <Typography>Detecting network connection...</Typography>
        </Box>
      ) : error ? (
        <Box display="flex" alignItems="center" gap={2} color="error.main" p={3} justifyContent="center">
          <WifiOff />
          <Typography>{error}</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 3, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: 2,
            mb: 2 
          }}>
            <WifiRounded sx={{ mr: 2, fontSize: 60 }} />
            <Box>
              <Typography variant="h2" fontWeight="bold" sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                {currentNetwork}
              </Typography>
              <Typography variant="h6">
                This is your current active WiFi connection
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Network Compatibility with Printers
          </Typography>
          
          {printerNetworks.length > 0 ? (
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              {printerNetworks.map(network => (
                <ListItem key={network.ssid} divider sx={{ py: 1 }}>
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center">
                        <WifiRounded fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography fontWeight="medium">{network.ssid}</Typography>
                      </Box>
                    }
                    secondary={`Security: ${network.security}, Signal: ${network.strength}%`}
                  />
                  {network.ssid === currentNetwork ? (
                    <Chip 
                      icon={<CheckCircle fontSize="small" />} 
                      label="Same Network" 
                      color="success" 
                      size="small"
                    />
                  ) : (
                    <Chip 
                      icon={<Warning fontSize="small" />} 
                      label="Different Network" 
                      color="warning" 
                      size="small"
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="warning">
              No printer networks detected. Click "Scan Networks" on the WiFi manager below.
            </Alert>
          )}
          
          {isPrinterOnSameNetwork ? (
            <Box mt={2} p={2} bgcolor="success.light" borderRadius={1}>
              <Typography variant="body1" color="success.contrastText" fontWeight="medium">
                ✓ Your device and printer are on the same network.
              </Typography>
              <Typography variant="body2" color="success.contrastText">
                Communication should work properly between your device and printer.
              </Typography>
            </Box>
          ) : printerNetworks.length > 0 && (
            <Box mt={2} p={2} bgcolor="warning.light" borderRadius={1}>
              <Typography variant="body1" color="warning.contrastText" fontWeight="medium">
                ⚠️ Network Mismatch Detected
              </Typography>
              <Typography variant="body2" color="warning.contrastText">
                Your device ({currentNetwork}) and printer are on different networks. 
                For proper communication, connect your printer to "{currentNetwork}" or 
                connect your device to the printer's network.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default DeviceWiFiStatus; 