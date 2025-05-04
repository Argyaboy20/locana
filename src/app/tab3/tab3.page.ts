import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  isExpanded: boolean = false;
  
  passwordRequirements = {
    minLength: false,
    hasUpperCase: false, 
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private animationCtrl: AnimationController
  ) {}

  // Keep track of form interaction state
  private firstInteraction: boolean = true;

  ngOnInit() {
    // Reset form when component initializes
    this.isExpanded = false;
    this.username = '';
    this.password = '';
    
    // Add global styles for alert customization
    this.addAlertCustomStyles();
  }

  // Method to add custom alert styles
  addAlertCustomStyles() {
    // Create style element if it doesn't exist
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

  // Listen for clicks on the document
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const loginContainer = document.querySelector('.form-container');
    
    // Check if click was on expand button - if so reset first interaction flag
    if (target.classList.contains('signin-btn') && !this.isExpanded) {
      this.firstInteraction = true;
      return;
    }
    
    // If clicking inside the form container, mark first interaction as done
    if (loginContainer && loginContainer.contains(target)) {
      this.firstInteraction = false;
      return;
    }
    
    // If clicking outside container and form is expanded
    if (loginContainer && !loginContainer.contains(target) && this.isExpanded) {
      // First interaction with form is complete, so can check for minimize
      if (!this.firstInteraction) {
        // Only minimize if no data has been entered
        if (!this.username && !this.password) {
          this.isExpanded = false;
        }
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  expandForm() {
    this.isExpanded = true;
    this.firstInteraction = true; // Reset first interaction flag when expanding
  }
  
  validatePassword() {
    this.passwordRequirements.minLength = this.password.length >= 6;
    this.passwordRequirements.hasUpperCase = /[A-Z]/.test(this.password);
    this.passwordRequirements.hasLowerCase = /[a-z]/.test(this.password);
    this.passwordRequirements.hasNumber = /[0-9]/.test(this.password);
    this.passwordRequirements.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password);
  }
  
  // Watch for changes to the password and validate
  ngDoCheck() {
    if (this.password) {
      this.validatePassword();
    }
  }
  
  // Display alert message with optional success animation
  async presentAlert(header: string, message: string, isSuccess: boolean = false) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [{
        text: 'OK',
        cssClass: isSuccess ? 'success-button' : ''
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
  
  // Custom enter animation using AnimationController
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
  
  // Custom leave animation using AnimationController
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
  
  async signIn() {
    // Check if username is empty
    if (!this.username) {
      await this.presentAlert('Username diperlukan', 'Harap isi username!');
      return;
    }
    
    // Check if password is empty
    if (!this.password) {
      await this.presentAlert('Password diperlukan', 'Harap isi password!');
      return;
    }
    
    // Check if all password requirements are met
    const allRequirementsMet = Object.values(this.passwordRequirements).every(value => value === true);
    
    if (!allRequirementsMet) {
      await this.presentAlert('Password kurang aman', 'Password tidak memenuhi persyaratan keamanan!');
      return;
    }
    
    // If all validations pass
    console.log('Sign in successful!');
    await this.presentAlert('Berhasil', 'Login berhasil!', true);
    // Redirect to home or dashboard page
    // this.router.navigate(['/tabs/tab1']);
  }
}