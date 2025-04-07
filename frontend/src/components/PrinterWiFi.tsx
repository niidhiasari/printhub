import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { Wifi as WifiIcon } from '@mui/icons-material';
import { Network, WiFiStatus } from '../types/websocket';

const steps = ['Select Network', 'Enter Password', 'Test Connection'];

interface PrinterWiFiProps {
  onConnect?: (network: Network, password: string) => void;
  onTestConnection?: () => void;
}

const PrinterWiFi: React.FC<PrinterWiFiProps> = ({ onConnect, onTestConnection }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [password, setPassword] = useState('');
  const [scanning, setScanning] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<WiFiStatus | null>(null);

  useEffect(() => {
    // Simulate network scanning
    setTimeout(() => {
      setNetworks([
        { ssid: 'Network 1', security: 'WPA2', strength: 80, open: false },
        { ssid: 'Network 2', security: 'WPA2', strength: 60, open: false },
      ]);
      setScanning(false);
    }, 2000);
  }, []);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onTestConnection?.();
    } else if (activeStep === 1 && selectedNetwork) {
      onConnect?.(selectedNetwork, password);
      setActiveStep((prev) => prev + 1);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        WiFi Configuration
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, mb: 4 }}>
        {activeStep === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Available Networks
            </Typography>
            {scanning ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography>Scanning for networks...</Typography>
              </Box>
            ) : (
              <List>
                {networks.map((network) => (
                  <ListItem
                    key={network.ssid}
                    button
                    selected={selectedNetwork?.ssid === network.ssid}
                    onClick={() => setSelectedNetwork(network)}
                  >
                    <ListItemIcon>
                      <WifiIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={network.ssid}
                      secondary={`${network.security} - Signal: ${network.strength}%`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {activeStep === 1 && selectedNetwork && (
          <>
            <Typography variant="h6" gutterBottom>
              Enter Password for {selectedNetwork.ssid}
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Network Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mt: 2 }}
            />
          </>
        )}

        {activeStep === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Testing Connection
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>
                {connectionStatus?.connected
                  ? `Connected to ${connectionStatus.ssid}`
                  : 'Testing connection...'}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={
            (activeStep === 0 && !selectedNetwork) ||
            (activeStep === 1 && !password)
          }
        >
          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default PrinterWiFi; 