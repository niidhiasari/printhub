import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid,
  Card, 
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeviceWiFiStatus from '../components/DeviceWiFiStatus';
import MockApiService from '../services/mockApiService';
import { Network } from '../types/websocket';
import { Wifi as WifiIcon, Add as AddIcon, Settings as SettingsIcon, Refresh } from '@mui/icons-material';

interface Printer {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'busy';
  lastConnection: string;
  ipAddress?: string;
  networkName?: string;
}

const MyPrinters: React.FC = () => {
  const navigate = useNavigate();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const mockApi = MockApiService.getInstance();

  useEffect(() => {
    loadNetworksAndPrinters();
  }, []);

  const loadNetworksAndPrinters = async () => {
    setIsLoading(true);
    try {
      // Get networks from mock API
      const foundNetworks = await mockApi.getAvailableNetworks();
      setNetworks(foundNetworks);
      
      // Current Network for assigning to printers
      const currentNetwork = await mockApi.getCurrentNetwork();
      
      // Mock printer data with network information
      setPrinters([
        {
          id: 'printer1',
          name: 'Office Printer',
          model: 'XYZ-1000',
          status: 'online',
          lastConnection: '2023-04-04T15:30:00Z',
          ipAddress: '192.168.1.100',
          networkName: 'OfficeNetwork'
        },
        {
          id: 'printer2',
          name: 'Workshop Printer',
          model: 'XYZ-2000',
          status: 'offline',
          lastConnection: '2023-04-03T09:15:00Z',
          networkName: currentNetwork // This will be MyHomeWiFi
        },
        {
          id: 'printer3',
          name: 'Home Printer',
          model: 'XYZ-3000',
          status: 'busy',
          lastConnection: '2023-04-04T14:45:00Z',
          ipAddress: '192.168.1.101',
          networkName: 'PrinterNet'
        }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScanNetworks = async () => {
    setIsScanning(true);
    try {
      // Use the mock API service to scan for networks
      const foundNetworks = await mockApi.scanNetworks();
      setNetworks(foundNetworks);
      
      // In a real app, you would also call the WebSocketService
      // wsService.scanNetworks('some-printer-id');
    } catch (error) {
      console.error('Error scanning networks:', error);
    } finally {
      setIsScanning(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success.main';
      case 'offline': return 'error.main';
      case 'busy': return 'warning.main';
      default: return 'text.secondary';
    }
  };
  
  const handlePrinterClick = (printerId: string) => {
    navigate(`/printer/${printerId}`);
  };
  
  const handleConfigureWiFi = (printerId: string) => {
    navigate(`/printer/${printerId}/wifi`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
          My Printers
        </Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            onClick={loadNetworksAndPrinters}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={24} /> : <Refresh sx={{ fontSize: 28 }} />}
            sx={{
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: '8px',
              boxShadow: 3
            }}
          >
            FORCE REFRESH DATA
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-printer')}
            size="large"
          >
            Add Printer
          </Button>
        </Box>
      </Box>
      
      {/* Device WiFi Status Card */}
      <DeviceWiFiStatus 
        printerNetworks={networks}
        onRefresh={handleScanNetworks}
      />
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {printers.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              You don't have any printers set up yet. Click the "Add Printer" button to get started.
            </Alert>
          ) : (
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" component="h2">
                Your Printers
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<WifiIcon />}
                onClick={handleScanNetworks}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Scan Networks'}
              </Button>
            </Box>
          )}
          
          <Grid container spacing={3}>
            {printers.map(printer => {
              // Check if printer is on same network as device
              const isPrinterOnSameNetwork = networks.some(
                network => network.ssid === printer.networkName
              );
              
              return (
                <Grid item xs={12} md={6} lg={4} key={printer.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: '1 0 auto' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">{printer.name}</Typography>
                        <Box 
                          component="span" 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: getStatusColor(printer.status),
                            display: 'inline-block'
                          }} 
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Model: {printer.model}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        Status: <span style={{ fontWeight: 500, color: getStatusColor(printer.status) }}>
                          {printer.status.charAt(0).toUpperCase() + printer.status.slice(1)}
                        </span>
                      </Typography>
                      
                      {printer.networkName && (
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            my: 1, 
                            p: 1, 
                            bgcolor: isPrinterOnSameNetwork ? 'success.light' : 'warning.light',
                            color: isPrinterOnSameNetwork ? 'success.contrastText' : 'warning.contrastText',
                            borderRadius: 1
                          }}
                        >
                          <WifiIcon fontSize="small" />
                          <Typography variant="body2">
                            Connected to: <b>{printer.networkName}</b>
                          </Typography>
                        </Box>
                      )}
                      
                      {printer.ipAddress && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          IP: {printer.ipAddress}
                        </Typography>
                      )}
                      
                      <Typography variant="body2" color="text.secondary">
                        Last active: {new Date(printer.lastConnection).toLocaleString()}
                      </Typography>
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handlePrinterClick(printer.id)}
                        startIcon={<SettingsIcon fontSize="small" />}
                      >
                        Manage
                      </Button>
                      
                      <Button 
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleConfigureWiFi(printer.id)}
                        startIcon={<WifiIcon fontSize="small" />}
                      >
                        Configure WiFi
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
            
            {/* Add New Printer Card */}
            {printers.length > 0 && (
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  p: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  bgcolor: 'background.default'
                }}>
                  <AddIcon sx={{ fontSize: 48, color: 'action.active', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Add Another Printer
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/add-printer')}
                    sx={{ mt: 2 }}
                  >
                    Add Printer
                  </Button>
                </Card>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default MyPrinters; 