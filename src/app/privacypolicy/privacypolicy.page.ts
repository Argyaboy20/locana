import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { inject } from "@vercel/analytics";

inject();

/* Interface for policy section structure */
interface PolicySection {
  title: string;
  content: string;
  expanded: boolean;
}

@Component({
  selector: 'app-privacypolicy',
  templateUrl: './privacypolicy.page.html',
  styleUrls: ['./privacypolicy.page.scss'],
  standalone: false,
})
export class PrivacypolicyPage implements OnInit, OnDestroy {
  
  /* Component state variables */
  public isLoading: boolean = true;
  public lastUpdated: string = '';
  public policySections: PolicySection[] = [];
  
  /* RxJS subject for component cleanup */
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  /* Angular lifecycle hook - component initialization */
  ngOnInit(): void {
    this.initializeComponent();
  }

  /* Angular lifecycle hook - component cleanup */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* Initialize component data and simulate loading */
  private async initializeComponent(): Promise<void> {
    try {
      /* Simulate API call delay for loading state */
      await this.simulateLoadingDelay(1500);
      
      /* Initialize policy data */
      this.initializePolicyData();
      this.setLastUpdatedDate();
      
      /* Hide loading state */
      this.isLoading = false;
    } catch (error) {
      console.error('Error initializing component:', error);
      this.handleInitializationError();
    }
  }

  /* Simulate API loading delay for better UX */
  private simulateLoadingDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* Initialize policy sections data with comprehensive privacy content */
  private initializePolicyData(): void {
    this.policySections = [
      {
        title: '1. Informasi yang Kami Kumpulkan',
        content: `
          <p><strong>Data Lokasi Real-time:</strong> Aplikasi ini mengumpulkan dan memproses data lokasi secara kontinyu dari sinyal kartu SIM yang aktif untuk memberikan layanan pelacakan posisi yang akurat.</p>
          <p><strong>Informasi Perangkat:</strong> Kami mengumpulkan informasi tentang perangkat Anda termasuk model, sistem operasi, versi aplikasi, dan pengaturan perangkat.</p>
          <p><strong>Data Penggunaan:</strong> Informasi tentang bagaimana Anda menggunakan aplikasi, termasuk fitur yang diakses dan durasi penggunaan.</p>
          <p><strong>Informasi Kontak:</strong> Dengan persetujuan Anda, kami dapat mengakses daftar kontak untuk fitur berbagi lokasi dengan kontak terpercaya.</p>
        `,
        expanded: false
      },
      {
        title: '2. Cara Kami Menggunakan Informasi',
        content: `
          <p><strong>Layanan Pelacakan Lokasi:</strong> Data lokasi digunakan untuk menyediakan layanan pelacakan posisi real-time yang akurat sesuai permintaan Anda.</p>
          <p><strong>Peningkatan Layanan:</strong> Kami menganalisis data penggunaan untuk meningkatkan kualitas dan akurasi layanan kami.</p>
          <p><strong>Keamanan dan Keselamatan:</strong> Informasi dapat digunakan untuk keperluan keamanan, mencegah penyalahgunaan, dan memastikan keselamatan pengguna.</p>
          <p><strong>Komunikasi:</strong> Kami dapat menghubungi Anda terkait pembaruan layanan, fitur baru, atau informasi penting lainnya.</p>
        `,
        expanded: false
      },
      {
        title: '3. Berbagi Informasi dengan Pihak Ketiga',
        content: `
          <p><strong>Tidak Ada Penjualan Data:</strong> Kami tidak akan menjual, menyewakan, atau memperdagangkan informasi pribadi Anda kepada pihak ketiga.</p>
          <p><strong>Penyedia Layanan:</strong> Kami dapat berbagi informasi dengan penyedia layanan tepercaya yang membantu operasional aplikasi, dengan perjanjian kerahasiaan yang ketat.</p>
          <p><strong>Kewajiban Hukum:</strong> Informasi dapat dibagikan jika diwajibkan oleh hukum atau untuk melindungi hak, keamanan, dan keselamatan pengguna.</p>
          <p><strong>Persetujuan Pengguna:</strong> Kami akan meminta persetujuan eksplisit Anda sebelum berbagi informasi untuk tujuan lain.</p>
        `,
        expanded: false
      },
      {
        title: '4. Keamanan Data',
        content: `
          <p><strong>Enkripsi End-to-End:</strong> Semua data lokasi dienkripsi menggunakan protokol keamanan tingkat militer selama transmisi dan penyimpanan.</p>
          <p><strong>Server Aman:</strong> Data disimpan di server dengan standar keamanan ISO 27001 dan sertifikasi keamanan internasional.</p>
          <p><strong>Akses Terbatas:</strong> Hanya personel yang berwenang dengan keperluan bisnis yang dapat mengakses data Anda.</p>
          <p><strong>Audit Keamanan:</strong> Kami melakukan audit keamanan berkala dan pembaruan sistem untuk melindungi data Anda.</p>
        `,
        expanded: false
      },
      {
        title: '5. Hak Pengguna',
        content: `
          <p><strong>Akses Data:</strong> Anda berhak mengakses dan mengetahui data pribadi apa saja yang kami simpan tentang Anda.</p>
          <p><strong>Koreksi Data:</strong> Anda dapat meminta koreksi atau pembaruan data pribadi yang tidak akurat.</p>
          <p><strong>Penghapusan Data:</strong> Anda berhak meminta penghapusan data pribadi Anda dari sistem kami.</p>
          <p><strong>Portabilitas Data:</strong> Anda dapat meminta salinan data pribadi Anda dalam format yang dapat dibaca mesin.</p>
          <p><strong>Penarikan Persetujuan:</strong> Anda dapat menarik persetujuan kapan saja, meskipun ini dapat mempengaruhi fungsi aplikasi.</p>
        `,
        expanded: false
      },
      {
        title: '6. Penyimpanan dan Penghapusan Data',
        content: `
          <p><strong>Periode Penyimpanan:</strong> Data lokasi disimpan selama akun Anda aktif dan hingga 30 hari setelah penghapusan akun untuk keperluan backup.</p>
          <p><strong>Penghapusan Otomatis:</strong> Data yang tidak diperlukan akan dihapus secara otomatis sesuai dengan jadwal retensi data kami.</p>
          <p><strong>Penghapusan Manual:</strong> Anda dapat menghapus data lokasi tertentu melalui pengaturan aplikasi kapan saja.</p>
          <p><strong>Backup Data:</strong> Backup data disimpan terenkripsi dan dihapus sesuai dengan kebijakan retensi yang ditetapkan.</p>
        `,
        expanded: false
      },
      {
        title: '7. Perubahan Kebijakan',
        content: `
          <p><strong>Notifikasi Perubahan:</strong> Kami akan memberitahu Anda melalui aplikasi atau email jika ada perubahan signifikan pada kebijakan privasi ini.</p>
          <p><strong>Periode Transisi:</strong> Perubahan kebijakan akan berlaku 30 hari setelah notifikasi diberikan.</p>
          <p><strong>Versi Terbaru:</strong> Versi terbaru dari kebijakan privasi selalu tersedia di dalam aplikasi.</p>
          <p><strong>Riwayat Perubahan:</strong> Kami menyimpan riwayat perubahan kebijakan untuk transparansi.</p>
        `,
        expanded: false
      },
      {
        title: '8. Kontak dan Dukungan',
        content: `
          <p><strong>Tim Privasi:</strong> Untuk pertanyaan terkait privasi, hubungi tim privasi kami di privacy@locationtracker.com</p>
          <p><strong>Dukungan Pelanggan:</strong> Untuk bantuan umum, hubungi support@locationtracker.com atau melalui chat dalam aplikasi.</p>
          <p><strong>Waktu Respons:</strong> Kami berkomitmen merespons pertanyaan privasi dalam 24 jam pada hari kerja.</p>
          <p><strong>Alamat Kantor:</strong> PT. LocationTracker Indonesia, Jl. Teknologi No. 123, Jakarta Selatan 12950</p>
        `,
        expanded: false
      }
    ];
  }

  /* Set last updated date to current date */
  private setLastUpdatedDate(): void {
    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    };
    this.lastUpdated = currentDate.toLocaleDateString('id-ID', options);
  }

  /* Handle component initialization errors */
  private async handleInitializationError(): Promise<void> {
    this.isLoading = false;
    const toast = await this.toastController.create({
      message: 'Terjadi kesalahan saat memuat kebijakan privasi. Silakan coba lagi.',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  /* Navigation method to handle back button functionality */
  public navigateBack(): void {
    try {
      this.router.navigate(['/setting'], { 
        replaceUrl: false,
        skipLocationChange: false 
      });
    } catch (error) {
      console.error('Navigation error:', error);
      this.showErrorToast('Gagal kembali ke halaman sebelumnya');
    }
  }

  /* Toggle expand/collapse state of policy sections */
  public toggleSection(index: number): void {
    if (this.isValidSectionIndex(index)) {
      this.policySections[index].expanded = !this.policySections[index].expanded;
      
      /* Smooth scroll to section if expanding */
      if (this.policySections[index].expanded) {
        this.scrollToSection(index);
      }
    }
  }

  /* Validate section index to prevent array out of bounds */
  private isValidSectionIndex(index: number): boolean {
    return index >= 0 && index < this.policySections.length;
  }

  /* Smooth scroll to specific section after expansion */
  private scrollToSection(index: number): void {
    setTimeout(() => {
      const element = document.querySelector(`ion-content`);
      if (element) {
        const sectionElements = document.querySelectorAll('.policy-section');
        if (sectionElements[index]) {
          sectionElements[index].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }
    }, 300); /* Delay to allow expansion animation to complete */
  }

  /* Handle policy acceptance with user confirmation */
  public async acceptPolicy(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Konfirmasi Persetujuan',
      message: 'Dengan menyetujui kebijakan privasi ini, Anda memberikan izin untuk pengumpulan dan penggunaan data sesuai yang dijelaskan. Apakah Anda yakin?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Ya, Saya Setuju',
          handler: () => {
            this.processAcceptance();
          }
        }
      ]
    });
    await alert.present();
  }

  /* Process policy acceptance and show confirmation */
  private async processAcceptance(): Promise<void> {
    try {
      const loading = await this.loadingController.create({
        message: 'Menyimpan persetujuan...',
        spinner: 'circular',
        duration: 2000
      });
      await loading.present();

      /* Simulate API call to save acceptance */
      await this.saveAcceptanceToServer();
      
      await loading.dismiss();
      
      const toast = await this.toastController.create({
        message: 'Terima kasih! Persetujuan Anda telah disimpan.',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        buttons: [
          {
            text: 'OK',
            role: 'cancel'
          }
        ]
      });
      await toast.present();

      /* Navigate back after successful acceptance */
      setTimeout(() => {
        this.navigateBack();
      }, 2000);

    } catch (error) {
      console.error('Error processing acceptance:', error);
      this.showErrorToast('Gagal menyimpan persetujuan. Silakan coba lagi.');
    }
  }

  /* Simulate API call to save policy acceptance */
  private async saveAcceptanceToServer(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        /* Here you would implement actual API call */
        console.log('Policy acceptance saved with timestamp:', new Date().toISOString());
        resolve();
      }, 1500);
    });
  }

  /* Handle contact us functionality */
  public async contactUs(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Hubungi Kami',
      message: 'Pilih cara untuk menghubungi tim dukungan kami:',
      buttons: [
        {
          text: 'Email',
          handler: () => {
            this.openEmailClient();
          }
        },
        {
          text: 'WhatsApp',
          handler: () => {
            this.openWhatsApp();
          }
        },
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary'
        }
      ]
    });
    await alert.present();
  }

  /* Open email client with pre-filled support email */
  private openEmailClient(): void {
    try {
      const subject = encodeURIComponent('Pertanyaan Kebijakan Privasi - LocationTracker');
      const body = encodeURIComponent('Halo Tim Support,\n\nSaya memiliki pertanyaan terkait kebijakan privasi aplikasi LocationTracker, Locana App.\n\nPertanyaan saya:\n\n\nTerima kasih.');
      const mailtoUrl = `mailto:care@locana.id?subject=${subject}&body=${body}`;
      window.open(mailtoUrl, '_system');
    } catch (error) {
      console.error('Error opening email client:', error);
      this.showErrorToast('Gagal membuka aplikasi email');
    }
  }

  /* Open WhatsApp with pre-filled message */
  private openWhatsApp(): void {
    try {
      const phoneNumber = '6285761787971'; /* Replace with actual support number */
      const message = encodeURIComponent('Halo, saya memiliki pertanyaan terkait kebijakan privasi aplikasi LocationTracker, Locana App.');
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_system');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      this.showErrorToast('Gagal membuka WhatsApp');
    }
  }

  /* Navigate to terms of service page */
  public openTerms(): void {
    try {
      this.router.navigate(['/privacypolicy']);
    } catch (error) {
      console.error('Error navigating to terms:', error);
      this.showErrorToast('Halaman syarat penggunaan tidak tersedia');
    }
  }

  /* Navigate to support page */
  public openSupport(): void {
    try {
      this.router.navigate(['/support']);
    } catch (error) {
      console.error('Error navigating to support:', error);
      this.showErrorToast('Halaman dukungan tidak tersedia');
    }
  }

  /* Navigate to FAQ page */
  public openFAQ(): void {
    try {
      this.router.navigate(['/faq']);
    } catch (error) {
      console.error('Error navigating to FAQ:', error);
      this.showErrorToast('Halaman FAQ tidak tersedia');
    }
  }

  /* Scroll to top of the page smoothly */
  public scrollToTop(): void {
    try {
      const content = document.querySelector('ion-content');
      if (content) {
        content.scrollToTop(500); /* 500ms smooth scroll duration */
      }
    } catch (error) {
      console.error('Error scrolling to top:', error);
    }
  }

  /* Utility method to show error toast messages */
  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /* Expand all policy sections for easy reading */
  public expandAllSections(): void {
    this.policySections.forEach(section => {
      section.expanded = true;
    });
  }

  /* Collapse all policy sections for compact view */
  public collapseAllSections(): void {
    this.policySections.forEach(section => {
      section.expanded = false;
    });
  }

  /* Search functionality within policy content */
  public searchInPolicy(searchTerm: string): PolicySection[] {
    if (!searchTerm.trim()) {
      return this.policySections;
    }

    return this.policySections.filter(section => 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /* Get policy section by index with validation */
  public getPolicySection(index: number): PolicySection | null {
    if (this.isValidSectionIndex(index)) {
      return this.policySections[index];
    }
    return null;
  }

  /* Check if user has accepted policy (for future implementation) */
  public hasAcceptedPolicy(): boolean {
    /* This would typically check local storage or server state */
    const acceptance = localStorage.getItem('policy_accepted');
    return acceptance === 'true';
  }

  /* Get policy acceptance date (for future implementation) */
  public getPolicyAcceptanceDate(): string | null {
    return localStorage.getItem('policy_acceptance_date');
  }

  /* Method to handle deep linking to specific sections */
  public navigateToSection(sectionId: string): void {
    const sectionIndex = this.policySections.findIndex(section => 
      section.title.toLowerCase().includes(sectionId.toLowerCase())
    );
    
    if (sectionIndex !== -1) {
      this.policySections[sectionIndex].expanded = true;
      this.scrollToSection(sectionIndex);
    }
  }

  /* Performance optimization: track by function for *ngFor */
  public trackBySection(index: number, section: PolicySection): string {
    return section.title;
  }

}