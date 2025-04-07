import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  useTheme, 
  Badge, 
  CircularProgress,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';
import { 
  Wifi as WifiIcon, 
  Print as PrintIcon, 
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import MockApiService from '../services/mockApiService';

const Navigation: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentNetwork, setCurrentNetwork] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mockApi = MockApiService.getInstance();

  useEffect(() => {
    const getNetworkInfo = async () => {
      try {
        const networkName = await mockApi.getCurrentNetwork();
        setCurrentNetwork(networkName);
      } catch (error) {
        console.error('Error fetching network info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getNetworkInfo();
  }, []);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <DashboardIcon /> 
    },
    { 
      label: 'My Printers', 
      path: '/my-printers', 
      icon: <PrintIcon /> 
    },
    { 
      label: 'Print Jobs', 
      path: '/print-jobs', 
      icon: <AssignmentIcon /> 
    },
    { 
      label: 'Users', 
      path: '/users', 
      icon: <GroupIcon /> 
    },
    { 
      label: 'Settings', 
      path: '/settings', 
      icon: <SettingsIcon /> 
    }
  ];

  const drawer = (
    <Box onClick={toggleDrawer} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PrintIcon sx={{ mr: 1 }} />
        3D Printer Hub
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              selected={isActive(item.path)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          WiFi Connection
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WifiIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="body2" fontWeight="medium">
            {isLoading ? 'Detecting...' : currentNetwork}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <AppBar position="static" color="default" elevation={2} sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: theme.palette.primary.main,
          flexGrow: { xs: 1, md: 0 },
          mr: 4
        }}>
          <PrintIcon sx={{ mr: 1 }} />
          3D Printer Hub
        </Typography>
        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.path}
              color={isActive(item.path) ? 'primary' : 'inherit'}
              startIcon={item.icon}
              variant={isActive(item.path) ? 'contained' : 'text'}
              sx={{ 
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                borderRadius: '20px',
                px: 2
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
        
        {/* WiFi indicator in the top right */}
        <Badge 
          color="success" 
          variant="dot" 
          overlap="circular"
          badgeContent=" "
          sx={{ '& .MuiBadge-badge': { width: 12, height: 12 } }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Button 
            component={Link}
            to="/my-printers"
            startIcon={isLoading ? <CircularProgress size={24} /> : <WifiIcon sx={{ fontSize: 28 }} />}
            color="primary"
            variant="contained"
            size="large"
            sx={{ 
              fontWeight: 'bold',
              minWidth: '150px',
              borderRadius: '20px',
              py: 1,
              fontSize: '1.1rem'
            }}
          >
            {isLoading ? 'Loading...' : currentNetwork}
          </Button>
        </Badge>
      </Toolbar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navigation; 