import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MenuController, AlertController, ModalController, AnimationController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ModalContentComponent } from '../modal-content/modal-content.component';

@Component({
  selector: 'app-beranda',
  templateUrl: './beranda.page.html',
  styleUrls: ['./beranda.page.scss'],
  standalone: false,
})
export class BerandaPage implements OnInit {
  phoneNumber: string = '';

  /* Tambahkan property untuk modal notifikasi */
  isNotificationModalOpen = false;

  /*Mapping for provider prefixes */
  private providerPrefixes: { [key: string]: string } = {
    '0811': 'Telkomsel', '0812': 'Telkomsel', '0813': 'Telkomsel', '0821': 'Telkomsel', '0822': 'Telkomsel',
    '0823': 'Telkomsel', '0851': 'Telkomsel', '0852': 'Telkomsel', '0853': 'Telkomsel',
    '0814': 'Indosat', '0815': 'Indosat', '0816': 'Indosat', '0855': 'Indosat', '0856': 'Indosat', '0857': 'Indosat', '0858': 'Indosat',
    '0817': 'XL', '0818': 'XL', '0819': 'XL', '0859': 'XL', '0877': 'XL', '0878': 'XL',
    '0831': 'Axis', '0832': 'Axis', '0833': 'Axis', '0838': 'Axis',
    '0881': 'Smartfren', '0882': 'Smartfren', '0883': 'Smartfren', '0884': 'Smartfren', '0885': 'Smartfren', '0886': 'Smartfren', '0887': 'Smartfren', '0888': 'Smartfren', '0889': 'Smartfren',
    '0895': '3', '0896': '3', '0897': '3', '0898': '3', '0899': '3',
  };

  /* Detailed mapping for specific prefixes to locations (more accurate) */
  private prefixLocations: { [key: string]: { region: string, city: string, signalStrength: string } } = {
    /* Telkomsel */
    '0811': { region: 'DKI Jakarta', city: 'Jakarta Pusat', signalStrength: 'Sangat Kuat' },
    '0812': { region: 'Jawa Barat', city: 'Bandung', signalStrength: 'Kuat' },
    '0813': { region: 'Jawa Timur', city: 'Surabaya', signalStrength: 'Kuat' },
    '0821': { region: 'Sumatera Utara', city: 'Medan', signalStrength: 'Kuat' },
    '0822': { region: 'Sulawesi Selatan', city: 'Makassar', signalStrength: 'Sedang' },
    '0823': { region: 'DI Yogyakarta', city: 'Yogyakarta', signalStrength: 'Kuat' },
    '0851': { region: 'Kalimantan Timur', city: 'Samarinda', signalStrength: 'Sedang' },
    '0852': { region: 'Bali', city: 'Denpasar', signalStrength: 'Kuat' },
    '0853': { region: 'Nusa Tenggara Barat', city: 'Mataram', signalStrength: 'Sedang' },

    /* Indosat */
    '0814': { region: 'DKI Jakarta', city: 'Jakarta Selatan', signalStrength: 'Kuat' },
    '0815': { region: 'Jawa Barat', city: 'Bandung', signalStrength: 'Kuat' },
    '0816': { region: 'Jawa Timur', city: 'Surabaya', signalStrength: 'Sedang' },
    '0855': { region: 'Jawa Tengah', city: 'Semarang', signalStrength: 'Kuat' },
    '0856': { region: 'Bali', city: 'Denpasar', signalStrength: 'Kuat' },
    '0857': { region: 'Sumatera Selatan', city: 'Palembang', signalStrength: 'Sedang' },
    '0858': { region: 'Kalimantan Selatan', city: 'Banjarmasin', signalStrength: 'Sedang' },

    /* XL */
    '0817': { region: 'DKI Jakarta', city: 'Jakarta Barat', signalStrength: 'Kuat' },
    '0818': { region: 'Jawa Barat', city: 'Bandung', signalStrength: 'Kuat' },
    '0819': { region: 'DI Yogyakarta', city: 'Yogyakarta', signalStrength: 'Kuat' },
    '0859': { region: 'Jawa Timur', city: 'Surabaya', signalStrength: 'Kuat' },
    '0877': { region: 'Bali', city: 'Kuta', signalStrength: 'Kuat' },
    '0878': { region: 'Nusa Tenggara Barat', city: 'Lombok', signalStrength: 'Sedang' },

    /* Axis */
    '0831': { region: 'DKI Jakarta', city: 'Jakarta Timur', signalStrength: 'Sedang' },
    '0832': { region: 'Jawa Barat', city: 'Bandung', signalStrength: 'Sedang' },
    '0833': { region: 'Jawa Timur', city: 'Surabaya', signalStrength: 'Sedang' },
    '0838': { region: 'Jawa Timur', city: 'Malang', signalStrength: 'Sedang' },

    /* Smartfren */
    '0881': { region: 'DKI Jakarta', city: 'Jakarta Utara', signalStrength: 'Sedang' },
    '0882': { region: 'Jawa Barat', city: 'Bandung', signalStrength: 'Sedang' },
    '0883': { region: 'Jawa Timur', city: 'Surabaya', signalStrength: 'Sedang' },
    '0884': { region: 'Sumatera Utara', city: 'Medan', signalStrength: 'Lemah' },
    '0885': { region: 'DI Yogyakarta', city: 'Yogyakarta', signalStrength: 'Sedang' },
    '0886': { region: 'Jawa Tengah', city: 'Solo', signalStrength: 'Sedang' },
    '0887': { region: 'Sulawesi Selatan', city: 'Makassar', signalStrength: 'Lemah' },
    '0888': { region: 'Bali', city: 'Denpasar', signalStrength: 'Sedang' },
    '0889': { region: 'Lampung', city: 'Bandar Lampung', signalStrength: 'Lemah' },

    /* 3 (Tri) */
    '0895': { region: 'DKI Jakarta', city: 'Jakarta Selatan', signalStrength: 'Sedang' },
    '0896': { region: 'Jawa Barat', city: 'Bandung', signalStrength: 'Sedang' },
    '0897': { region: 'Jawa Timur', city: 'Surabaya', signalStrength: 'Sedang' },
    '0898': { region: 'Bali', city: 'Denpasar', signalStrength: 'Sedang' },
    '0899': { region: 'Nusa Tenggara Barat', city: 'Lombok', signalStrength: 'Lemah' },
  };

  /* BTS Tower data for more precise location tracking */
  private btsTowers: { [key: string]: { lat: number, lng: number, radius: number }[] } = {
    'Jakarta Pusat': [
      { lat: -6.1753924, lng: 106.8271528, radius: 1.2 },
      { lat: -6.1862681, lng: 106.8251871, radius: 1.5 }
    ],
    'Jakarta Selatan': [
      { lat: -6.2614927, lng: 106.8105998, radius: 1.3 },
      { lat: -6.2550779, lng: 106.7973862, radius: 1.1 }
    ],
    'Jakarta Barat': [
      { lat: -6.1683295, lng: 106.7588683, radius: 1.4 },
      { lat: -6.1539936, lng: 106.7335701, radius: 1.2 }
    ],
    'Jakarta Timur': [
      { lat: -6.2253126, lng: 106.9004481, radius: 1.1 },
      { lat: -6.2158413, lng: 106.8800354, radius: 1.3 }
    ],
    'Jakarta Utara': [
      { lat: -6.1213968, lng: 106.8797479, radius: 1.2 },
      { lat: -6.1381433, lng: 106.8693066, radius: 1.4 }
    ],
    'Bandung': [
      { lat: -6.9034443, lng: 107.6431439, radius: 1.3 },
      { lat: -6.9147444, lng: 107.6098404, radius: 1.2 }
    ],
    'Surabaya': [
      { lat: -7.2756141, lng: 112.7425615, radius: 1.4 },
      { lat: -7.2888862, lng: 112.7542921, radius: 1.3 }
    ],
    'Semarang': [
      { lat: -7.0051453, lng: 110.4381254, radius: 1.1 },
      { lat: -6.9932251, lng: 110.4208731, radius: 1.2 }
    ]
    /* Additional cities can be added as needed */
  };

  constructor(
    private menuCtrl: MenuController,
    private alertController: AlertController,
    private modalController: ModalController,
    private animationCtrl: AnimationController,
    private router: Router
  ) { }

  ngOnInit() {
    this.addAlertCustomStyles();
  }

  addAlertCustomStyles() {
    /* Create style element if it doesn't exist */
    let style = document.getElementById('custom-alert-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'custom-alert-styles';
      style.innerHTML = `
        .custom-alert .alert-wrapper {
          border-radius: 20px;
          background: linear-gradient(135deg, #6863f2 0%, #6863f2 100%);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .custom-alert .alert-head {
          background: rgba(104, 99, 242, 0.8);
          backdrop-filter: blur(5px);
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .custom-alert .alert-title {
          color: white;
          font-weight: 600;
          font-size: 1.2rem;
          text-align: center;
        }
        
        .custom-alert .alert-message {
          color: rgba(255, 255, 255, 0.9);
          padding: 10px;
          text-align: center;
          margin-top: 20px;
        }
        
        .custom-alert .alert-button-group {
          display: flex;
          justify-content: center;
        }
        
        .custom-alert .alert-button {
          color: white;
          background: rgba(104, 99, 242, 0.7);
          border-radius: 15px;
          margin: 10px;
          min-width: 100px;
          font-weight: 600;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        
        .custom-alert .alert-button:hover {
          transform: translateY(-2px);
          background: rgba(104, 99, 242, 0.9);
        }
        
        .custom-alert .alert-button-inner {
          justify-content: center;
        }
        
        .custom-alert .alert-button:active {
          transform: translateY(0px);
        }
      `;
      document.head.appendChild(style);
    }
  }

  enterAnimation() {
    return (baseEl: HTMLElement) => {
      const baseAnimation = this.animationCtrl.create();
      const backdropAnimation = this.animationCtrl.create();
      const wrapperAnimation = this.animationCtrl.create();

      backdropAnimation
        .addElement(baseEl.querySelector('ion-backdrop')!)
        .fromTo('opacity', 0.01, 'var(--backdrop-opacity)');

      wrapperAnimation
        .addElement(baseEl.querySelector('.alert-wrapper')!)
        .keyframes([
          { offset: 0, opacity: '0', transform: 'scale(0.8)' },
          { offset: 1, opacity: '1', transform: 'scale(1)' }
        ]);

      return baseAnimation
        .addElement(baseEl)
        .easing('cubic-bezier(0.34, 1.56, 0.64, 1)')
        .duration(300)
        .addAnimation([backdropAnimation, wrapperAnimation]);
    };
  }

  leaveAnimation() {
    return (baseEl: HTMLElement) => {
      const baseAnimation = this.animationCtrl.create();
      const backdropAnimation = this.animationCtrl.create();
      const wrapperAnimation = this.animationCtrl.create();

      backdropAnimation
        .addElement(baseEl.querySelector('ion-backdrop')!)
        .fromTo('opacity', 'var(--backdrop-opacity)', 0);

      wrapperAnimation
        .addElement(baseEl.querySelector('.alert-wrapper')!)
        .keyframes([
          { offset: 0, opacity: '1', transform: 'scale(1)' },
          { offset: 1, opacity: '0', transform: 'scale(0.9)' }
        ]);

      return baseAnimation
        .addElement(baseEl)
        .easing('ease-out')
        .duration(200)
        .addAnimation([backdropAnimation, wrapperAnimation]);
    };
  }

  openMenu() {
    this.menuCtrl.open();
  }

  validateNumber(event: any) {
    const input = event.target.value;

    /* Remove any non-numeric characters */
    const numericValue = input.replace(/[^0-9]/g, '');

    /* If the input was changed (contained non-numeric chars) */
    if (input !== numericValue) {
      this.phoneNumber = numericValue;
      this.showAlertOnlyNumbers();
    }

    /* Add animation class when the input has content */
    const inputElement = event.target;
    if (this.phoneNumber.length > 0) {
      inputElement.classList.add('animated-input');
    } else {
      inputElement.classList.remove('animated-input');
    }
  }

  async showAlertOnlyNumbers() {
    const alert = await this.alertController.create({
      header: 'Peringatan',
      message: 'Masukkan hanya angka untuk nomor telepon',
      buttons: ['OK'],
      cssClass: 'custom-alert',
      enterAnimation: this.enterAnimation(),
      leaveAnimation: this.leaveAnimation()
    });

    await alert.present();
  }

  async trackNumber() {
    if (!this.phoneNumber) {
      const alert = await this.alertController.create({
        header: 'Peringatan',
        message: 'Silakan masukkan nomor telepon terlebih dahulu',
        buttons: ['OK'],
        cssClass: 'custom-alert',
        enterAnimation: this.enterAnimation(),
        leaveAnimation: this.leaveAnimation()
      });
      await alert.present();
      return;
    }

    if (this.phoneNumber.length < 10 || this.phoneNumber.length > 13) {
      const alert = await this.alertController.create({
        header: 'Nomor Tidak Valid',
        message: 'Masukkan nomor telepon Indonesia yang valid (10-13 digit)',
        buttons: ['OK'],
        cssClass: 'custom-alert',
        enterAnimation: this.enterAnimation(),
        leaveAnimation: this.leaveAnimation()
      });
      await alert.present();
      return;
    }


    /* Show loading before displaying results */
    const loadingAlert = await this.alertController.create({
      header: 'Melacak Nomor',
      message: 'Sedang memproses permintaan...',
      backdropDismiss: false,
      cssClass: 'custom-alert',
      enterAnimation: this.enterAnimation(),
      leaveAnimation: this.leaveAnimation()
    });
    await loadingAlert.present();

    /* Simulate tracking process with delay - mimics real API call to BTS data */
    setTimeout(async () => {
      await loadingAlert.dismiss();
      this.showLocationModal();
    }, 2000);
  }

  /* Get location data based on phone prefix */
  getLocationData(phoneNumber: string): {
    provider: string;
    region: string;
    city: string;
    signalStrength: string;
    coordinates?: { lat: number | undefined; lng: number | undefined } | undefined;
  } {
    let normalizedNumber = phoneNumber;
    let prefix = '';

    /* Normalize phone number format */
    if (normalizedNumber.startsWith('62')) {
      normalizedNumber = '0' + normalizedNumber.substring(2);
    }

    /* Extract prefix (first 4 digits) */
    prefix = normalizedNumber.substring(0, 4);

    /* Get provider */
    const provider = this.providerPrefixes[prefix] || 'Tidak diketahui';

    /* Get detailed location information */
    let locationData = this.prefixLocations[prefix];

    if (!locationData) {
      /* Fallback if specific prefix not found - use first prefix of provider */
      const providerFirstPrefix = Object.keys(this.prefixLocations).find(
        key => this.providerPrefixes[key] === provider
      );

      if (providerFirstPrefix) {
        locationData = this.prefixLocations[providerFirstPrefix];
      } else {
        return {
          provider: provider,
          region: 'Tidak diketahui',
          city: 'Tidak diketahui',
          signalStrength: 'Tidak terdeteksi'
        };
      }
    }

    /* Find BTS tower coordinates for the city */
    let coordinates;
    const btsData = this.btsTowers[locationData.city];
    if (btsData && btsData.length > 0) {
      /* Use last 3 digits of phone number to make it deterministic but seem random */
      const lastDigits = parseInt(normalizedNumber.slice(-3));
      const btsIndex = lastDigits % btsData.length;

      /* Add slight variation based on phone number */
      const variance = (lastDigits % 100) / 1000; // Small variance

      coordinates = {
        lat: btsData[btsIndex].lat + variance,
        lng: btsData[btsIndex].lng - variance
      };
    }

    return {
      provider: provider,
      region: locationData.region,
      city: locationData.city,
      signalStrength: locationData.signalStrength,
      coordinates: coordinates
    };
  }

  async showLocationModal() {
    /* Get detailed location data using our new function */
    const locationData = this.getLocationData(this.phoneNumber);

    const modal = await this.modalController.create({
      component: ModalContentComponent,
      componentProps: {
        phoneNumber: this.phoneNumber,
        provider: locationData.provider,
        region: locationData.region,
        city: locationData.city,
        signalStrength: locationData.signalStrength,
        coordinates: locationData.coordinates
      },
      cssClass: 'location-modal'
    });

    await modal.present();
  }

  ionViewDidEnter() {
    /* Ketika kembali ke halaman Beranda (home), pastikan tab yang aktif adalah 'home' */
    this.activeTab = 'home';
  }

  activeTab: string = 'home';

  navigateToTab(tabName: string) {
    /* Set tab yang aktif */
    this.activeTab = tabName;

    if (tabName === 'home') {
      /* Jika sudah di halaman home, hanya perlu mengubah indikator tab aktif */
      if (this.router.url !== '/beranda') {
        this.router.navigate(['/beranda'], {
          state: { animation: 'tab-transition' }
        });
      }
    } else if (tabName === 'security') {
      /* Navigasi ke halaman security */
      this.router.navigate(['/security'], {
        state: { animation: 'tab-transition' }
      });
    }
  }

  selectTab(tabName: string) {
    /* Hapus selected dari semua tab */
    const tabButtons = document.querySelectorAll('ion-tab-button');
    tabButtons.forEach(button => {
      button.removeAttribute('selected');
    });

    /* Tambahkan selected ke tab yang dipilih */
    const selectedTab = document.querySelector(`ion-tab-button[tab="${tabName}"]`);
    if (selectedTab) {
      selectedTab.setAttribute('selected', 'true');
    }
  }

  async confirmLogout() {
    /* Tutup menu terlebih dahulu */
    this.menuCtrl.close();

    const alert = await this.alertController.create({
      header: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin keluar dari aplikasi?',
      buttons: [
        {
          text: 'TIDAK',
          role: 'cancel',
          cssClass: 'secondary-button'
        },
        {
          text: 'IYA',
          cssClass: 'primary-button',
          handler: () => {
            this.logout();
          }
        }
      ],
      cssClass: 'custom-alert',
      enterAnimation: this.enterAnimation(),
      leaveAnimation: this.leaveAnimation()
    });

    await alert.present();
  }

  /* Metode untuk menangani proses logout */
  logout() {
    /* Di sini Anda bisa menambahkan logika untuk menghapus token atau session storage */

    /* Bersihkan form data */
    this.phoneNumber = '';

    // Navigasi ke /tabs/tab1 dengan replaceUrl: true
    this.router.navigate(['/'], {
      replaceUrl: true
    });

    // Menghapus history navigasi sehingga tidak bisa kembali
    setTimeout(() => {
      history.pushState(null, '', location.href);
      window.onpopstate = function () {
        history.pushState(null, '', location.href);
      };
    }, 100);
  }

  /* Method untuk membuka modal notifikasi */
  openNotificationModal(): void {
    this.isNotificationModalOpen = true;
  }

  /* Method untuk menutup modal notifikasi */
  closeNotificationModal(): void {
    this.isNotificationModalOpen = false;
  }

  /* Method untuk navigasi ke halaman history */
  navigateToHistory(): void {
    this.router.navigate(['/history']);
  }

}