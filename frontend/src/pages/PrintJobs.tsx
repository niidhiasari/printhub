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
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  DeleteOutline as DeleteIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Print as PrintIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PrintJob {
  id: string;
  name: string;
  printer: string;
  status: 'printing' | 'paused' | 'completed' | 'cancelled' | 'failed';
  progress: number;
  startTime: string;
  estimatedEndTime: string;
  filament: string;
  fileSize: string;
}

const PrintJobs: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<PrintJob[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [printerFilter, setPrinterFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadPrintJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, printerFilter, sortBy, printJobs]);

  const loadPrintJobs = async () => {
    setIsLoading(true);
    try {
      // Mock data for print jobs
      const mockJobs: PrintJob[] = [
        {
          id: 'job-1',
          name: 'Phone Stand',
          printer: 'Office Printer',
          status: 'printing',
          progress: 45,
          startTime: '2025-04-04T13:30:00Z',
          estimatedEndTime: '2025-04-04T16:30:00Z',
          filament: '120g',
          fileSize: '15.2 MB'
        },
        {
          id: 'job-2',
          name: 'Gear Assembly',
          printer: 'Workshop Printer',
          status: 'completed',
          progress: 100,
          startTime: '2025-04-04T10:15:00Z',
          estimatedEndTime: '2025-04-04T13:15:00Z',
          filament: '85g',
          fileSize: '8.5 MB'
        },
        {
          id: 'job-3',
          name: 'Desk Organizer',
          printer: 'Home Printer',
          status: 'paused',
          progress: 72,
          startTime: '2025-04-04T09:45:00Z',
          estimatedEndTime: '2025-04-04T15:45:00Z',
          filament: '195g',
          fileSize: '22.7 MB'
        },
        {
          id: 'job-4',
          name: 'Robot Arm',
          printer: 'Workshop Printer',
          status: 'completed',
          progress: 100,
          startTime: '2025-04-03T15:20:00Z',
          estimatedEndTime: '2025-04-03T20:20:00Z',
          filament: '230g',
          fileSize: '35.1 MB'
        },
        {
          id: 'job-5',
          name: 'Prototype Case',
          printer: 'Office Printer',
          status: 'failed',
          progress: 37,
          startTime: '2025-04-03T14:10:00Z',
          estimatedEndTime: '2025-04-03T17:40:00Z',
          filament: '45g',
          fileSize: '12.3 MB'
        },
        {
          id: 'job-6',
          name: 'Plant Pot',
          printer: 'Home Printer',
          status: 'cancelled',
          progress: 18,
          startTime: '2025-04-03T11:05:00Z',
          estimatedEndTime: '2025-04-03T14:05:00Z',
          filament: '78g',
          fileSize: '9.8 MB'
        }
      ];

      setPrintJobs(mockJobs);
    } catch (error) {
      console.error('Error loading print jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...printJobs];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.printer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply printer filter
    if (printerFilter !== 'all') {
      filtered = filtered.filter(job => job.printer === printerFilter);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'progress') {
      filtered.sort((a, b) => b.progress - a.progress);
    }

    setFilteredJobs(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printing': return 'primary';
      case 'paused': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'info';
      case 'failed': return 'error';
      default: return 'primary';
    }
  };

  const getChipColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'printing': return 'primary';
      case 'paused': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'default';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const handleStatusChange = (jobId: string, newStatus: 'printing' | 'paused' | 'cancelled') => {
    const updatedJobs = printJobs.map(job => {
      if (job.id === jobId) {
        return { ...job, status: newStatus };
      }
      return job;
    });
    setPrintJobs(updatedJobs);
  };

  const handleDeleteJob = (jobId: string) => {
    const updatedJobs = printJobs.filter(job => job.id !== jobId);
    setPrintJobs(updatedJobs);
  };

  const getAvailablePrinters = () => {
    const printers = printJobs.map(job => job.printer);
    return ['all', ...new Set(printers)];
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
          Print Jobs
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<PrintIcon />}
          onClick={() => navigate('/my-printers')}
        >
          New Print Job
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="printing">Printing</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="printer-filter-label">Printer</InputLabel>
              <Select
                labelId="printer-filter-label"
                value={printerFilter}
                label="Printer"
                onChange={(e: SelectChangeEvent) => setPrinterFilter(e.target.value)}
              >
                {getAvailablePrinters().map((printer) => (
                  <MenuItem key={printer} value={printer}>
                    {printer === 'all' ? 'All Printers' : printer}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                label="Sort By"
                onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                <MenuItem value="progress">Progress</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={loadPrintJobs}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>Print Job</TableCell>
                <TableCell>Printer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Est. Completion</TableCell>
                <TableCell>Details</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No print jobs found matching your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {job.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{job.printer}</TableCell>
                    <TableCell>
                      <Chip 
                        label={job.status.charAt(0).toUpperCase() + job.status.slice(1)} 
                        color={getChipColor(job.status)} 
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={job.progress} 
                            color={getStatusColor(job.status)} 
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {job.progress}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(job.startTime)}</TableCell>
                    <TableCell>{formatDate(job.estimatedEndTime)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        Filament: {job.filament}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {job.fileSize}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {job.status === 'printing' && (
                        <Tooltip title="Pause">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleStatusChange(job.id, 'paused')}
                          >
                            <PauseIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {job.status === 'paused' && (
                        <Tooltip title="Resume">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleStatusChange(job.id, 'printing')}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(job.status === 'printing' || job.status === 'paused') && (
                        <Tooltip title="Cancel">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleStatusChange(job.id, 'cancelled')}
                          >
                            <StopIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(job.status === 'completed' || job.status === 'cancelled' || job.status === 'failed') && (
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="default"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default PrintJobs; 