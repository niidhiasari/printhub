import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button
} from '@mui/material';
import { 
  Print as PrintIcon, 
  Wifi as WifiIcon, 
  Speed as SpeedIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MockApiService from '../services/mockApiService';
import { Network } from '../types/websocket';

interface PrintStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
}

interface SystemStatus {
  onlinePrinters: number;
  offlinePrinters: number;
  activePrints: number;
  systemAlerts: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<string>('');
  const [printStats, setPrintStats] = useState<PrintStats>({
    total: 0,
    active: 0,
    completed: 0,
    failed: 0
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    onlinePrinters: 0,
    offlinePrinters: 0,
    activePrints: 0,
    systemAlerts: 0
  });
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const mockApi = MockApiService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get current network
      const currentNetwork = await mockApi.getCurrentNetwork();
      setNetworkStatus(currentNetwork);

      // Set mock data for dashboard
      setPrintStats({
        total: 156,
        active: 3,
        completed: 148,
        failed: 5
      });

      setSystemStatus({
        onlinePrinters: 2,
        offlinePrinters: 1,
        activePrints: 3,
        systemAlerts: 1
      });

      setRecentActivity([
        'Workshop Printer completed job "Gear Assembly" (10 minutes ago)',
        'Office Printer started job "Phone Stand" (25 minutes ago)',
        'Home Printer went offline (2 hours ago)',
        'Workshop Printer completed job "Robot Arm" (4 hours ago)',
        'New printer "Office Printer" connected (1 day ago)'
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
          Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={loadDashboardData}
          disabled={isLoading}
        >
          Refresh Dashboard
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Network Status */}
          <Grid item xs={12}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                mb: 3, 
                borderLeft: '4px solid', 
                borderColor: 'primary.main',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <WifiIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Device Network
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Connected to: <strong>{networkStatus}</strong>
                </Typography>
              </Box>
              <Button 
                variant="text" 
                color="primary" 
                sx={{ ml: 'auto' }}
                onClick={() => navigate('/my-printers')}
              >
                View Details
              </Button>
            </Paper>
          </Grid>

          {/* System Status Cards */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PrintIcon sx={{ mr: 1 }} /> 
                Printer Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Online: <strong>{systemStatus.onlinePrinters}</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Offline: <strong>{systemStatus.offlinePrinters}</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PrintIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Active Prints: <strong>{systemStatus.activePrints}</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Alerts: <strong>{systemStatus.systemAlerts}</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => navigate('/my-printers')}
              >
                Manage Printers
              </Button>
            </Paper>
          </Grid>

          {/* Print Statistics */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SpeedIcon sx={{ mr: 1 }} /> 
                Print Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BuildIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Total Jobs: <strong>{printStats.total}</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PrintIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Active: <strong>{printStats.active}</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Completed: <strong>{printStats.completed}</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Failed: <strong>{printStats.failed}</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => navigate('/print-jobs')}
              >
                View Print Jobs
              </Button>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.includes('completed') ? (
                          <CheckCircleIcon color="success" />
                        ) : activity.includes('started') ? (
                          <PrintIcon color="primary" />
                        ) : activity.includes('offline') ? (
                          <ErrorIcon color="error" />
                        ) : activity.includes('connected') ? (
                          <WifiIcon color="primary" />
                        ) : (
                          <WarningIcon color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={activity} />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="text" color="primary">
                  View All Activity
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard; 