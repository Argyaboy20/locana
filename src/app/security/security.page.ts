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
  capitalCount: string = '';
  generateCount: number = 0;
  lastGenerateTime: number = 0;
  isLimited: boolean = false;
  remainingTime: number = 0;
  private countdownInterval: any;
  showHistoryButton: boolean = false;
  isHistoryModalOpen: boolean = false;
  passwordHistory: Array<{
    password: string;
    timestamp: number;
    type: string;
    length: string;
    capitals: string;
  }> = [];
  userName: string = '';
  isGenerating: boolean = false;
  private nameAnalysis = {
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSymbols: false,
    length: 0
  };

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
    this.loadGenerateHistory();
    this.checkRateLimit();
    this.loadPasswordHistory();
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  ionViewDidEnter() {
    /* Ensure active tab is set to security when entering this page */
    this.activeTab = 'security';
    this.checkRateLimit();
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

  /* Analyze user name input and auto-adjust settings */
  onUserNameChange() {
    if (!this.userName) {
      this.resetNameAnalysis();
      return;
    }

    // Analyze the name
    this.analyzeUserName();

    // Auto-adjust capital count based on name
    this.autoAdjustCapitalCount();
  }

  /* Analyze the characteristics of user name */
  private analyzeUserName() {
    this.nameAnalysis = {
      hasUpperCase: /[A-Z]/.test(this.userName),
      hasLowerCase: /[a-z]/.test(this.userName),
      hasNumbers: /[0-9]/.test(this.userName),
      hasSymbols: /[^a-zA-Z0-9\s]/.test(this.userName),
      length: this.userName.length
    };
  }

  /* Auto-adjust capital count based on name analysis */
  private autoAdjustCapitalCount() {
    if (this.nameAnalysis.hasUpperCase) {
      const upperCaseCount = (this.userName.match(/[A-Z]/g) || []).length;

      // Set capital count based on detected uppercase letters, max 4
      if (upperCaseCount >= 4) {
        this.capitalCount = '4';
      } else if (upperCaseCount >= 3) {
        this.capitalCount = '3';
      } else if (upperCaseCount >= 2) {
        this.capitalCount = '2';
      } else {
        this.capitalCount = '1';
      }
    } else if (!this.capitalCount) {
      // Default to 1 if no uppercase detected and no selection made
      this.capitalCount = '1';
    }
  }

  /* Get analysis description for display */
  getNameAnalysis(): string {
    if (!this.userName) return '';

    const features = [];
    if (this.nameAnalysis.hasUpperCase) {
      const count = (this.userName.match(/[A-Z]/g) || []).length;
      features.push(`${count} huruf kapital`);
    }
    if (this.nameAnalysis.hasNumbers) {
      features.push('mengandung angka');
    }
    if (this.nameAnalysis.hasSymbols) {
      features.push('mengandung simbol');
    }

    return features.length > 0 ? features.join(', ') : 'huruf kecil semua';
  }

  /* Reset name analysis */
  private resetNameAnalysis() {
    this.nameAnalysis = {
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumbers: false,
      hasSymbols: false,
      length: 0
    };
  }

  /* Generate random password based on selected options */
  async generatePassword() {
    // Check rate limit
    if (this.isLimited) {
      this.showToast('Anda telah mencapai batas generate password (5x per jam)', 'warning');
      return;
    }

    // Validate that all options are selected including userName
    if (!this.passwordType || !this.passwordLength || !this.capitalCount || !this.userName.trim()) {
      this.showToast('Pilih semua opsi dan isi nama user terlebih dahulu', 'warning');
      return;
    }

    // Start loading
    this.isGenerating = true;

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get character set based on password type
      const characters = this.getCharacterSet();

      // Generate password with specified length, capital count, and user name influence
      const length = parseInt(this.passwordLength);
      const capitals = parseInt(this.capitalCount);
      this.generatedPassword = this.createSmartPasswordWithUserName(characters, length, capitals);

      // Update generate count and timestamp
      this.generateCount++;
      this.lastGenerateTime = Date.now();
      this.saveGenerateHistory();

      // Check if limit reached
      if (this.generateCount >= 5) {
        this.isLimited = true;
        this.startCountdown();
      }

      // Show success message
      this.showToast('Password berhasil di-generate!', 'success');
    } catch (error) {
      this.showToast('Gagal generate password', 'danger');
    } finally {
      // Stop loading
      this.isGenerating = false;
    }
  }

  /* Create smart password incorporating user name characteristics */
  private createSmartPasswordWithUserName(characters: string, length: number, capitalCount: number): string {
    const userName = this.userName.trim();
    let processedUserName = '';

    // Process user name based on password type restrictions
    for (let char of userName) {
      if (char === ' ') {
        // Skip spaces
        continue;
      }

      // Apply character filtering based on password type
      const processedChar = this.processCharacterByType(char);
      if (processedChar) {
        processedUserName += processedChar;
      }
    }

    // If processed name is longer than desired length, truncate it
    if (processedUserName.length >= length) {
      processedUserName = processedUserName.substring(0, length);
      return this.adjustCapitalCount(processedUserName, capitalCount);
    }

    // If processed name is shorter, fill remaining with random characters
    const remainingLength = length - processedUserName.length;
    const randomPart = this.generateRandomPart(characters, remainingLength);

    // Combine user name with random part
    let finalPassword = '';

    // Randomly distribute user name characters and random characters
    const userNameChars = processedUserName.split('');
    const randomChars = randomPart.split('');
    const allChars = [...userNameChars, ...randomChars];

    // Shuffle all characters
    for (let i = allChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
    }

    finalPassword = allChars.join('');

    // Ensure we have the right number of capitals
    finalPassword = this.adjustCapitalCount(finalPassword, capitalCount);

    return finalPassword;
  }

  /* Process character based on password type restrictions */
  private processCharacterByType(char: string): string {
    const isLetter = /[a-zA-Z]/.test(char);
    const isNumber = /[0-9]/.test(char);
    const isSymbol = /[^a-zA-Z0-9\s]/.test(char);

    switch (this.passwordType) {
      case 'no-symbols':
        if (isSymbol) {
          // Replace symbol with random letter or number
          return Math.random() > 0.5 ?
            this.getRandomChar(this.characterSets.letters) :
            this.getRandomChar(this.characterSets.numbers);
        }
        return char;

      case 'no-numbers':
        if (isNumber) {
          // Replace number with random letter or symbol
          return Math.random() > 0.5 ?
            this.getRandomChar(this.characterSets.letters) :
            this.getRandomChar(this.characterSets.symbols);
        }
        return char;

      case 'no-letters':
        if (isLetter) {
          // Replace letter with random number or symbol
          return Math.random() > 0.5 ?
            this.getRandomChar(this.characterSets.numbers) :
            this.getRandomChar(this.characterSets.symbols);
        }
        return char;

      case 'mixed':
        // Allow all characters
        return char;

      default:
        return char;
    }
  }

  /* Get random character from character set */
  private getRandomChar(charSet: string): string {
    return charSet[Math.floor(Math.random() * charSet.length)];
  }

  /* Get similar character from allowed character set */
  private getSimilarCharacter(char: string, characters: string): string {
    const lowerChar = char.toLowerCase();
    const upperChar = char.toUpperCase();

    if (characters.includes(lowerChar)) {
      return lowerChar;
    } else if (characters.includes(upperChar)) {
      return upperChar;
    } else {
      // Return random character from allowed set
      return characters[Math.floor(Math.random() * characters.length)];
    }
  }

  /* Generate random part of password */
  private generateRandomPart(characters: string, length: number): string {
    let randomPart = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomPart += characters[randomIndex];
    }

    return randomPart;
  }

  /* Adjust capital count in final password */
  private adjustCapitalCount(password: string, targetCapitalCount: number): string {
    const capitalLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let passwordArray = password.split('');

    // Count existing capitals
    let currentCapitals = passwordArray.filter(char => /[A-Z]/.test(char)).length;

    // If we have too many capitals, convert some to lowercase
    if (currentCapitals > targetCapitalCount) {
      let toConvert = currentCapitals - targetCapitalCount;
      for (let i = 0; i < passwordArray.length && toConvert > 0; i++) {
        if (/[A-Z]/.test(passwordArray[i])) {
          passwordArray[i] = passwordArray[i].toLowerCase();
          toConvert--;
        }
      }
    }

    // If we have too few capitals, convert some letters to uppercase
    else if (currentCapitals < targetCapitalCount) {
      let toConvert = targetCapitalCount - currentCapitals;
      for (let i = 0; i < passwordArray.length && toConvert > 0; i++) {
        if (/[a-z]/.test(passwordArray[i])) {
          passwordArray[i] = passwordArray[i].toUpperCase();
          toConvert--;
        }
      }

      // If still not enough, replace some characters with random capitals
      if (toConvert > 0) {
        for (let i = 0; i < passwordArray.length && toConvert > 0; i++) {
          if (!/[A-Z]/.test(passwordArray[i])) {
            const randomCapital = capitalLetters[Math.floor(Math.random() * capitalLetters.length)];
            passwordArray[i] = randomCapital;
            toConvert--;
          }
        }
      }
    }

    return passwordArray.join('');
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
 * Create random password with specified capital letters
 * @param characters - Available characters for password generation
 * @param length - Desired password length
 * @param capitalCount - Number of capital letters required
 * @returns Generated random password
 */
  private createRandomPasswordWithCapitals(characters: string, length: number, capitalCount: number): string {
    let password = '';
    let capitalPlaced = 0;
    const capitalLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Remove capital letters from characters to avoid conflicts
    const nonCapitalCharacters = characters.replace(/[A-Z]/g, '');

    // Create array to track capital positions
    const capitalPositions = new Set<number>();

    // Randomly select positions for capital letters
    while (capitalPlaced < capitalCount && capitalPlaced < length) {
      const randomPos = Math.floor(Math.random() * length);
      if (!capitalPositions.has(randomPos)) {
        capitalPositions.add(randomPos);
        capitalPlaced++;
      }
    }

    // Generate password character by character
    for (let i = 0; i < length; i++) {
      if (capitalPositions.has(i)) {
        // Place capital letter at this position
        const randomIndex = Math.floor(Math.random() * capitalLetters.length);
        password += capitalLetters.charAt(randomIndex);
      } else {
        // Place regular character from non-capital character set
        const randomIndex = Math.floor(Math.random() * nonCapitalCharacters.length);
        password += nonCapitalCharacters.charAt(randomIndex);
      }
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

  /* Copy generated password to clipboard */
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

        /* Add to history after successful copy */
        this.addToHistory(this.generatedPassword);
      } else {
        /* Fallback for older browsers */
        this.fallbackCopyToClipboard(this.generatedPassword);

        /* Add to history after successful copy */
        this.addToHistory(this.generatedPassword);
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

  /* Load generate history from localStorage */
  private loadGenerateHistory() {
    const history = localStorage.getItem('passwordGenerateHistory');
    if (history) {
      const data = JSON.parse(history);
      this.generateCount = data.count || 0;
      this.lastGenerateTime = data.timestamp || 0;
    }
  }

  /* Save generate history to localStorage */
  private saveGenerateHistory() {
    const history = {
      count: this.generateCount,
      timestamp: this.lastGenerateTime
    };
    localStorage.setItem('passwordGenerateHistory', JSON.stringify(history));
  }

  /* Check if user has reached rate limit */
  private checkRateLimit() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    /* Reset count if more than 1 hour has passed */
    if (now - this.lastGenerateTime > oneHour) {
      this.generateCount = 0;
      this.isLimited = false;
      this.clearCountdown();
    } else if (this.generateCount >= 5) {
      this.isLimited = true;
      this.startCountdown();
    }
  }

  /* Start countdown for rate limit */
  private startCountdown() {
    this.clearCountdown();

    this.countdownInterval = setInterval(() => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      const timePassed = now - this.lastGenerateTime;

      if (timePassed >= oneHour) {
        this.generateCount = 0;
        this.isLimited = false;
        this.clearCountdown();
      } else {
        this.remainingTime = oneHour - timePassed;
      }
    }, 1000);
  }

  /* Clear countdown interval */
  private clearCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  /*Format remaining time for display */
  getRemainingTimeString(): string {
    const minutes = Math.floor(this.remainingTime / (60 * 1000));
    const seconds = Math.floor((this.remainingTime % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /* Load password history from localStorage */
  private loadPasswordHistory() {
    const history = localStorage.getItem('passwordCopyHistory');
    if (history) {
      const data = JSON.parse(history);
      /* Filter out expired entries (older than 12 hours) */
      const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
      this.passwordHistory = data.filter((item: any) => item.timestamp > twelveHoursAgo);

      /* Update showHistoryButton based on history existence */
      this.showHistoryButton = this.passwordHistory.length > 0;

      /* Save cleaned history back to localStorage */
      this.savePasswordHistory();
    }
  }

  /*Save password history to localStorage */
  private savePasswordHistory() {
    localStorage.setItem('passwordCopyHistory', JSON.stringify(this.passwordHistory));
  }

  /**
   * Add password to history when copied
   * @param password - The password that was copied
   */
  private addToHistory(password: string) {
    const historyItem = {
      password: password,
      timestamp: Date.now(),
      type: this.getPasswordTypeLabel(),
      length: this.passwordLength,
      capitals: this.capitalCount
    };

    /* Add to beginning of array (most recent first) */
    this.passwordHistory.unshift(historyItem);

    /* Keep only last 50 entries to prevent excessive storage */
    if (this.passwordHistory.length > 50) {
      this.passwordHistory = this.passwordHistory.slice(0, 50);
    }

    /* Save to localStorage */
    this.savePasswordHistory();

    /* Show history button after first copy */
    this.showHistoryButton = true;
  }

  /* Open history modal */
  openHistoryModal() {
    /* Clean expired entries before opening */
    this.cleanExpiredHistory();
    this.isHistoryModalOpen = true;
  }

  /* Close history modal */
  closeHistoryModal() {
    this.isHistoryModalOpen = false;
  }

  /* Clean expired history entries (older than 12 hours) */
  private cleanExpiredHistory() {
    const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
    const initialLength = this.passwordHistory.length;

    this.passwordHistory = this.passwordHistory.filter(item => item.timestamp > twelveHoursAgo);

    /* Update showHistoryButton if all entries expired */
    if (this.passwordHistory.length === 0) {
      this.showHistoryButton = false;
    }

    /* Save updated history if any entries were removed */
    if (this.passwordHistory.length !== initialLength) {
      this.savePasswordHistory();
    }
  }

  /**
   * Copy password from history
   * @param password - Password to copy
   */
  async copyHistoryPassword(password: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(password);
        this.showToast('Password dari riwayat berhasil disalin!', 'success');
      } else {
        this.fallbackCopyToClipboard(password);
      }
    } catch (error) {
      console.error('Copy from history failed:', error);
      this.showToast('Gagal menyalin password dari riwayat', 'danger');
    }
  }

  /**
   * Format timestamp for display
   * @param timestamp - Timestamp to format
   * @returns Formatted time string
   */
  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Baru saja';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} menit lalu`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} jam lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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