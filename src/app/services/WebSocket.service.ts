import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer, of } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { catchError, switchMap, retry, delay } from 'rxjs/operators';

export interface LocationData {
  phoneNumber: string;
  provider: string;
  region: string;
  city: string;
  signalStrength: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: number;
}

export interface TrackRequestResponse {
  status: string;
  phoneNumber: string;
  timestamp: number;
}

export interface ConnectionStatus {
  status: string;
  clientId: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  // SOLUSI: Multiple endpoints untuk fallback
  private readonly SOCKET_ENDPOINTS = [
    'https://locana-server.vercel.app', // Ganti dengan URL server Vercel yang benar
  ];

  private currentEndpointIndex = 0;
  private socket: Socket | null = null;

  // Subjects untuk mengelola state
  private readonly connectionStatus$ = new BehaviorSubject<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  private readonly locationUpdates$ = new Subject<LocationData>();
  private readonly trackResponses$ = new Subject<TrackRequestResponse>();
  private readonly errors$ = new Subject<string>();

  // Reconnection settings
  private readonly RECONNECT_INTERVAL = 5000;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private readonly MAX_ENDPOINT_ATTEMPTS = 2;
  private reconnectAttempts = 0;
  private endpointAttempts = 0;

  constructor() {
    this.initializeConnection();
  }

  /* Initialize connection with endpoint fallback */
  private initializeConnection(): void {
    console.log('Initializing WebSocket connection...');
    this.testEndpointAndConnect();
  }

  /* Test endpoint connectivity before establishing Socket.IO connection */
  private testEndpointAndConnect(): void {
    const currentEndpoint = this.SOCKET_ENDPOINTS[this.currentEndpointIndex];
    console.log(`Testing endpoint: ${currentEndpoint}`);

    // Test dengan path health check yang lebih reliable
    const testUrl = `${currentEndpoint}/health`;

    fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          console.log(`Endpoint ${currentEndpoint} is reachable`);
          this.connect();
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      })
      .catch(error => {
        console.error(`Endpoint ${currentEndpoint} is not reachable:`, error);
        this.tryNextEndpoint();
      });
  }

  /**
   * Try next endpoint in the list
   */
  private tryNextEndpoint(): void {
    this.endpointAttempts++;

    if (this.endpointAttempts >= this.MAX_ENDPOINT_ATTEMPTS) {
      this.currentEndpointIndex++;
      this.endpointAttempts = 0;

      if (this.currentEndpointIndex >= this.SOCKET_ENDPOINTS.length) {
        // All endpoints failed
        console.error('All endpoints failed');
        this.connectionStatus$.next('error');
        this.errors$.next('Unable to connect to any server. Please check your internet connection and try again later.');
        return;
      }
    }

    setTimeout(() => {
      this.testEndpointAndConnect();
    }, 2000);
  }

  /* Establish Socket.IO connection */
  private connect(): void {
    if (this.socket) {
      this.disconnect();
    }

    this.connectionStatus$.next('connecting');
    const currentEndpoint = this.SOCKET_ENDPOINTS[this.currentEndpointIndex];

    console.log(`Connecting to: ${currentEndpoint}`);

    // Konfigurasi optimized untuk serverless dan network issues
    this.socket = io(currentEndpoint, {
      // Prioritas polling untuk serverless yang lebih stabil
      transports: ['polling', 'websocket'],

      // Timeout yang lebih panjang untuk serverless cold start
      timeout: 30000,

      // Upgrade transport setelah koneksi stabil
      upgrade: true,

      // Settings untuk serverless
      forceNew: true,
      autoConnect: true,

      // Manual reconnection control
      reconnection: false,

      // Additional options untuk stabilitas
      rememberUpgrade: false,
      timestampRequests: true
    });

    this.setupSocketListeners();

    // Tambahkan fallback timeout manual
    setTimeout(() => {
      if (this.socket && !this.socket.connected && this.connectionStatus$.value === 'connecting') {
        console.log('Manual timeout triggered, trying next endpoint');
        this.tryNextEndpoint();
      }
    }, 25000);
  }

  /**
   * Setup Socket.IO event listeners dengan enhanced error handling
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully!');
      console.log('Socket ID:', this.socket?.id);
      console.log('Transport:', this.socket?.io.engine.transport.name);
      console.log('Endpoint:', this.SOCKET_ENDPOINTS[this.currentEndpointIndex]);

      this.connectionStatus$.next('connected');
      this.reconnectAttempts = 0;
      this.endpointAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      this.connectionStatus$.next('disconnected');

      // Enhanced disconnect handling
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        this.scheduleReconnect();
      } else if (reason === 'transport close' || reason === 'transport error') {
        // Network issues, try different endpoint
        this.tryNextEndpoint();
      } else if (reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      this.connectionStatus$.next('error');

      // Enhanced error handling dengan lebih banyak kasus
      let errorMessage = 'Connection failed';
      if (error.message) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Connection timeout. Server might be sleeping (serverless). Retrying...';
        } else if (error.message.includes('websocket')) {
          errorMessage = 'WebSocket error. Using polling fallback...';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error. Server configuration issue.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Server endpoint not found. Trying next server...';
        } else if (error.message.includes('503') || error.message.includes('502')) {
          errorMessage = 'Server temporarily unavailable. Retrying...';
        } else {
          errorMessage = `Connection error: ${error.message}`;
        }
      }

      this.errors$.next(errorMessage);

      // Immediate retry untuk timeout, delayed untuk other errors
      const retryDelay = error.message?.includes('timeout') ? 500 : 2000;

      setTimeout(() => {
        this.tryNextEndpoint();
      }, retryDelay);
    });

    // Server events
    this.socket.on('connection_status', (data: ConnectionStatus) => {
      console.log('📊 Connection status received:', data);
      if (data.status === 'connected') {
        this.connectionStatus$.next('connected');
      }
    });

    this.socket.on('location_update', (data: LocationData) => {
      console.log('📍 Location update received:', data);
      this.locationUpdates$.next(data);
    });

    this.socket.on('track_request_response', (data: TrackRequestResponse) => {
      console.log('📱 Track request response:', data);
      this.trackResponses$.next(data);
    });

    this.socket.on('error', (error: any) => {
      console.error('🚨 Server error:', error);
      this.errors$.next(error.message || 'Server error occurred');
    });

    // Additional debugging events
    this.socket.on('ping', () => {
      console.log('🏓 Ping received');
    });

    this.socket.on('pong', (latency) => {
      console.log('🏓 Pong received, latency:', latency, 'ms');
    });
  }

  /**
   * Schedule reconnection attempt dengan backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached for current endpoint');
      this.tryNextEndpoint();
      return;
    }

    const delay = Math.min(this.RECONNECT_INTERVAL * Math.pow(1.5, this.reconnectAttempts), 15000);

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}`);
      this.connect();
    }, delay);
  }

  /**
   * Request location tracking untuk phone number
   */
  public trackLocation(phoneNumber: string): void {
    // Improved connection check
    if (!this.socket) {
      this.errors$.next('⚠️ Not connected to server. Initializing connection...');
      this.initializeConnection();

      // Retry setelah connection attempt
      setTimeout(() => {
        if (this.isConnected()) {
          this.trackLocation(phoneNumber);
        }
      }, 3000);
      return;
    }

    if (!this.isConnected()) {
      this.errors$.next('⚠️ Connection not ready. Please wait...');
      return;
    }

    if (!phoneNumber || phoneNumber.trim() === '') {
      this.errors$.next('❌ Phone number is required');
      return;
    }

    // Validate phone number format (basic)
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      this.errors$.next('❌ Please enter a valid phone number');
      return;
    }

    const trackData = {
      phoneNumber: cleanPhone,
      timestamp: Date.now(),
      clientId: this.socket.id
    };

    this.socket.emit('track_request', trackData);
    console.log('📤 Track request sent:', trackData);
  }

  /* Send location update */
  public sendLocationUpdate(locationData: Partial<LocationData>): void {
    if (!this.socket || !this.isConnected()) {
      this.errors$.next('⚠️ Not connected to server. Cannot send location update.');
      return;
    }

    const updateData = {
      ...locationData,
      timestamp: Date.now(),
      clientId: this.socket.id
    };

    this.socket.emit('location_update', updateData);
    console.log('📤 Location update sent:', updateData);
  }

  /* Get connection status observable */
  public getConnectionStatus(): Observable<string> {
    return this.connectionStatus$.asObservable();
  }

  /* Get location updates observable */
  public getLocationUpdates(): Observable<LocationData> {
    return this.locationUpdates$.asObservable();
  }

  /* Get track request responses observable */
  public getTrackResponses(): Observable<TrackRequestResponse> {
    return this.trackResponses$.asObservable();
  }

  /* Get errors observable */
  public getErrors(): Observable<string> {
    return this.errors$.asObservable();
  }

  /* Check if Socket.IO is connected */
  public isConnected(): boolean {
    return this.socket?.connected === true && this.connectionStatus$.value === 'connected';
  }

  /* Get current socket ID */
  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /* Get current endpoint being used */
  public getCurrentEndpoint(): string {
    return this.SOCKET_ENDPOINTS[this.currentEndpointIndex];
  }

  /* Get connection info for debugging */
  public getConnectionInfo(): any {
    if (!this.socket) return null;

    return {
      connected: this.socket.connected,
      id: this.socket.id,
      transport: this.socket.io.engine?.transport?.name,
      endpoint: this.getCurrentEndpoint(),
      readyState: this.socket.io.engine?.readyState,
      connectionAttempts: this.reconnectAttempts,
      endpointAttempts: this.endpointAttempts
    };
  }

  /* Force reconnect to different endpoint */
  public switchEndpoint(): void {
    console.log('🔄 Manually switching endpoint...');
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.SOCKET_ENDPOINTS.length;
    this.reconnectAttempts = 0;
    this.endpointAttempts = 0;
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  /* Manual reconnect */
  public reconnect(): void {
    console.log('🔄 Manual reconnection initiated...');
    this.reconnectAttempts = 0;
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  /* Disconnect Socket.IO */
  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus$.next('disconnected');
  }

  /* Health check method */
  public healthCheck(): Observable<boolean> {
    return new Observable(observer => {
      if (!this.socket || !this.isConnected()) {
        observer.next(false);
        observer.complete();
        return;
      }

      const timeout = setTimeout(() => {
        observer.next(false);
        observer.complete();
      }, 5000);

      const startTime = Date.now();
      this.socket.emit('ping', startTime);

      const pongHandler = (time: number) => {
        clearTimeout(timeout);
        const latency = Date.now() - time;
        console.log('🏓 Health check successful, latency:', latency, 'ms');
        observer.next(true);
        observer.complete();
        this.socket?.off('pong', pongHandler);
      };

      this.socket.on('pong', pongHandler);
    });
  }

  /* Cleanup when service is destroyed */
  ngOnDestroy(): void {
    console.log('🧹 Cleaning up WebSocket service...');
    this.disconnect();
    this.connectionStatus$.complete();
    this.locationUpdates$.complete();
    this.trackResponses$.complete();
    this.errors$.complete();
  }
}