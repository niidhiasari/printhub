import { Network } from '../types/websocket';

/**
 * Mock API service that simulates real API calls for development
 */
class MockApiService {
  private static _instance: MockApiService;
  private currentNetwork: string = '';
  private availableNetworks: Network[] = [];
  private initialized: boolean = false;

  private constructor() {
    this.initializeData();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MockApiService {
    if (!MockApiService._instance) {
      MockApiService._instance = new MockApiService();
    }
    return MockApiService._instance;
  }

  /**
   * Initialize mock data
   */
  private initializeData(): void {
    // Use a consistent network name for demo purposes - use a more recognizable name
    this.currentNetwork = 'MyHomeWiFi';

    // Initialize available networks that include the current one
    this.availableNetworks = [
      { ssid: this.currentNetwork, security: 'WPA2', strength: 85, open: false },
      { ssid: 'OfficeNetwork', security: 'WPA2', strength: 70, open: false },
      { ssid: 'PrinterNet', security: 'WPA', strength: 60, open: false },
      { ssid: 'GuestWiFi', security: 'None', strength: 55, open: true }
    ];

    // Add some networks for visibility
    this.availableNetworks.push({ ssid: 'Neighbor_WiFi', security: 'WPA2', strength: 30, open: false });
    this.availableNetworks.push({ ssid: 'FreeWiFi', security: 'None', strength: 25, open: true });
    
    // Mark as initialized
    this.initialized = true;
    
    // Log to console for debugging
    console.log('Mock API Service initialized with network:', this.currentNetwork);
    console.log('Available networks:', this.availableNetworks);
  }

  /**
   * Get current device network - with minimal delay
   */
  public getCurrentNetwork(): Promise<string> {
    return new Promise((resolve) => {
      // Simulate very brief network retrieval delay
      setTimeout(() => {
        console.log('Current network requested:', this.currentNetwork);
        resolve(this.currentNetwork);
      }, 100);
    });
  }

  /**
   * Get available WiFi networks - with minimal delay
   */
  public getAvailableNetworks(): Promise<Network[]> {
    return new Promise((resolve) => {
      // Simulate brief network scan delay
      setTimeout(() => {
        console.log('Available networks requested:', this.availableNetworks);
        resolve([...this.availableNetworks]);
      }, 300);
    });
  }

  /**
   * Scan for networks (will return slightly different results each time)
   */
  public scanNetworks(): Promise<Network[]> {
    return new Promise((resolve) => {
      // Simulate network scan delay - shorter than before
      setTimeout(() => {
        // Add some randomness to the strength values
        const updatedNetworks = this.availableNetworks.map(network => ({
          ...network,
          strength: Math.min(100, Math.max(10, network.strength + (Math.random() > 0.5 ? 5 : -5)))
        }));
        
        // Always add a random network for visibility
        const randomNetNames = ['XfinityWiFi', 'ATT-WiFi-5G', 'CableWiFi', 'AndroidAP'];
        const randomNet = randomNetNames[Math.floor(Math.random() * randomNetNames.length)];
        updatedNetworks.push({
          ssid: randomNet,
          security: Math.random() > 0.3 ? 'WPA2' : 'None',
          strength: Math.floor(Math.random() * 50) + 20,
          open: Math.random() > 0.7
        });
        
        this.availableNetworks = updatedNetworks;
        console.log('Networks scanned:', updatedNetworks);
        resolve(updatedNetworks);
      }, 1000); // Reduced from 2000
    });
  }
}

export default MockApiService; 