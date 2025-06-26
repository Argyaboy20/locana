import { Component, OnInit, AfterViewInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { WebSocketService, LocationData, TrackRequestResponse } from '../services/WebSocket.service';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ModalContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() phoneNumber: string = '';
  @Input() provider: string = '';
  @Input() region: string = '';
  @Input() city: string = '';
  @Input() signalStrength: string = '';
  @Input() coordinates?: { lat: number | undefined, lng: number | undefined } | undefined;

  /* Real-time properties */
  public isTracking = false;
  public connectionStatus = 'disconnected';
  public lastUpdate: Date | null = null;
  public socketId: string | undefined;
  public trackingStartTime: Date | null = null;

  private map?: L.Map;
  private marker?: L.Marker;
  private accuracyCircle?: L.Circle;
  private trackingPath?: L.Polyline;
  private locationHistory: LocationData[] = [];
  
  /* Subscriptions untuk Socket.IO events */
  private locationSubscription?: Subscription;
  private connectionSubscription?: Subscription;
  private errorSubscription?: Subscription;
  private trackResponseSubscription?: Subscription;

  constructor(
    private modalController: ModalController,
    private webSocketService: WebSocketService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('Modal Data Received:', {
      phoneNumber: this.phoneNumber,
      provider: this.provider,
      region: this.region,
      city: this.city,
      signalStrength: this.signalStrength,
      coordinates: this.coordinates
    });

    this.initializeSocketIOSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.hasValidCoordinates()) {
        this.initializeMap();
      }
    }, 800);
  }

  ngOnDestroy() {
    this.cleanup();
  }

  /* Initialize Socket.IO subscriptions sesuai dengan server.js */
  private initializeSocketIOSubscriptions(): void {
    // Subscribe to connection status
    this.connectionSubscription = this.webSocketService.getConnectionStatus()
      .subscribe(status => {
        this.connectionStatus = status;
        this.socketId = this.webSocketService.getSocketId();
        
        if (status === 'connected') {
          this.showToast('Terhubung ke server Socket.IO', 'success');
        } else if (status === 'error') {
          this.showToast('Gagal terhubung ke server', 'danger');
        }
        
        this.cdr.detectChanges();
      });

    /* Subscribe to location updates (event: location_update dari server.js) */
    this.locationSubscription = this.webSocketService.getLocationUpdates()
      .subscribe((locationData: LocationData) => {
        console.log('Location update received:', locationData);
        
        // Filter updates untuk nomor telepon yang sedang di-track
        if (locationData.phoneNumber === this.phoneNumber) {
          this.updateLocationData(locationData);
          this.addToLocationHistory(locationData);
        }
      });

    /* Subscribe to track request responses (event: track_request_response dari server.js) */
    this.trackResponseSubscription = this.webSocketService.getTrackResponses()
      .subscribe((response: TrackRequestResponse) => {
        console.log('Track response received:', response);
        
        if (response.phoneNumber === this.phoneNumber) {
          if (response.status === 'tracking_started') {
            this.isTracking = true;
            this.trackingStartTime = new Date();
            this.showToast('Pelacakan real-time dimulai', 'success');
          }
        }
        this.cdr.detectChanges();
      });

    /* Subscribe to errors (event: error dari server.js) */
    this.errorSubscription = this.webSocketService.getErrors()
      .subscribe(error => {
        console.error('Socket.IO error:', error);
        this.showToast(error, 'danger');
        
        // Stop tracking jika ada error
        if (this.isTracking) {
          this.isTracking = false;
          this.trackingStartTime = null;
        }
        this.cdr.detectChanges();
      });
  }

  /*Update location data from Socket.IO location_update event */
  private updateLocationData(locationData: LocationData): void {
    /* Update component properties dengan data terbaru */
    this.provider = locationData.provider;
    this.region = locationData.region;
    this.city = locationData.city;
    this.signalStrength = locationData.signalStrength;
    this.coordinates = locationData.coordinates;
    this.lastUpdate = new Date(locationData.timestamp);

    /* Update map jika tersedia */
    if (this.map && this.hasValidCoordinates()) {
      this.updateMapLocation();
      this.updateTrackingPath();
    } else if (this.hasValidCoordinates()) {
      /* Initialize map jika belum ada */
      this.initializeMap();
    }

    /* Trigger change detection */
    this.cdr.detectChanges();
    
    /* Show update notification */
    this.showToast(`Lokasi ${this.city} - ${this.signalStrength}`, 'medium');
  }

  /* Add location to history for tracking path */
  private addToLocationHistory(locationData: LocationData): void {
    this.locationHistory.push(locationData);
    
    /* Limit history to last 50 points untuk performance */
    if (this.locationHistory.length > 50) {
      this.locationHistory = this.locationHistory.slice(-50);
    }
  }

  /* Start real-time tracking menggunakan Socket.IO */
  public async startTracking(): Promise<void> {
    if (!this.webSocketService.isConnected()) {
      this.showToast('Socket.IO tidak terhubung ke server', 'warning');
      this.webSocketService.reconnect();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Memulai pelacakan real-time...',
      spinner: 'dots'
    });
    await loading.present();

    try {
      /* Clear location history */
      this.locationHistory = [];
      
      /* Send track_request event ke server (sesuai server.js) */
      this.webSocketService.trackLocation(this.phoneNumber);
      
      console.log(`Track request sent for ${this.phoneNumber} via Socket.IO`);
      
      setTimeout(() => {
        loading.dismiss();
      }, 2000);
      
    } catch (error) {
      loading.dismiss();
      this.showToast('Gagal memulai pelacakan', 'danger');
      console.error('Tracking error:', error);
    }
  }

  /* Stop real-time tracking */
  public stopTracking(): void {
    this.isTracking = false;
    this.trackingStartTime = null;
    
    /* Clear tracking path */
    if (this.trackingPath) {
      this.map?.removeLayer(this.trackingPath);
      this.trackingPath = undefined;
    }
    
    this.showToast('Pelacakan dihentikan', 'medium');
    this.cdr.detectChanges();
  }

  /* Reconnect to Socket.IO server */
  public reconnectSocketIO(): void {
    this.webSocketService.reconnect();
    this.showToast('Menghubungkan ulang ke server...', 'medium');
  }

  /* Update tracking path on map */
  private updateTrackingPath(): void {
    if (!this.map || !this.isTracking || this.locationHistory.length < 2) return;

    const pathCoordinates = this.locationHistory
      .filter(loc => loc.coordinates && loc.coordinates.lat && loc.coordinates.lng)
      .map(loc => [loc.coordinates.lat!, loc.coordinates.lng!] as [number, number]);

    if (pathCoordinates.length < 2) return;

    /* Remove existing path */
    if (this.trackingPath) {
      this.map.removeLayer(this.trackingPath);
    }

    /* Create new tracking path */
    this.trackingPath = L.polyline(pathCoordinates, {
      color: '#6863f2',
      weight: 3,
      opacity: 0.7,
      dashArray: '5, 10'
    }).addTo(this.map);
  }

  /* Update map location with new coordinates */
  private updateMapLocation(): void {
    if (!this.map || !this.hasValidCoordinates()) return;

    const lat = this.coordinates!.lat!;
    const lng = this.coordinates!.lng!;

    /* Update marker position */
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
      this.marker.setPopupContent(this.createPopupContent());
      
      // Add bounce animation for real-time updates
      if (this.isTracking) {
        const markerElement = this.marker.getElement();
        if (markerElement) {
          markerElement.style.animation = 'bounce 0.6s ease-in-out';
          setTimeout(() => {
            markerElement.style.animation = '';
          }, 600);
        }
      }
    }

    /* Update accuracy circle */
    if (this.accuracyCircle) {
      this.accuracyCircle.setLatLng([lat, lng]);
    }

    /* Pan to new location if tracking */
    if (this.isTracking) {
      this.map.panTo([lat, lng]);
    }
  }

  /* Create popup content for marker dengan Socket.IO info */
  private createPopupContent(): string {
    const lat = this.coordinates!.lat!;
    const lng = this.coordinates!.lng!;
    
    return `
      <div style="text-align: center; padding: 8px; min-width: 220px;">
        <strong>📍 Lokasi Real-time</strong><br>
        <div style="margin: 8px 0; line-height: 1.4;">
          <strong>${this.provider}</strong><br>
          📞 ${this.phoneNumber}<br>
          🏙️ ${this.city}, ${this.region}<br>
          📶 Sinyal: ${this.signalStrength}
        </div>
        <small style="color: #666;">
          📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}
        </small>
        ${this.lastUpdate ? `<br><small style="color: #999;">Update: ${this.lastUpdate.toLocaleTimeString()}</small>` : ''}
        ${this.socketId ? `<br><small style="color: #999;">Socket: ${this.socketId.substring(0, 8)}...</small>` : ''}
        ${this.isTracking ? '<br><span style="color: #6863f2; font-weight: bold;">🔴 Live Tracking</span>' : ''}
      </div>
    `;
  }

  hasValidCoordinates(): boolean {
    return this.coordinates !== null &&
      this.coordinates !== undefined &&
      this.coordinates.lat !== null &&
      this.coordinates.lat !== undefined &&
      this.coordinates.lng !== null &&
      this.coordinates.lng !== undefined &&
      !isNaN(this.coordinates.lat) &&
      !isNaN(this.coordinates.lng);
  }

  private initializeMap() {
    if (!this.hasValidCoordinates()) {
      console.log('Cannot initialize map: Invalid coordinates', this.coordinates);
      return;
    }

    const lat = this.coordinates!.lat!;
    const lng = this.coordinates!.lng!;

    console.log('Initializing map with coordinates:', lat, lng);

    /* Initialize the map */
    this.map = L.map('map-container', {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true
    });

    /* Add OpenStreetMap tile layer */
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    /* Create custom icon for marker dengan indicator real-time */
    const customIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6863f2" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        ${this.isTracking ? '<circle cx="20" cy="4" r="3" fill="#ff4444" opacity="0.8"/>' : ''}
      </svg>
    `),
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    /* Add marker to the map */
    this.marker = L.marker([lat, lng], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(this.createPopupContent())
      .openPopup();

    /* Add circle untuk coverage area */
    this.accuracyCircle = L.circle([lat, lng], {
      color: this.isTracking ? '#6863f2' : '#999',
      fillColor: this.isTracking ? '#6863f2' : '#999',
      fillOpacity: 0.1,
      radius: 1000,
      dashArray: this.isTracking ? undefined : '5, 5'
    }).addTo(this.map);

    /* Add CSS for bounce animation */
    this.addMapStyles();

    /* Multiple invalidateSize calls untuk memastikan rendering yang benar */
    this.invalidateMapSize();
  }

  /* Add CSS styles for map animations */
  private addMapStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
  }

  private invalidateMapSize(): void {
    const delays = [100, 300, 1500];
    delays.forEach(delay => {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, delay);
    });
  }

  /* Show toast message */
  private async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'medium' = 'medium'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [
        {
          text: 'Tutup',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /* Get connection status color untuk Socket.IO */
  public getConnectionStatusColor(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'success';
      case 'connecting': return 'warning';
      case 'error': return 'danger';
      default: return 'medium';
    }
  }

  /* Get connection status text untuk Socket.IO */
  public getConnectionStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'Socket.IO Terhubung';
      case 'connecting': return 'Menghubungkan...';
      case 'error': return 'Koneksi Error';
      default: return 'Terputus';
    }
  }

  /* Get tracking duration */
  public getTrackingDuration(): string {
    if (!this.trackingStartTime) return '';
    
    const now = new Date();
    const diff = now.getTime() - this.trackingStartTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /* Cleanup subscriptions and map */
  private cleanup(): void {
    /* Unsubscribe dari semua Socket.IO event subscriptions */
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
    if (this.trackResponseSubscription) {
      this.trackResponseSubscription.unsubscribe();
    }
    
    /* Clean up map */
    if (this.map) {
      this.map.remove();
    }
    
    /* Reset tracking state */
    this.isTracking = false;
    this.trackingStartTime = null;
    this.locationHistory = [];
  }

  dismissModal() {
    this.cleanup();
    this.modalController.dismiss();
  }
}