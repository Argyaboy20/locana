import { Component, OnInit } from '@angular/core';
import { AlertController, AnimationController } from '@ionic/angular';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-ubahpassword',
  templateUrl: './ubahpassword.page.html',
  styleUrls: ['./ubahpassword.page.scss'],
  standalone: false,
})
export class UbahpasswordPage implements OnInit {
  oldPassword: string = '';
  newPassword: string = '';
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  
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
  ) { }

  ngOnInit() {
    /* Check screen size on init */
    this.checkScreenSize();
    
    /* Add resize event listener */
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

  /* Monitor changes in the new password field */
  ngDoCheck() {
    if (this.newPassword) {
      this.checkPasswordRequirements();
    }
  }

  /* Toggle visibility for old password */
  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }

  /* Toggle visibility for new password */
  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  /* Check if new password meets all requirements */
  checkPasswordRequirements() {
    /* Minimum 6 characters */
    this.passwordRequirements.minLength = this.newPassword.length >= 6;
    
    /* Contains uppercase letter */
    this.passwordRequirements.hasUpperCase = /[A-Z]/.test(this.newPassword);
    
    /* Contains lowercase letter */
    this.passwordRequirements.hasLowerCase = /[a-z]/.test(this.newPassword);
    
    /* Contains number */
    this.passwordRequirements.hasNumber = /[0-9]/.test(this.newPassword);
    
    /* Contains special character */
    this.passwordRequirements.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(this.newPassword);
  }

  /* Check if all password requirements are met */
  allRequirementsMet(): boolean {
    return this.passwordRequirements.minLength &&
           this.passwordRequirements.hasUpperCase &&
           this.passwordRequirements.hasLowerCase &&
           this.passwordRequirements.hasNumber &&
           this.passwordRequirements.hasSpecialChar;
  }

  /* Process changing password */
  async changePassword() {
    /* Check if old password is filled */
    if (!this.oldPassword) {
      await this.presentAlert('Password Lama Diperlukan', 'Silakan masukkan password lama Anda.');
      return;
    }

    /* Check if new password is filled */
    if (!this.newPassword) {
      await this.presentAlert('Password Baru Diperlukan', 'Silakan masukkan password baru Anda.');
      return;
    }
    
    /* Check if new password meets all requirements */
    if (!this.allRequirementsMet()) {
      let missingRequirements = [];
      
      if (!this.passwordRequirements.minLength) missingRequirements.push('minimal 6 karakter');
      if (!this.passwordRequirements.hasUpperCase) missingRequirements.push('mengandung huruf kapital');
      if (!this.passwordRequirements.hasLowerCase) missingRequirements.push('mengandung huruf kecil');
      if (!this.passwordRequirements.hasNumber) missingRequirements.push('mengandung angka');
      if (!this.passwordRequirements.hasSpecialChar) missingRequirements.push('mengandung karakter spesial');
      
      await this.presentAlert(
        'Password Tidak Memenuhi Persyaratan', 
        `Password harus ${missingRequirements.join(', ')}.`
      );
      return;
    }

    /* Here you would typically verify the old password against database */
    /* For this example, we'll simulate a verification */
    const oldPasswordVerified = this.verifyOldPassword(this.oldPassword);
    
    if (!oldPasswordVerified) {
      await this.presentAlert('Password Tidak Sesuai', 'Password lama tidak sesuai. Silakan coba lagi.');
      return;
    }

    /* If we get here, all validations passed */
    /* In a real app, you'd update the password in your database */
    await this.presentAlert('Berhasil', 'Password Anda berhasil diubah!', true);
    
    /* Reset the form */
    this.oldPassword = '';
    this.newPassword = '';

    this.navigateToUbahPassword();
  }

  navigateToUbahPassword() {
    this.router.navigate(['/ubahpassword']);
  }

  /* Simulate verifying old password against database */
  /* In a real app, this would check against your authentication service */
  verifyOldPassword(password: string): boolean {
    // For demo purposes, let's say "password123" is the current password
    // In a real app, this would be a call to your authentication service
    return password === 'password123';
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
            this.navigateToUbahPassword();
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