import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Layers, 
  Clock, 
  AlertCircle, 
  Settings, 
  PlusCircle, 
  BarChart3, 
  Calendar, 
  Users, 
  Menu, 
  X,
  ChevronRight,
  Pause,
  Play,
  StopCircle,
  Trash2,
  Wrench,
  History,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Thermometer,
  AlertOctagon,
  Activity,
  Zap,
  CalendarClock,
  PrinterIcon,
  UserCheck,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Printer {
  id: number;
  name: string;
  status: 'Printing' | 'Idle' | 'Paused' | 'Error';
  progress: number;
  timeLeft: string;
  temperature: {
    bed: number;
    nozzle: number;
  };
  job: string;
  material: string;
  startTime: string;
  estimatedEnd: string;
}

interface QueuedJob {
  id: number;
  name: string;
  printer: string;
  material: string;
  estimatedTime: string;
}

interface MaintenanceRecord {
  id: number;
  date: string;
  type: 'Routine' | 'Repair' | 'Calibration';
  description: string;
  status: 'Completed' | 'Pending' | 'Failed';
  technician: string;
}

interface DashboardStats {
  totalPrinters: number;
  activePrinters: number;
  completedJobs: number;
  pendingJobs: number;
  totalUsers: number;
  successRate: number;
  averagePrintTime: string;
  materialUsage: {
    PLA: number;
    PETG: number;
    ABS: number;
    TPU: number;
  };
  printVolume: {
    labels: string[];
    data: number[];
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    tension?: number;
    fill?: boolean;
  }[];
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(0);
  const [showAddPrinterModal, setShowAddPrinterModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [newPrinter, setNewPrinter] = useState<Partial<Printer>>({
    name: '',
    status: 'Idle',
    progress: 0,
    timeLeft: '0h 0m',
    temperature: { bed: 25, nozzle: 25 },
    job: 'None',
    material: 'None',
    startTime: 'N/A',
    estimatedEnd: 'N/A'
  });
  const [newJob, setNewJob] = useState<Partial<QueuedJob>>({
    name: '',
    printer: 'Any',
    material: '',
    estimatedTime: ''
  });
  const [printers, setPrinters] = useState<Printer[]>([
    { 
      id: 1, 
      name: 'Ender 3 Pro', 
      status: 'Printing', 
      progress: 68, 
      timeLeft: '2h 15m',
      temperature: { bed: 60, nozzle: 215 },
      job: 'Engine Block v2.gcode',
      material: 'PLA',
      startTime: '10:30 AM',
      estimatedEnd: '3:45 PM'
    },
    { 
      id: 2, 
      name: 'Prusa i3 MK3S+', 
      status: 'Idle', 
      progress: 0, 
      timeLeft: '0h 0m',
      temperature: { bed: 25, nozzle: 25 },
      job: 'None',
      material: 'None',
      startTime: 'N/A',
      estimatedEnd: 'N/A'
    },
    { 
      id: 3, 
      name: 'Creality CR-10', 
      status: 'Paused', 
      progress: 45, 
      timeLeft: '3h 30m',
      temperature: { bed: 55, nozzle: 200 },
      job: 'Mechanical Arm.gcode',
      material: 'PETG',
      startTime: '9:15 AM',
      estimatedEnd: '5:45 PM'
    },
    { 
      id: 4, 
      name: 'Ultimaker S5', 
      status: 'Error', 
      progress: 12, 
      timeLeft: 'N/A',
      temperature: { bed: 30, nozzle: 180 },
      job: 'Prototype Case.gcode',
      material: 'ABS',
      startTime: '11:45 AM',
      estimatedEnd: 'N/A'
    }
  ]);
  const [queuedJobs, setQueuedJobs] = useState<QueuedJob[]>([
    { id: 1, name: 'Gear Assembly.gcode', printer: 'Ender 3 Pro', material: 'PLA', estimatedTime: '4h 20m' },
    { id: 2, name: 'Prototype v3.gcode', printer: 'Prusa i3 MK3S+', material: 'PETG', estimatedTime: '6h 15m' },
    { id: 3, name: 'Housing Cover.gcode', printer: 'Any', material: 'PLA', estimatedTime: '2h 45m' }
  ]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: 1,
      date: '2023-04-15',
      type: 'Routine',
      description: 'Monthly nozzle cleaning and bed leveling',
      status: 'Completed',
      technician: 'John Doe'
    },
    {
      id: 2,
      date: '2023-04-10',
      type: 'Repair',
      description: 'Fixed extruder gear issue',
      status: 'Completed',
      technician: 'Jane Smith'
    },
    {
      id: 3,
      date: '2023-05-15',
      type: 'Calibration',
      description: 'Temperature and flow calibration',
      status: 'Pending',
      technician: 'Mike Johnson'
    }
  ]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPrinters: 4,
    activePrinters: 2,
    completedJobs: 156,
    pendingJobs: 8,
    totalUsers: 12,
    successRate: 92,
    averagePrintTime: '4h 30m',
    materialUsage: {
      PLA: 45,
      PETG: 25,
      ABS: 20,
      TPU: 10
    },
    printVolume: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [12, 19, 15, 25, 22, 30, 28]
    }
  });

  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chart options
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  const doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  // Chart data
  const printVolumeData: ChartData = {
    labels: dashboardStats.printVolume.labels,
    datasets: [
      {
        label: 'Print Volume',
        data: dashboardStats.printVolume.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const materialUsageData: ChartData = {
    labels: ['PLA', 'PETG', 'ABS', 'TPU'],
    datasets: [
      {
        data: [
          dashboardStats.materialUsage.PLA,
          dashboardStats.materialUsage.PETG,
          dashboardStats.materialUsage.ABS,
          dashboardStats.materialUsage.TPU
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }
    ]
  };

  const printerStatusData: ChartData = {
    labels: ['Active', 'Idle', 'Error', 'Maintenance'],
    datasets: [
      {
        data: [2, 1, 1, 0],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ]
      }
    ]
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Update dashboard stats
        setDashboardStats(prev => ({
          ...prev,
          printVolume: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [12, 19, 15, 25, 22, 30, 28]
          }
        }));
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeNav === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeNav, timeRange]);

  const getStatusColor = (status: Printer['status']) => {
    switch(status) {
      case 'Printing': return 'bg-green-500';
      case 'Idle': return 'bg-gray-500';
      case 'Paused': return 'bg-yellow-500';
      case 'Error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressColor = (status: Printer['status']) => {
    switch(status) {
      case 'Printing': return 'bg-green-500';
      case 'Idle': return 'bg-gray-500';
      case 'Paused': return 'bg-yellow-500';
      case 'Error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
    if (window.innerWidth < 768) { // Close sidebar on mobile after navigation
      setSidebarOpen(false);
    }
  };

  const handleAddPrinter = () => {
    if (newPrinter.name) {
      const printer: Printer = {
        ...newPrinter,
        id: printers.length + 1
      } as Printer;
      setPrinters([...printers, printer]);
      setShowAddPrinterModal(false);
      setNewPrinter({
        name: '',
        status: 'Idle',
        progress: 0,
        timeLeft: '0h 0m',
        temperature: { bed: 25, nozzle: 25 },
        job: 'None',
        material: 'None',
        startTime: 'N/A',
        estimatedEnd: 'N/A'
      });
    }
  };

  const handleAddJob = () => {
    if (newJob.name && newJob.material && newJob.estimatedTime) {
      if (editingJob) {
        handleUpdateJob();
      } else {
        const job: QueuedJob = {
          ...newJob,
          id: queuedJobs.length + 1
        } as QueuedJob;
        setQueuedJobs([...queuedJobs, job]);
        setShowAddJobModal(false);
        setNewJob({
          name: '',
          printer: 'Any',
          material: '',
          estimatedTime: ''
        });
      }
    }
  };

  const handlePausePrinter = (printerId: number) => {
    setPrinters(printers.map(printer => {
      if (printer.id === printerId) {
        return {
          ...printer,
          status: 'Paused' as const,
          timeLeft: printer.timeLeft // Preserve the remaining time
        };
      }
      return printer;
    }));
  };

  const handleResumePrinter = (printerId: number) => {
    setPrinters(printers.map(printer => {
      if (printer.id === printerId) {
        return {
          ...printer,
          status: 'Printing' as const
        };
      }
      return printer;
    }));
  };

  const handleStopPrinter = (printerId: number) => {
    setPrinters(printers.map(printer => {
      if (printer.id === printerId) {
        return {
          ...printer,
          status: 'Idle' as const,
          progress: 0,
          timeLeft: '0h 0m',
          job: 'None',
          startTime: 'N/A',
          estimatedEnd: 'N/A'
        };
      }
      return printer;
    }));
  };

  const handleStartNewJob = (printerId: number) => {
    // Find the first queued job that's either unassigned or assigned to this printer
    const nextJob = queuedJobs.find(job => 
      job.printer === 'Any' || job.printer === printers.find(p => p.id === printerId)?.name
    );

    if (nextJob) {
      // Update printer with the new job
      setPrinters(printers.map(printer => {
        if (printer.id === printerId) {
          return {
            ...printer,
            status: 'Printing' as const,
            progress: 0,
            timeLeft: nextJob.estimatedTime,
            job: nextJob.name,
            material: nextJob.material,
            startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            estimatedEnd: new Date(Date.now() + parseEstimatedTime(nextJob.estimatedTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return printer;
      }));

      // Remove the job from the queue
      setQueuedJobs(queuedJobs.filter(job => job.id !== nextJob.id));
    } else {
      setShowAddJobModal(true);
    }
  };

  const handleTroubleshoot = (printerId: number) => {
    // Add the error to maintenance records
    const newMaintenanceRecord: MaintenanceRecord = {
      id: maintenanceRecords.length + 1,
      date: new Date().toISOString().split('T')[0],
      type: 'Repair',
      description: `Troubleshooting required for ${printers.find(p => p.id === printerId)?.name}`,
      status: 'Pending',
      technician: 'Unassigned'
    };
    setMaintenanceRecords([...maintenanceRecords, newMaintenanceRecord]);

    // Update printer status
    setPrinters(printers.map(printer => {
      if (printer.id === printerId) {
        return {
          ...printer,
          status: 'Idle' as const,
          progress: 0,
          timeLeft: '0h 0m',
          job: 'None',
          startTime: 'N/A',
          estimatedEnd: 'N/A'
        };
      }
      return printer;
    }));

    // Show maintenance modal
    setShowMaintenanceModal(true);
  };

  const handleCancelPrint = (printerId: number) => {
    const printer = printers.find(p => p.id === printerId);
    if (printer && printer.job !== 'None') {
      // Add the job back to the queue
      const canceledJob: QueuedJob = {
        id: queuedJobs.length + 1,
        name: printer.job,
        printer: printer.name,
        material: printer.material,
        estimatedTime: printer.timeLeft
      };
      setQueuedJobs([...queuedJobs, canceledJob]);
    }

    // Reset the printer
    setPrinters(printers.map(printer => {
      if (printer.id === printerId) {
        return {
          ...printer,
          status: 'Idle' as const,
          progress: 0,
          timeLeft: '0h 0m',
          job: 'None',
          startTime: 'N/A',
          estimatedEnd: 'N/A'
        };
      }
      return printer;
    }));
  };

  const handleStartQueuedJob = (job: QueuedJob) => {
    // Find an available printer that matches the job requirements
    const availablePrinter = printers.find(printer => 
      printer.status === 'Idle' && (job.printer === 'Any' || job.printer === printer.name)
    );

    if (availablePrinter) {
      // Update printer with the job
      setPrinters(printers.map(printer => {
        if (printer.id === availablePrinter.id) {
          return {
            ...printer,
            status: 'Printing' as const,
            progress: 0,
            timeLeft: job.estimatedTime,
            job: job.name,
            material: job.material,
            startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            estimatedEnd: new Date(Date.now() + parseEstimatedTime(job.estimatedTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return printer;
      }));

      // Remove the job from the queue
      setQueuedJobs(queuedJobs.filter(queuedJob => queuedJob.id !== job.id));
    } else {
      // Show error message if no printer is available
      setError('No suitable printer available for this job');
      setTimeout(() => setError(null), 3000);
    }
  };

  const [editingJob, setEditingJob] = useState<QueuedJob | null>(null);

  const handleEditJob = (job: QueuedJob) => {
    setEditingJob(job);
    setNewJob({
      name: job.name,
      printer: job.printer,
      material: job.material,
      estimatedTime: job.estimatedTime
    });
    setShowAddJobModal(true);
  };

  const handleUpdateJob = () => {
    if (editingJob && newJob.name && newJob.material && newJob.estimatedTime) {
      setQueuedJobs(queuedJobs.map(job => 
        job.id === editingJob.id
          ? { ...job, ...newJob }
          : job
      ));
      setShowAddJobModal(false);
      setEditingJob(null);
      setNewJob({
        name: '',
        printer: 'Any',
        material: '',
        estimatedTime: ''
      });
    }
  };

  const handleDeleteJob = (jobId: number) => {
    setQueuedJobs(queuedJobs.filter(job => job.id !== jobId));
  };

  // Helper function to parse estimated time string to milliseconds
  const parseEstimatedTime = (timeStr: string): number => {
    const hours = parseInt(timeStr.split('h')[0]) || 0;
    const minutes = parseInt(timeStr.split('h')[1]?.split('m')[0]) || 0;
    return (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button 
              className="md:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center">
              <Layers className="h-8 w-8 mr-2" />
              <h1 className="text-2xl font-bold">PrinterHub</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => handleNavClick('dashboard')}
              className={`hover:text-blue-200 transition-colors flex items-center ${activeNav === 'dashboard' ? 'text-blue-200' : ''}`}
            >
              <BarChart3 className="h-5 w-5 mr-1" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => handleNavClick('printers')}
              className={`hover:text-blue-200 transition-colors flex items-center ${activeNav === 'printers' ? 'text-blue-200' : ''}`}
            >
              <Printer className="h-5 w-5 mr-1" />
              <span>Printers</span>
            </button>
            <button 
              onClick={() => handleNavClick('schedule')}
              className={`hover:text-blue-200 transition-colors flex items-center ${activeNav === 'schedule' ? 'text-blue-200' : ''}`}
            >
              <Calendar className="h-5 w-5 mr-1" />
              <span>Schedule</span>
            </button>
            <button 
              onClick={() => handleNavClick('users')}
              className={`hover:text-blue-200 transition-colors flex items-center ${activeNav === 'users' ? 'text-blue-200' : ''}`}
            >
              <Users className="h-5 w-5 mr-1" />
              <span>Users</span>
            </button>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-blue-700 transition-colors">
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile */}
        <div className={`md:hidden fixed inset-0 z-20 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className={`absolute inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-200">
                  <X size={20} />
                </button>
              </div>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => handleNavClick('dashboard')}
                    className={`w-full flex items-center p-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 ${activeNav === 'dashboard' ? 'bg-blue-50 text-blue-600' : ''}`}
                  >
                    <BarChart3 className="h-5 w-5 mr-3" />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('printers')}
                    className={`w-full flex items-center p-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 ${activeNav === 'printers' ? 'bg-blue-50 text-blue-600' : ''}`}
                  >
                    <Printer className="h-5 w-5 mr-3" />
                    <span>Printers</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('schedule')}
                    className={`w-full flex items-center p-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 ${activeNav === 'schedule' ? 'bg-blue-50 text-blue-600' : ''}`}
                  >
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>Schedule</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('users')}
                    className={`w-full flex items-center p-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 ${activeNav === 'users' ? 'bg-blue-50 text-blue-600' : ''}`}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    <span>Users</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-white shadow-lg">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Navigation</h2>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center p-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 ${activeNav === 'dashboard' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('printers')}
                  className={`w-full flex items-center p-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 ${activeNav === 'printers' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <Printer className="h-5 w-5 mr-3" />
                  <span>Printers</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('schedule')}
                  className={`w-full flex items-center p-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 ${activeNav === 'schedule' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>Schedule</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('users')}
                  className={`w-full flex items-center p-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 ${activeNav === 'users' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <span>Users</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="container mx-auto">
            {activeNav === 'dashboard' ? (
              <div className="space-y-6">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-gray-600">Welcome back! Here's what's happening with your printers.</p>
                  </div>
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <button
                      onClick={() => setTimeRange('day')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        timeRange === 'day'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => setTimeRange('week')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        timeRange === 'week'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setTimeRange('month')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        timeRange === 'month'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <PrinterIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="text-green-500 flex items-center">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            12%
                          </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Active Printers</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.activePrinters}</p>
                        <p className="text-sm text-gray-500 mt-2">of {dashboardStats.totalPrinters} total</p>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-green-100 rounded-full">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <span className="text-green-500 flex items-center">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            8%
                          </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Completed Jobs</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.completedJobs}</p>
                        <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-yellow-100 rounded-full">
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                          <span className="text-red-500 flex items-center">
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                            5%
                          </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Avg. Print Time</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.averagePrintTime}</p>
                        <p className="text-sm text-gray-500 mt-2">Per job</p>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-purple-100 rounded-full">
                            <UserCheck className="h-6 w-6 text-purple-600" />
                          </div>
                          <span className="text-green-500 flex items-center">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            15%
                          </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Success Rate</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.successRate}%</p>
                        <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-800">Print Volume</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Last {timeRange}</span>
                          </div>
                        </div>
                        <div className="h-80">
                          <Line data={printVolumeData} options={lineChartOptions} />
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-800">Material Usage</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Distribution</span>
                          </div>
                        </div>
                        <div className="h-80">
                          <Doughnut data={materialUsageData} options={doughnutChartOptions} />
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity and Printer Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                          {printers.slice(0, 3).map((printer) => (
                            <div key={printer.id} className="flex items-center space-x-4">
                              <div className={`p-2 rounded-full ${getStatusColor(printer.status)}`}>
                                <Printer className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{printer.name}</p>
                                <p className="text-sm text-gray-500">
                                  {printer.status === 'Printing' ? `Printing ${printer.job}` : printer.status}
                                </p>
                              </div>
                              <span className="text-sm text-gray-500">{printer.startTime}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Printer Status</h3>
                        <div className="h-80">
                          <Bar data={printerStatusData} options={barChartOptions} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : activeNav === 'printers' ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">3D Printer Management</h1>
                  <button 
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setShowAddPrinterModal(true)}
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    <span>Add New Printer</span>
                  </button>
                </div>
                
                {/* Printer Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {printers.map((printer, index) => (
                    <div 
                      key={printer.id}
                      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${selectedPrinter === index ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedPrinter(index)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-800">{printer.name}</h3>
                          <div className={`flex items-center px-2 py-1 rounded-full text-xs text-white ${getStatusColor(printer.status)}`}>
                            <span>{printer.status}</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{printer.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${getProgressColor(printer.status)}`} 
                              style={{ width: `${printer.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{printer.timeLeft}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Layers className="h-4 w-4 mr-1" />
                            <span>{printer.material}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Printer Details */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">{printers[selectedPrinter].name} Details</h2>
                      <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(printers[selectedPrinter].status)}`}>
                        {printers[selectedPrinter].status}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div>
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Job</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="mb-3">
                              <p className="text-sm text-gray-500">File Name</p>
                              <p className="font-medium">{printers[selectedPrinter].job}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-500">Material</p>
                                <p className="font-medium">{printers[selectedPrinter].material}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Time Left</p>
                                <p className="font-medium">{printers[selectedPrinter].timeLeft}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Start Time</p>
                                <p className="font-medium">{printers[selectedPrinter].startTime}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Estimated End</p>
                                <p className="font-medium">{printers[selectedPrinter].estimatedEnd}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">Temperature</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-gray-500">Nozzle</p>
                                <p className="font-medium text-lg">{printers[selectedPrinter].temperature.nozzle}°C</p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="h-2.5 rounded-full bg-orange-500" 
                                  style={{ width: `${(printers[selectedPrinter].temperature.nozzle / 250) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-gray-500">Bed</p>
                                <p className="font-medium text-lg">{printers[selectedPrinter].temperature.bed}°C</p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="h-2.5 rounded-full bg-orange-500" 
                                  style={{ width: `${(printers[selectedPrinter].temperature.bed / 100) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Column */}
                      <div>
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">Progress</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Completion</span>
                              <span>{printers[selectedPrinter].progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                              <div 
                                className={`h-4 rounded-full ${getProgressColor(printers[selectedPrinter].status)}`} 
                                style={{ width: `${printers[selectedPrinter].progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-center space-x-4">
                              {printers[selectedPrinter].status === 'Printing' && (
                                <>
                                  <button 
                                    onClick={() => handlePausePrinter(printers[selectedPrinter].id)}
                                    className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                                  >
                                    <Pause className="h-5 w-5 mr-2" />
                                    <span>Pause</span>
                                  </button>
                                  <button 
                                    onClick={() => handleStopPrinter(printers[selectedPrinter].id)}
                                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                  >
                                    <StopCircle className="h-5 w-5 mr-2" />
                                    <span>Stop</span>
                                  </button>
                                </>
                              )}
                              {printers[selectedPrinter].status === 'Paused' && (
                                <>
                                  <button 
                                    onClick={() => handleResumePrinter(printers[selectedPrinter].id)}
                                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                  >
                                    <Play className="h-5 w-5 mr-2" />
                                    <span>Resume</span>
                                  </button>
                                  <button 
                                    onClick={() => handleStopPrinter(printers[selectedPrinter].id)}
                                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                  >
                                    <StopCircle className="h-5 w-5 mr-2" />
                                    <span>Stop</span>
                                  </button>
                                </>
                              )}
                              {printers[selectedPrinter].status === 'Idle' && (
                                <button 
                                  onClick={() => handleStartNewJob(printers[selectedPrinter].id)}
                                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  <PlusCircle className="h-5 w-5 mr-2" />
                                  <span>Start New Job</span>
                                </button>
                              )}
                              {printers[selectedPrinter].status === 'Error' && (
                                <>
                                  <button 
                                    onClick={() => handleTroubleshoot(printers[selectedPrinter].id)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    <span>Troubleshoot</span>
                                  </button>
                                  <button 
                                    onClick={() => handleCancelPrint(printers[selectedPrinter].id)}
                                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                  >
                                    <StopCircle className="h-5 w-5 mr-2" />
                                    <span>Cancel</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">Maintenance</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-500">Last Maintenance</p>
                                <p className="font-medium">2023-04-15</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Next Scheduled</p>
                                <p className="font-medium">2023-05-15</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setShowMaintenanceModal(true)}
                              className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                            >
                              <Settings className="h-5 w-5 mr-2" />
                              <span>Maintenance Options</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print Queue */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                    <h2 className="text-xl font-semibold">Print Queue</h2>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Name</th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Printer</th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Time</th>
                            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {queuedJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.printer}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.material}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.estimatedTime}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                    onClick={() => handleStartQueuedJob(job)}
                                    title="Start Job"
                                  >
                                    <Play className="h-5 w-5" />
                                  </button>
                                  <button 
                                    className="p-1 text-yellow-500 hover:text-yellow-700 transition-colors"
                                    onClick={() => handleEditJob(job)}
                                    title="Edit Job"
                                  >
                                    <Settings className="h-5 w-5" />
                                  </button>
                                  <button 
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                    onClick={() => handleDeleteJob(job.id)}
                                    title="Delete Job"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <button 
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={() => setShowAddJobModal(true)}
                      >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        <span>Add New Job</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-lg">{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} content coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Printer Modal */}
      {showAddPrinterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Printer</h2>
              <button onClick={() => setShowAddPrinterModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Printer Name</label>
                <input
                  type="text"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter printer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newPrinter.status}
                  onChange={(e) => setNewPrinter({ ...newPrinter, status: e.target.value as Printer['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Idle">Idle</option>
                  <option value="Printing">Printing</option>
                  <option value="Paused">Paused</option>
                  <option value="Error">Error</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bed Temperature</label>
                  <input
                    type="number"
                    value={newPrinter.temperature?.bed}
                    onChange={(e) => setNewPrinter({ 
                      ...newPrinter, 
                      temperature: { ...newPrinter.temperature!, bed: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Bed temp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nozzle Temperature</label>
                  <input
                    type="number"
                    value={newPrinter.temperature?.nozzle}
                    onChange={(e) => setNewPrinter({ 
                      ...newPrinter, 
                      temperature: { ...newPrinter.temperature!, nozzle: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nozzle temp"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddPrinterModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPrinter}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Printer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingJob ? 'Edit Job' : 'Add New Job'}</h2>
              <button 
                onClick={() => {
                  setShowAddJobModal(false);
                  setEditingJob(null);
                  setNewJob({
                    name: '',
                    printer: 'Any',
                    material: '',
                    estimatedTime: ''
                  });
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
                <input
                  type="text"
                  value={newJob.name}
                  onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Printer</label>
                <select
                  value={newJob.printer}
                  onChange={(e) => setNewJob({ ...newJob, printer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Any">Any Available Printer</option>
                  {printers.map(printer => (
                    <option key={printer.id} value={printer.name}>{printer.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                <select
                  value={newJob.material}
                  onChange={(e) => setNewJob({ ...newJob, material: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select material</option>
                  <option value="PLA">PLA</option>
                  <option value="PETG">PETG</option>
                  <option value="ABS">ABS</option>
                  <option value="TPU">TPU</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                <input
                  type="text"
                  value={newJob.estimatedTime}
                  onChange={(e) => setNewJob({ ...newJob, estimatedTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2h 30m"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddJobModal(false);
                    setEditingJob(null);
                    setNewJob({
                      name: '',
                      printer: 'Any',
                      material: '',
                      estimatedTime: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddJob}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingJob ? 'Update Job' : 'Add Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Maintenance Records</h2>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <History className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-800">Last Maintenance</h3>
                </div>
                <p className="text-sm text-gray-600">2023-04-15</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-800">Next Scheduled</h3>
                </div>
                <p className="text-sm text-gray-600">2023-05-15</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Maintenance History</h3>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  <span>Add Record</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{record.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${record.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.technician}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Wrench className="h-5 w-5" />
                            </button>
                            <button className="p-1 text-green-600 hover:text-green-800">
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button className="p-1 text-red-500 hover:text-red-700">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;