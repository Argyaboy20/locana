import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {
  currentSlide = 0;
  private slideTimer: any;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}
  
  ngOnInit() {
    /* Define the custom Ionic color for the toolbar */
    const style = document.documentElement.style;
    style.setProperty('--ion-color-locana-primary', '#417cdb');
    style.setProperty('--ion-color-locana-primary-rgb', '65,124,219');
    style.setProperty('--ion-color-locana-primary-contrast', '#ffffff');
    style.setProperty('--ion-color-locana-primary-contrast-rgb', '255,255,255');
    style.setProperty('--ion-color-locana-primary-shade', '#3a6ec1');
    style.setProperty('--ion-color-locana-primary-tint', '#5489df');

    /* Apply important CSS fixes directly */
    document.documentElement.style.setProperty('--ion-toolbar-background', '#417cdb');
    document.documentElement.style.setProperty('--ion-toolbar-color', '#ffffff');

    /* Load the Montserrat font for the title */
    this.loadFont('Montserrat', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

    /* Start the automatic slide rotation */
    this.startSlideRotation();
    
    /* Force toolbar background once DOM is loaded */
    setTimeout(() => {
      const toolbar = document.querySelector('ion-toolbar');
      if (toolbar) {
        toolbar.style.setProperty('--background', '#417cdb');
        toolbar.style.setProperty('background', '#417cdb');
      }
    }, 100);
  }
  
  /* Load external font */
  loadFont(fontName: string, fontUrl: string) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
  }
  
  /* Start automatic slide rotation (every 5 seconds) */
  startSlideRotation() {
    this.slideTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 4;
      
      /* Update the active class on slides manually for better compatibility */
      this.updateActiveSlide();
    }, 5000);
  }
  
  /* Update active slide in the DOM (used as a fallback for Angular binding) */
  updateActiveSlide() {
    /* Hapus semua kelas active terlebih dahulu */
    document.querySelectorAll('.slide').forEach(slide => {
      slide.classList.remove('active');
    });
    
    document.querySelectorAll('.dot').forEach(dot => {
      dot.classList.remove('active');
    });
    
    /* Tambahkan kelas active hanya ke slide dan dot yang aktif */
    const desktopActiveSlide = document.querySelector(`.desktop-view .slide:nth-child(${this.currentSlide + 1})`);
    const mobileActiveSlide = document.querySelector(`.mobile-view .slide:nth-child(${this.currentSlide + 1})`);
    const desktopActiveDot = document.querySelector(`.desktop-view .dot:nth-child(${this.currentSlide + 1})`);
    const mobileActiveDot = document.querySelector(`.mobile-view .dot:nth-child(${this.currentSlide + 1})`);
    
    if (desktopActiveSlide) desktopActiveSlide.classList.add('active');
    if (mobileActiveSlide) mobileActiveSlide.classList.add('active');
    if (desktopActiveDot) desktopActiveDot.classList.add('active');
    if (mobileActiveDot) mobileActiveDot.classList.add('active');
  }
  
  /* Handle registration button click */
  register() {
    console.log('Registration requested');
    /* Implement registration functionality */
  }
  
  /* Handle Google SSO login */
  async loginWithGoogle() {
    try {
      console.log('Google SSO requested');
      const result = await this.authService.loginWithGoogle();
      
      if (result && result.user) {
        console.log('Login berhasil:', result.user);
        
        /* Tampilkan toast pesan sukses */
        const toast = await this.toastController.create({
          message: 'Login berhasil dengan akun Google',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        toast.present();
        
        /* Navigasi ke halaman utama/dashboard */
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Error login Google:', error);
      
      /* Tampilkan toast pesan error */
      const toast = await this.toastController.create({
        message: 'Gagal login dengan Google. Silakan coba lagi.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
    }
  }
  
  /* Clean up resources on component destruction */
  ngOnDestroy() {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }
}