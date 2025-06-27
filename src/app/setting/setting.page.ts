import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { inject } from "@vercel/analytics";

inject();

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
  standalone: false,
})
export class SettingPage implements OnInit {
  /* Modal state management */
  isContactModalOpen = false;
  isAccessModalOpen = false;
  
  /* Access permission states */
  trackingPermission = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private location: Location
  ) { }

  ngOnInit() {
    /* Load saved tracking permission state from localStorage */
    const savedTrackingPermission = localStorage.getItem('trackingPermission');
    if (savedTrackingPermission !== null) {
      this.trackingPermission = JSON.parse(savedTrackingPermission);
    }
  }

  /* Navigation method to handle back button functionality */
  navigateBack(): void {
    this.router.navigate(['/beranda']);
  }

  /* Method to open access modal */
  openAccessModal(): void {
    this.isAccessModalOpen = true;
  }

  /* Method to close access modal */
  closeAccessModal(): void {
    this.isAccessModalOpen = false;
  }

  /* Method to handle tracking permission toggle change */
  onTrackingToggleChange(event: any): void {
    this.trackingPermission = event.detail.checked;
    
    /* Save the tracking permission state to localStorage */
    localStorage.setItem('trackingPermission', JSON.stringify(this.trackingPermission));
    
    /* You can add additional logic here for handling location permissions */
    if (this.trackingPermission) {
      console.log('Tracking permission enabled');
      /* Request location permission from the device if needed */
      // this.requestLocationPermission();
    } else {
      console.log('Tracking permission disabled');
      /* Handle disabling location tracking */
      // this.disableLocationTracking();
    }
  }

  /* Method to open contact modal */
  openContactModal(): void {
    this.isContactModalOpen = true;
  }

  /* Method to close contact modal */
  closeContactModal(): void {
    this.isContactModalOpen = false;
  }

  /* Method to handle WhatsApp contact with pre-filled message */
  openWhatsApp(): void {
    const phoneNumber = '6285761787971'; 
    const message = encodeURIComponent('Hi Locana Admin, saya ingin bertanya tentang sesuatu. Bisakah dibantu?');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    /* Open WhatsApp in new window/tab */
    window.open(whatsappUrl, '_blank');
    
    /* Close modal after opening WhatsApp */
    this.closeContactModal();
  }

  /* Method to handle email contact with pre-filled subject and message */
  openEmail(): void {
    const emailAddress = 'care@locana.id';
    const subject = encodeURIComponent('Tanya ke Minna');
    const body = encodeURIComponent('Hi Locana Admin, saya ingin bertanya tentang sesuatu. Bisakah dibantu?');
    const mailtoUrl = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    
    /* Open email client with pre-filled data */
    window.location.href = mailtoUrl;
    
    /* Close modal after opening email */
    this.closeContactModal();
  }

  /* Method to show confirmation alert before account deletion */
  async confirmDeleteAccount(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Hapus Akun',
      message: 'Yakin ingin menghapus akun?',
      buttons: [
        {
          text: 'Tidak',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: () => {
            /* Do nothing when user cancels, stay on current page */
            console.log('Account deletion cancelled');
          }
        },
        {
          text: 'Ya',
          cssClass: 'alert-button-confirm',
          handler: () => {
            /* Execute account deletion and navigate to home */
            this.deleteAccount();
          }
        }
      ]
    });

    await alert.present();
  }

  /* Private method to handle account deletion process */
  private deleteAccount(): void {
    /* Clear browser history to prevent going back */
    history.replaceState(null, '', '/');
    
    /* Clear any stored authentication data or user data */
    localStorage.clear();
    sessionStorage.clear();
    
    /* Navigate to home page and replace current history entry */
    this.router.navigateByUrl('/', { replaceUrl: true }).then(() => {
      /* Disable browser back button by manipulating history */
      window.addEventListener('popstate', this.preventBackNavigation.bind(this), false);
      
      /* Push a new state to prevent back navigation */
      history.pushState(null, '', '/');
    });
  }

  /* Method to prevent back navigation after account deletion */
  private preventBackNavigation(event: PopStateEvent): void {
    /* Always redirect to home page if user tries to go back */
    history.pushState(null, '', '/');
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}