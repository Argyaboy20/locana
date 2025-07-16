import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from "@vercel/analytics";
import { ToastController } from '@ionic/angular';

inject();

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
  standalone: false,
})
export class SecurityPage implements OnInit {
  activeTab: string = 'security';
  
  /* Password generator properties */
  passwordType: string = '';
  passwordLength: string = '';
  generatedPassword: string = '';
  
  /* Character sets for password generation */
  private readonly characterSets = {
    letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  constructor(
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    /* Initialize active tab as security */
    this.activeTab = 'security';
  }

  ionViewDidEnter() {
    /* Ensure active tab is set to security when entering this page */
    this.activeTab = 'security';
  }

  /**
   * Navigate between tabs with smooth transition
   * @param tabName - Name of the tab to navigate to
   */
  navigateToTab(tabName: string) {
    /* Set the active tab indicator */
    this.activeTab = tabName;
  
    if (tabName === 'home') {
      /* Navigate to home page if not already there */
      if (this.router.url !== '/beranda') {
        this.router.navigate(['/beranda'], {
          state: { animation: 'tab-transition' }
        });
      }
    } else if (tabName === 'security') {
      /* Navigate to security page */
      this.router.navigate(['/security'], {
        state: { animation: 'tab-transition' }
      });
    }
  }
  
  /**
   * Update tab selection UI
   * @param tabName - Name of the tab to select
   */
  selectTab(tabName: string) {
    /* Remove selected state from all tabs */
    const tabButtons = document.querySelectorAll('ion-tab-button');
    tabButtons.forEach(button => {
      button.removeAttribute('selected');
    });
    
    /* Add selected state to the chosen tab */
    const selectedTab = document.querySelector(`ion-tab-button[tab="${tabName}"]`);
    if (selectedTab) {
      selectedTab.setAttribute('selected', 'true');
    }
  }

  /**
   * Generate random password based on selected options
   */
  generatePassword() {
    /* Validate that both options are selected */
    if (!this.passwordType || !this.passwordLength) {
      this.showToast('Pilih jenis password dan panjang password terlebih dahulu', 'warning');
      return;
    }

    /* Get character set based on password type */
    const characters = this.getCharacterSet();
    
    /* Generate password with specified length */
    const length = parseInt(this.passwordLength);
    this.generatedPassword = this.createRandomPassword(characters, length);
    
    /* Show success message */
    this.showToast('Password berhasil di-generate!', 'success');
  }

  /**
   * Get character set based on selected password type
   * @returns String containing available characters for password generation
   */
  private getCharacterSet(): string {
    let characters = '';
    
    switch (this.passwordType) {
      case 'no-symbols':
        /* Include letters and numbers, exclude symbols */
        characters = this.characterSets.letters + this.characterSets.numbers;
        break;
      case 'no-numbers':
        /* Include letters and symbols, exclude numbers */
        characters = this.characterSets.letters + this.characterSets.symbols;
        break;
      case 'no-letters':
        /* Include numbers and symbols, exclude letters */
        characters = this.characterSets.numbers + this.characterSets.symbols;
        break;
      case 'mixed':
        /* Include all character types */
        characters = this.characterSets.letters + this.characterSets.numbers + this.characterSets.symbols;
        break;
      default:
        /* Default to mixed if no valid type selected */
        characters = this.characterSets.letters + this.characterSets.numbers + this.characterSets.symbols;
    }
    
    return characters;
  }

  /**
   * Create random password from character set
   * @param characters - Available characters for password generation
   * @param length - Desired password length
   * @returns Generated random password
   */
  private createRandomPassword(characters: string, length: number): string {
    let password = '';
    
    /* Generate random characters for the specified length */
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters.charAt(randomIndex);
    }
    
    return password;
  }

  /**
   * Get human-readable label for password type
   * @returns String representation of selected password type
   */
  getPasswordTypeLabel(): string {
    switch (this.passwordType) {
      case 'no-symbols':
        return 'Tanpa Simbol';
      case 'no-numbers':
        return 'Tanpa Angka';
      case 'no-letters':
        return 'Tanpa Huruf';
      case 'mixed':
        return 'Campuran';
      default:
        return 'Tidak Diketahui';
    }
  }

  /**
   * Copy generated password to clipboard
   */
  async copyToClipboard() {
    if (!this.generatedPassword) {
      this.showToast('Tidak ada password untuk disalin', 'warning');
      return;
    }

    try {
      /* Use modern clipboard API if available */
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(this.generatedPassword);
        this.showToast('Password berhasil disalin ke clipboard!', 'success');
      } else {
        /* Fallback for older browsers */
        this.fallbackCopyToClipboard(this.generatedPassword);
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      this.showToast('Gagal menyalin password', 'danger');
    }
  }

  /**
   * Fallback method for copying to clipboard in older browsers
   * @param text - Text to copy to clipboard
   */
  private fallbackCopyToClipboard(text: string) {
    /* Create temporary textarea element */
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    /* Select and copy text */
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showToast('Password berhasil disalin ke clipboard!', 'success');
    } catch (error) {
      console.error('Fallback copy failed:', error);
      this.showToast('Gagal menyalin password', 'danger');
    } finally {
      /* Clean up temporary element */
      document.body.removeChild(textArea);
    }
  }

  /**
   * Show toast notification to user
   * @param message - Message to display
   * @param color - Toast color (success, warning, danger)
   */
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top',
      cssClass: 'custom-toast'
    });
    
    await toast.present();
  }
}