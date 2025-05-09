import { Component, OnInit } from '@angular/core';
import { AlertController, AnimationController } from '@ionic/angular';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-lupapassword',
  templateUrl: './lupapassword.page.html',
  styleUrls: ['./lupapassword.page.scss'],
  standalone: false,
})
export class LupapasswordPage implements OnInit {
  email: string = '';
  emailStatus: { message: string, class: string } | null = null;
  isEmailValid: boolean = false;
  isEmailRegistered: boolean = false;
  isChecking: boolean = false;

  constructor(
    private alertController: AlertController,
    private animationCtrl: AnimationController,
    private router: Router
  ) { }

  ngOnInit() {
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
          background: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .custom-alert .alert-head {
          background: rgba(23, 38, 42, 0.5);
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
          color: rgba(23, 38, 42, 0.9);
          padding: 10px;
          text-align: center;
          margin-top: 20px;
          font-weight: 500;
        }
        
        .custom-alert .alert-button-group {
          display: flex;
          justify-content: center;
        }
        
        .custom-alert .alert-button {
          color: white;
          background: rgba(23, 38, 42, 0.8);
          border-radius: 15px;
          margin: 10px;
          min-width: 100px;
          font-weight: 600;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        
        .custom-alert .alert-button:hover {
          transform: translateY(-2px);
          background: rgba(23, 38, 42, 0.9);
        }
        
        .custom-alert .alert-button-inner {
          justify-content: center;
        }
        
        .custom-alert .alert-button:active {
          transform: translateY(0px);
        }
        
        .success-alert .alert-wrapper {
          background: linear-gradient(135deg, #17262a 30%, #6c8d95 100%);
        }
      `;
      document.head.appendChild(style);
    }
  }

  validateEmail() {
    // Reset status
    this.emailStatus = null;
    this.isEmailValid = false;
    this.isEmailRegistered = false;
    
    if (!this.email) {
      return;
    }
    
    /* Regular expression for email validation */
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(this.email)) {
      this.emailStatus = {
        message: 'Email tidak valid',
        class: 'invalid'
      };
      return;
    }
    
    /* Check if it's a Gmail address */
    if (!this.email.toLowerCase().includes('@gmail.com')) {
      this.emailStatus = {
        message: 'Hanya email Gmail yang dapat digunakan',
        class: 'invalid'
      };
      return;
    }
    
    /* Simulate checking if email is registered */
    this.isChecking = true;
    this.emailStatus = {
      message: 'Memeriksa email...',
      class: 'checking'
    };
    
    /* Simulate API call with timeout */
    setTimeout(() => {
      this.isChecking = false;
      
      /* For demo purposes, we'll consider emails with "test" in them as registered */
      if (this.email.toLowerCase().includes('test')) {
        this.isEmailValid = true;
        this.isEmailRegistered = true;
        this.emailStatus = {
          message: 'Email terdaftar',
          class: 'valid'
        };
      } else {
        this.isEmailValid = true;
        this.isEmailRegistered = false;
        this.emailStatus = {
          message: 'Email tidak terdaftar dalam sistem',
          class: 'invalid'
        };
      }
    }, 1500); /* Simulate a 1.5 second delay */
  }

  async sendResetLink() {
    if (!this.email) {
      this.presentAlert('Email diperlukan', 'Silakan masukkan email Anda');
      return;
    }
    
    /* Validate email first if not done yet */
    if (!this.emailStatus) {
      this.validateEmail();
      
      /* Simulate waiting for validation to complete */
      setTimeout(() => {
        this.checkAndSendResetLink();
      }, 2000);
      
      return;
    }
    
    this.checkAndSendResetLink();
  }
  
  async checkAndSendResetLink() {
    if (!this.isEmailValid) {
      this.presentAlert('Format Email Tidak Valid', 'Silakan masukkan email yang valid');
      return;
    }
    
    if (!this.isEmailRegistered) {
      this.presentAlert('Email Tidak Terdaftar', 'Email yang Anda masukkan tidak terdaftar dalam sistem kami');
      return;
    }
    
    /* Simulate sending reset link */
    await this.presentAlert('Email Terkirim', 'Instruksi reset password telah dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam Anda.', true);
    
    /* Reset form */
    this.email = '';
    this.emailStatus = null;
    this.isEmailValid = false;
    this.isEmailRegistered = false;

    this.navigateToLupaPassword();
  }

  navigateToLupaPassword() {
    this.router.navigate(['/lupapassword']);
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
            this.navigateToLupaPassword();
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
}