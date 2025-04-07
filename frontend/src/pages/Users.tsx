import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManageIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// User role types
type UserRole = 'admin' | 'operator' | 'viewer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  accessiblePrinters: string[];
  lastActive: string;
  createdAt: string;
}

interface PrinterAccess {
  printerId: string;
  printerName: string;
  hasAccess: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [printerAccess, setPrinterAccess] = useState<PrinterAccess[]>([]);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer' as UserRole,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Mock data
      const mockUsers: User[] = [
        {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          image: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
          accessiblePrinters: ['printer-1', 'printer-2', 'printer-3'],
          lastActive: '2025-04-04T14:30:00Z',
          createdAt: '2025-01-15T09:00:00Z'
        },
        {
          id: 'user-2',
          name: 'John Operator',
          email: 'john@example.com',
          role: 'operator',
          image: 'https://ui-avatars.com/api/?name=John+Operator&background=4CAF50&color=fff',
          accessiblePrinters: ['printer-1', 'printer-2'],
          lastActive: '2025-04-04T10:15:00Z',
          createdAt: '2025-02-20T11:30:00Z'
        },
        {
          id: 'user-3',
          name: 'Sarah Viewer',
          email: 'sarah@example.com',
          role: 'viewer',
          image: 'https://ui-avatars.com/api/?name=Sarah+Viewer&background=FF9800&color=fff',
          accessiblePrinters: ['printer-1'],
          lastActive: '2025-04-03T16:45:00Z',
          createdAt: '2025-03-10T14:00:00Z'
        },
        {
          id: 'user-4',
          name: 'Mike Technician',
          email: 'mike@example.com',
          role: 'operator',
          image: 'https://ui-avatars.com/api/?name=Mike+Technician&background=4CAF50&color=fff',
          accessiblePrinters: ['printer-2', 'printer-3'],
          lastActive: '2025-04-02T09:20:00Z',
          createdAt: '2025-03-25T10:15:00Z'
        }
      ];

      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPrinterAccess = (userId: string) => {
    // Mock printer access data
    const printers = [
      { printerId: 'printer-1', printerName: 'Office Printer', hasAccess: false },
      { printerId: 'printer-2', printerName: 'Workshop Printer', hasAccess: false },
      { printerId: 'printer-3', printerName: 'Home Printer', hasAccess: false }
    ];

    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedPrinters = printers.map(printer => ({
        ...printer,
        hasAccess: user.accessiblePrinters.includes(printer.printerId)
      }));
      setPrinterAccess(updatedPrinters);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setRoleFilter(event.target.value);
  };

  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.role) {
      return; // Show validation error
    }

    const userId = `user-${users.length + 1}`;
    const now = new Date().toISOString();
    
    const user: User = {
      id: userId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=4CAF50&color=fff`,
      accessiblePrinters: [],
      lastActive: now,
      createdAt: now
    };

    setUsers([...users, user]);
    setIsAddUserDialogOpen(false);
    // Reset form
    setNewUser({
      name: '',
      email: '',
      role: 'viewer',
    });
  };

  const handleEditUser = () => {
    if (!currentUser) return;

    // Update user with printer access changes
    const updatedUser = {
      ...currentUser,
      accessiblePrinters: printerAccess
        .filter(printer => printer.hasAccess)
        .map(printer => printer.printerId)
    };

    const updatedUsers = users.map(user => 
      user.id === currentUser.id ? updatedUser : user
    );

    setUsers(updatedUsers);
    setIsEditUserDialogOpen(false);
    setCurrentUser(null);
  };

  const handleDeleteUser = () => {
    if (!currentUser) return;

    const updatedUsers = users.filter(user => user.id !== currentUser.id);
    setUsers(updatedUsers);
    setIsDeleteDialogOpen(false);
    setCurrentUser(null);
  };

  const handleOpenEditDialog = (user: User) => {
    setCurrentUser(user);
    loadPrinterAccess(user.id);
    setIsEditUserDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handlePrinterAccessChange = (printerId: string, hasAccess: boolean) => {
    const updatedAccess = printerAccess.map(printer => 
      printer.printerId === printerId ? { ...printer, hasAccess } : printer
    );
    setPrinterAccess(updatedAccess);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'error';
      case 'operator': return 'primary';
      case 'viewer': return 'success';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'operator': return <ManageIcon />;
      case 'viewer': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
          User Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          onClick={() => setIsAddUserDialogOpen(true)}
        >
          Add User
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name or email"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="role-filter-label">Filter by Role</InputLabel>
              <Select
                labelId="role-filter-label"
                value={roleFilter}
                label="Filter by Role"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Administrators</MenuItem>
                <MenuItem value="operator">Operators</MenuItem>
                <MenuItem value="viewer">Viewers</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4} display="flex" justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={loadUsers}
              disabled={isLoading}
            >
              Refresh Users
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Accessible Printers</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found matching your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={user.image} 
                          alt={user.name}
                          sx={{ mr: 2, width: 40, height: 40 }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body1" fontWeight="medium">
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        color={getRoleBadgeColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.accessiblePrinters.length} printer(s)</TableCell>
                    <TableCell>{formatDate(user.lastActive)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit User">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(user)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog(user)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add User Dialog */}
      <Dialog 
        open={isAddUserDialogOpen} 
        onClose={() => setIsAddUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonAddIcon sx={{ mr: 1 }} />
            Add New User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Full Name"
                fullWidth
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  label="Role"
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="operator">Operator</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddUserDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" color="primary">Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog 
        open={isEditUserDialogOpen} 
        onClose={() => setIsEditUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <EditIcon sx={{ mr: 1 }} />
              Edit User
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setIsEditUserDialogOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentUser && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  src={currentUser.image} 
                  alt={currentUser.name}
                  sx={{ mr: 2, width: 48, height: 48 }}
                >
                  {currentUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{currentUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    <EmailIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    {currentUser.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  <SecurityIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  User Role
                </Typography>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={currentUser.role}
                    label="Role"
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as UserRole })}
                  >
                    <MenuItem value="admin">Administrator</MenuItem>
                    <MenuItem value="operator">Operator</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                <PrintIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Printer Access
              </Typography>
              <Paper variant="outlined" sx={{ mt: 2, p: 0 }}>
                <List disablePadding>
                  {printerAccess.map((printer, index) => (
                    <React.Fragment key={printer.printerId}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemIcon>
                          <PrintIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={printer.printerName} 
                        />
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={printer.hasAccess}
                              onChange={(e) => handlePrinterAccessChange(printer.printerId, e.target.checked)}
                            />
                          }
                          label={printer.hasAccess ? "Access Granted" : "No Access"}
                          sx={{ mr: 0 }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditUserDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleEditUser} variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {currentUser?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users; 