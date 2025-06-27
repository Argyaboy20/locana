import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { WebSocketService, LocationData } from '../services/WebSocket.service';
import { inject } from "@vercel/analytics";

inject();

/* Interface untuk struktur data history item */
interface HistoryItem {
  id: string;
  phoneNumber: string;
  provider: string;
  region: string;
  city: string;
  signalStrength: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  status: string;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false,
})

export class HistoryPage implements OnInit, OnDestroy {

  /* Array untuk menyimpan seluruh riwayat pelacakan */
  historyList: HistoryItem[] = [];

  /* Array untuk menampilkan history dengan pagination/infinite scroll */
  displayedHistory: HistoryItem[] = [];

  /* Variabel untuk mengontrol pagination */
  private itemsPerPage: number = 10;
  private currentPage: number = 0;

  /* Variabel untuk mengontrol modal detail history */
  isHistoryDetailOpen: boolean = false;
  selectedHistoryItem: HistoryItem | null = null;

  /* Map instance untuk menampilkan lokasi di modal */
  private map: any;

  /* Subscription untuk mendengarkan perubahan data */
  private historySubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    /* Inject TrackingService di sini ketika sudah dibuat */
    private webSocketService: WebSocketService
  ) { }

  ngOnInit() {
    /* Inisialisasi komponen saat pertama kali dimuat */
    this.loadHistoryData();
    this.initializeDisplayedHistory();

    /* Subscribe untuk mendengarkan update data dari beranda */
    this.subscribeToTrackingUpdates();
  }

  ngOnDestroy() {
    /* Cleanup subscription saat komponen di-destroy */
    this.historySubscription.unsubscribe();

    /* Cleanup map instance jika ada */
    if (this.map) {
      this.map.remove();
    }
  }

  /* Method untuk memuat data history dari service atau localStorage */
  private loadHistoryData(): void {
    try {
      /* Ambil data dari localStorage sebagai fallback */
      const savedHistory = localStorage.getItem('trackingHistory');
      if (savedHistory) {
        this.historyList = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }

      /* Urutkan berdasarkan timestamp terbaru */
      this.historyList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    } catch (error) {
      console.error('Error loading history data:', error);
      this.historyList = [];
    }
  }

  /* Method untuk inisialisasi displayed history dengan pagination */
  private initializeDisplayedHistory(): void {
    this.currentPage = 0;
    this.displayedHistory = this.historyList.slice(0, this.itemsPerPage);
  }

  /* Method untuk subscribe ke tracking updates dari beranda */
  private subscribeToTrackingUpdates(): void {
    this.historySubscription = this.webSocketService.getLocationUpdates()
      .subscribe(locationData => {
        this.addTrackingResult(locationData);
      });
  }

  /* Method untuk menambahkan hasil tracking baru dari beranda */
  addTrackingResult(trackingData: LocationData): void {  /* Ganti parameter type */
  const newHistoryItem: HistoryItem = {
    id: this.generateUniqueId(),
    phoneNumber: trackingData.phoneNumber,
    provider: trackingData.provider,
    region: trackingData.region,
    city: trackingData.city,
    signalStrength: trackingData.signalStrength,
    coordinates: trackingData.coordinates,
    timestamp: new Date(trackingData.timestamp), /* Convert dari number ke Date */
    status: 'Aktif'
  };

  this.historyList.unshift(newHistoryItem);
  this.initializeDisplayedHistory();
  this.saveHistoryToStorage();
}

  /* Method untuk menyimpan history ke localStorage */
  private saveHistoryToStorage(): void {
    try {
      localStorage.setItem('trackingHistory', JSON.stringify(this.historyList));
    } catch (error) {
      console.error('Error saving history to storage:', error);
    }
  }

  /* Method untuk generate unique ID */
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /* Method untuk load more data (infinite scroll) */
  loadMore(): void {
    this.currentPage++;
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    const nextItems = this.historyList.slice(startIndex, endIndex);
    this.displayedHistory = [...this.displayedHistory, ...nextItems];
  }

  /* Method untuk mengecek apakah masih ada data yang bisa dimuat */
  canLoadMore(): boolean {
    return this.displayedHistory.length < this.historyList.length;
  }

  /* TrackBy function untuk optimasi performa Angular */
  trackByHistoryId(index: number, item: HistoryItem): string {
    return item.id;
  }

  /* Method untuk format timestamp menjadi format yang user-friendly */
  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? 'Baru saja' : `${diffMinutes} menit lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam lalu`;
    } else if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    } else {
      return timestamp.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  /* Method untuk format timestamp lengkap */
  formatFullTimestamp(timestamp: Date): string {
    return timestamp.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /* Method untuk membuka detail history item */
  openHistoryDetail(item: HistoryItem): void {
    this.selectedHistoryItem = item;
    this.isHistoryDetailOpen = true;

    /* Inisialisasi map setelah modal terbuka */
    setTimeout(() => {
      this.initializeHistoryMap();
    }, 300);
  }

  /* Method untuk menutup modal detail history */
  closeHistoryDetail(): void {
    this.isHistoryDetailOpen = false;
    this.selectedHistoryItem = null;

    /* Cleanup map */
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  /* Method untuk mengecek apakah history item memiliki koordinat valid */
  hasValidHistoryCoordinates(): boolean {
    return !!(this.selectedHistoryItem?.coordinates?.lat &&
      this.selectedHistoryItem?.coordinates?.lng);
  }

  /* Method untuk inisialisasi map pada modal history detail */
  private initializeHistoryMap(): void {
    if (!this.hasValidHistoryCoordinates()) {
      return;
    }

    try {
      /* Implementasi Leaflet map */
      const L = (window as any).L;
      if (!L) {
        console.error('Leaflet library not loaded');
        return;
      }

      const coords = this.selectedHistoryItem!.coordinates!;
      this.map = L.map('history-map-container').setView([coords.lat, coords.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      L.marker([coords.lat, coords.lng])
        .addTo(this.map)
        .bindPopup(`${this.selectedHistoryItem!.provider}<br>${this.selectedHistoryItem!.phoneNumber}`)
        .openPopup();

    } catch (error) {
      console.error('Error initializing history map:', error);
    }
  }

  /* Method untuk navigasi kembali ke beranda */
  navigateToHome(): void {
    this.router.navigate(['/beranda']);
  }

  /* Method untuk clear seluruh history */
  clearAllHistory(): void {
    /* Implementasi konfirmasi sebelum menghapus */
    const confirmClear = confirm('Apakah Anda yakin ingin menghapus semua riwayat?');
    if (confirmClear) {
      this.historyList = [];
      this.displayedHistory = [];
      this.saveHistoryToStorage();
    }
  }

  /* Method untuk filter history berdasarkan provider */
  filterByProvider(provider: string): void {
    if (provider === 'all') {
      this.initializeDisplayedHistory();
    } else {
      const filtered = this.historyList
    }
  }
}