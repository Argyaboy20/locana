import { Component, OnInit } from '@angular/core';
import { AlertController, AnimationController } from '@ionic/angular';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  
  passwordRequirements = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  constructor(
    private alertController: AlertController,
    private animationCtrl: AnimationController,
    private router: Router 
  ) {}

  ngOnInit() {
    /* Check screen size on init */
    this.checkScreenSize();
    
    // Add resize event listener
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
    
    /* Add global styles for alert customization */
    this.addAlertCustomStyles();
  }

  /* Method to add custom alert styles */
  addAlertCustomStyles() {
    /* Create style element if it doesn't exist */
    let style = document.getElementById('custom-alert-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'custom-alert-styles';
      style.innerHTML = `
        .custom-alert .alert-wrapper {
          border-radius: 20px;
          background: linear-gradient(135deg, #417cdb 0%, #6863f2 100%);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .custom-alert .alert-head {
          background: rgba(0, 35, 89, 0.3);
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
          background: rgba(0, 35, 89, 0.3);
          border-radius: 15px;
          margin: 10px;
          min-width: 100px;
          font-weight: 600;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        
        .custom-alert .alert-button:hover {
          transform: translateY(-2px);
          background: rgba(0, 35, 89, 0.5);
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

  /* Method to check screen size and toggle views */
  checkScreenSize() {
    const mobileView = document.querySelector('.mobile-view');
    const desktopView = document.querySelector('.desktop-view');
    
    if (window.innerWidth >= 768) {
      if (mobileView && desktopView) {
        mobileView.classList.add('hidden');
        desktopView.classList.remove('hidden');
      }
    } else {
      if (mobileView && desktopView) {
        mobileView.classList.remove('hidden');
        desktopView.classList.add('hidden');
      }
    }
  }
  
  /* Toggle password visibility */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  /* Check password requirements whenever password changes */
  ngDoCheck() {
    if (this.password) {
      this.checkPasswordRequirements();
    }
  }
  
  /* Validate password against requirements */
  checkPasswordRequirements() {
    this.passwordRequirements = {
      minLength: this.password.length >= 6,
      hasUpperCase: /[A-Z]/.test(this.password),
      hasLowerCase: /[a-z]/.test(this.password),
      hasNumber: /[0-9]/.test(this.password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(this.password)
    };
  }
  
  /*/ Check if all password requirements are met */
  isPasswordValid() {
    return Object.values(this.passwordRequirements).every(requirement => requirement === true);
  }

  /* Method to validate email */
  validateEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /* Method to handle sign up */
  async signUp() {
    // Validate all fields
    if (!this.username) {
      await this.presentAlert('Username diperlukan', 'Harap masukkan username Anda.');
      return;
    }
    
    if (!this.email) {
      await this.presentAlert('Email diperlukan', 'Harap masukkan alamat email Anda.');
      return;
    }
    
    if (!this.validateEmail(this.email)) {
      await this.presentAlert('Format Email Salah', 'Harap masukkan alamat email yang valid.');
      return;
    }
    
    if (!this.password) {
      await this.presentAlert('Password diperlukan', 'Harap masukkan password Anda.');
      return;
    }
    
    if (!this.isPasswordValid()) {
      let missingRequirements = [];
      
      if (!this.passwordRequirements.minLength) missingRequirements.push('minimal 6 karakter');
      if (!this.passwordRequirements.hasUpperCase) missingRequirements.push('mengandung huruf kapital');
      if (!this.passwordRequirements.hasLowerCase) missingRequirements.push('mengandung huruf kecil');
      if (!this.passwordRequirements.hasNumber) missingRequirements.push('mengandung angka');
      if (!this.passwordRequirements.hasSpecialChar) missingRequirements.push('mengandung karakter spesial');
      
      await this.presentAlert(
        'Password tidak memenuhi persyaratan', 
        `Password harus ${missingRequirements.join(', ')}.`
      );
      return;
    }
    
    /* If all validations pass, proceed with registration */
    console.log('Signing up with:', {
      username: this.username,
      email: this.email,
      password: this.password
    });
    
    /* Here you would typically call your authentication service */
    await this.presentAlert('Pendaftaran Berhasil', 'Akun Anda telah berhasil didaftarkan!', true);
    
    /* Navigasi ke halaman beranda setelah alert ditutup */
    this.navigateToBeranda();
  }
  
  /* Metode untuk navigasi ke halaman beranda */
  navigateToBeranda() {
    this.router.navigate(['/beranda']);
  }
  
  /* Display alert message with optional success animation */
  async presentAlert(header: string, message: string, isSuccess: boolean = false) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [{
        text: 'OK',
        cssClass: isSuccess ? 'success-button' : '',
        handler: () => {
          /* Jika alert sukses, navigasi ke beranda saat tombol OK diklik */
          if (isSuccess) {
            this.navigateToBeranda();
          }
        }
      }],
      cssClass: ['custom-alert', isSuccess ? 'success-alert' : ''],
      backdropDismiss: false,
      animated: true,
      keyboardClose: true,
      enterAnimation: this.enterAnimation(),
      leaveAnimation: this.leaveAnimation()
    });

    await alert.present();
  }
  
  /* Custom enter animation using AnimationController */
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
  
  /* Custom leave animation using AnimationController */
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
}