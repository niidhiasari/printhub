import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Print as PrintIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Loop as LoopIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30);
  const [slicerPath, setSlicerPath] = useState('/usr/local/bin/slicer');
  const [printTemperature, setPrintTemperature] = useState(200);
  const [bedTemperature, setBedTemperature] = useState(60);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dataUsage, setDataUsage] = useState({
    logs: 1.2, // GB
    models: 3.8, // GB
    firmware: 0.5, // GB
    tempFiles: 0.7 // GB
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to a backend
    console.log('Saving settings...');
    setTimeout(() => {
      setSaveSuccess(true);
    }, 500);
  };

  const handleClearData = (dataType: string) => {
    // In a real app, this would clear the specified data
    console.log(`Clearing ${dataType}...`);
    setDataUsage(prev => ({
      ...prev,
      [dataType]: 0
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
          Settings
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          color="primary"
        >
          Save Changes
        </Button>
      </Box>

      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              icon={<SettingsIcon />} 
              iconPosition="start" 
              label="General" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<PrintIcon />} 
              iconPosition="start" 
              label="Printer Defaults" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<PaletteIcon />} 
              iconPosition="start" 
              label="Appearance" 
              {...a11yProps(2)} 
            />
            <Tab 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
              label="Notifications" 
              {...a11yProps(3)} 
            />
            <Tab 
              icon={<StorageIcon />} 
              iconPosition="start" 
              label="Data & Storage" 
              {...a11yProps(4)} 
            />
            <Tab 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              label="Security" 
              {...a11yProps(5)} 
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* General Settings */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                System Settings
              </Typography>
              <Box mt={2}>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={autoRefresh} 
                      onChange={(e) => setAutoRefresh(e.target.checked)} 
                    />
                  } 
                  label="Auto-refresh printer status"
                />
                {autoRefresh && (
                  <Box sx={{ mt: 2, ml: 4 }}>
                    <Typography id="auto-refresh-slider" gutterBottom>
                      Refresh interval: {autoRefreshInterval} seconds
                    </Typography>
                    <Slider
                      value={autoRefreshInterval}
                      onChange={(e, newValue) => setAutoRefreshInterval(newValue as number)}
                      aria-labelledby="auto-refresh-slider"
                      valueLabelDisplay="auto"
                      step={5}
                      marks
                      min={5}
                      max={60}
                    />
                  </Box>
                )}
              </Box>
              
              <Box mt={3}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel>Default Units</InputLabel>
                  <Select
                    value="mm"
                    label="Default Units"
                  >
                    <MenuItem value="mm">Millimeters (mm)</MenuItem>
                    <MenuItem value="inches">Inches (in)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box mt={3}>
                <TextField
                  fullWidth
                  label="Slicer Path"
                  variant="outlined"
                  value={slicerPath}
                  onChange={(e) => setSlicerPath(e.target.value)}
                  helperText="Path to your preferred slicer application"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                User Preferences
              </Typography>
              <Box mt={2}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value="en"
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="zh">中文</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box mt={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value="24"
                    label="Time Format"
                  >
                    <MenuItem value="12">12-hour</MenuItem>
                    <MenuItem value="24">24-hour</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box mt={3}>
                <TextField
                  fullWidth
                  label="Default Save Location"
                  variant="outlined"
                  value="/Users/Documents/3D Prints"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end">
                          <RefreshIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Printer Defaults */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Material Settings
              </Typography>
              
              <Box mt={2}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                  <InputLabel>Default Material</InputLabel>
                  <Select
                    value="pla"
                    label="Default Material"
                  >
                    <MenuItem value="pla">PLA</MenuItem>
                    <MenuItem value="abs">ABS</MenuItem>
                    <MenuItem value="petg">PETG</MenuItem>
                    <MenuItem value="tpu">TPU</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mb: 3 }}>
                  <Typography id="print-temp-slider" gutterBottom>
                    Print Temperature: {printTemperature}°C
                  </Typography>
                  <Slider
                    value={printTemperature}
                    onChange={(e, newValue) => setPrintTemperature(newValue as number)}
                    aria-labelledby="print-temp-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={180}
                    max={250}
                  />
                </Box>
                
                <Box>
                  <Typography id="bed-temp-slider" gutterBottom>
                    Bed Temperature: {bedTemperature}°C
                  </Typography>
                  <Slider
                    value={bedTemperature}
                    onChange={(e, newValue) => setBedTemperature(newValue as number)}
                    aria-labelledby="bed-temp-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={0}
                    max={110}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Print Settings
              </Typography>
              
              <Box mt={2}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                  <InputLabel>Default Quality</InputLabel>
                  <Select
                    value="medium"
                    label="Default Quality"
                  >
                    <MenuItem value="draft">Draft (0.3mm)</MenuItem>
                    <MenuItem value="medium">Medium (0.2mm)</MenuItem>
                    <MenuItem value="high">High (0.1mm)</MenuItem>
                    <MenuItem value="ultra">Ultra (0.05mm)</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Print Speed"
                  variant="outlined"
                  type="number"
                  value={60}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">mm/s</InputAdornment>,
                  }}
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  fullWidth
                  label="Infill Density"
                  variant="outlined"
                  type="number"
                  value={20}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  sx={{ mb: 3 }}
                />
                
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Generate support structures" 
                />
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Appearance Settings */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Theme Settings
              </Typography>
              
              <Box mt={2}>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={darkMode} 
                      onChange={(e) => setDarkMode(e.target.checked)} 
                    />
                  } 
                  label="Dark Mode"
                />
                
                <Box mt={3}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                    <InputLabel>Color Theme</InputLabel>
                    <Select
                      value="blue"
                      label="Color Theme"
                    >
                      <MenuItem value="blue">Blue</MenuItem>
                      <MenuItem value="green">Green</MenuItem>
                      <MenuItem value="purple">Purple</MenuItem>
                      <MenuItem value="orange">Orange</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box mt={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Font Size</InputLabel>
                    <Select
                      value="medium"
                      label="Font Size"
                    >
                      <MenuItem value="small">Small</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="large">Large</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Layout Options
              </Typography>
              
              <Box mt={2}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                  <InputLabel>Default View</InputLabel>
                  <Select
                    value="dashboard"
                    label="Default View"
                  >
                    <MenuItem value="dashboard">Dashboard</MenuItem>
                    <MenuItem value="myPrinters">My Printers</MenuItem>
                    <MenuItem value="printJobs">Print Jobs</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Show printer thumbnails" 
                />
                
                <Box mt={2}>
                  <FormControlLabel 
                    control={<Switch defaultChecked />} 
                    label="Compact table view" 
                  />
                </Box>
                
                <Box mt={2}>
                  <FormControlLabel 
                    control={<Switch defaultChecked />} 
                    label="Show network status in header" 
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Notifications Settings */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              
              <Box mt={2}>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={notificationsEnabled} 
                      onChange={(e) => setNotificationsEnabled(e.target.checked)} 
                    />
                  } 
                  label="Enable Notifications"
                />
                
                {notificationsEnabled && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Notification Types
                    </Typography>
                    
                    <FormControlLabel 
                      control={<Switch defaultChecked />} 
                      label="Print completed" 
                    />
                    
                    <Box mt={1}>
                      <FormControlLabel 
                        control={<Switch defaultChecked />} 
                        label="Print failed" 
                      />
                    </Box>
                    
                    <Box mt={1}>
                      <FormControlLabel 
                        control={<Switch defaultChecked />} 
                        label="Printer offline" 
                      />
                    </Box>
                    
                    <Box mt={1}>
                      <FormControlLabel 
                        control={<Switch defaultChecked />} 
                        label="Temperature warnings" 
                      />
                    </Box>
                    
                    <Box mt={1}>
                      <FormControlLabel 
                        control={<Switch />} 
                        label="Firmware updates" 
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Delivery Methods
              </Typography>
              
              <Box mt={2}>
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Browser notifications" 
                />
                
                <Box mt={2}>
                  <FormControlLabel 
                    control={<Switch />} 
                    label="Email notifications" 
                  />
                </Box>
                
                <Box mt={3}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    placeholder="your@email.com"
                    disabled={!notificationsEnabled}
                  />
                </Box>
                
                <Box mt={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Notification Frequency</InputLabel>
                    <Select
                      value="immediate"
                      label="Notification Frequency"
                      disabled={!notificationsEnabled}
                    >
                      <MenuItem value="immediate">Immediate</MenuItem>
                      <MenuItem value="hourly">Hourly Digest</MenuItem>
                      <MenuItem value="daily">Daily Digest</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {/* Data & Storage Settings */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Storage Usage
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Print Models" 
                    secondary={`${dataUsage.models.toFixed(1)} GB used`} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleClearData('models')}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Log Files" 
                    secondary={`${dataUsage.logs.toFixed(1)} GB used`} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleClearData('logs')}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Firmware Updates" 
                    secondary={`${dataUsage.firmware.toFixed(1)} GB used`} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleClearData('firmware')}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Temporary Files" 
                    secondary={`${dataUsage.tempFiles.toFixed(1)} GB used`} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleClearData('tempFiles')}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Total: {Object.values(dataUsage).reduce((a, b) => a + b, 0).toFixed(1)} GB
                </Typography>
              </Box>
              
              <Box mt={3} display="flex" gap={2}>
                <Button variant="outlined" startIcon={<DeleteIcon />} color="error">
                  Clear All Data
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Backup & Sync
              </Typography>
              
              <Box mt={2}>
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Automatic backup" 
                />
                
                <Box mt={3}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                    <InputLabel>Backup Frequency</InputLabel>
                    <Select
                      value="daily"
                      label="Backup Frequency"
                    >
                      <MenuItem value="hourly">Hourly</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box mt={2}>
                  <TextField
                    fullWidth
                    label="Backup Location"
                    variant="outlined"
                    value="/Users/backups/3dprinter"
                    sx={{ mb: 3 }}
                  />
                </Box>
                
                <Box display="flex" gap={2}>
                  <Button variant="outlined" startIcon={<BackupIcon />}>
                    Backup Now
                  </Button>
                  <Button variant="outlined" startIcon={<LoopIcon />}>
                    Restore Backup
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          {/* Security Settings */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Account Security
              </Typography>
              
              <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Change Password
                </Typography>
                
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
                
                <Button variant="contained" color="primary">
                  Update Password
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Access Control
              </Typography>
              
              <Box mt={2}>
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Require authentication for sensitive operations" 
                />
                
                <Box mt={2}>
                  <FormControlLabel 
                    control={<Switch />} 
                    label="Two-factor authentication" 
                  />
                </Box>
                
                <Box mt={3}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                    <InputLabel>Session Timeout</InputLabel>
                    <Select
                      value="30"
                      label="Session Timeout"
                    >
                      <MenuItem value="15">15 minutes</MenuItem>
                      <MenuItem value="30">30 minutes</MenuItem>
                      <MenuItem value="60">1 hour</MenuItem>
                      <MenuItem value="240">4 hours</MenuItem>
                      <MenuItem value="0">Never</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  API Access
                </Typography>
                
                <Box mt={1}>
                  <FormControlLabel 
                    control={<Switch />} 
                    label="Enable API access" 
                  />
                </Box>
                
                <Box mt={2}>
                  <Button variant="outlined" startIcon={<RefreshIcon />} disabled>
                    Generate API Key
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSaveSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 