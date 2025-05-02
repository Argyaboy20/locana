import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {
  currentSlide = 0;
  private slideTimer: any;
  
  constructor() {}
  
  ngOnInit() {
    // Define the custom Ionic color for the toolbar
    const style = document.documentElement.style;
    style.setProperty('--ion-color-locana-primary', '#5a8de1');
    style.setProperty('--ion-color-locana-primary-rgb', '90,141,225');
    style.setProperty('--ion-color-locana-primary-contrast', '#ffffff');
    style.setProperty('--ion-color-locana-primary-contrast-rgb', '255,255,255');
    style.setProperty('--ion-color-locana-primary-shade', '#4f7cc6');
    style.setProperty('--ion-color-locana-primary-tint', '#6b99e4');

    // Load the Montserrat font for the title
    this.loadFont('Montserrat', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

    // Start the automatic slide rotation
    this.startSlideRotation();
  }
  
  /**
   * Load external font
   */
  loadFont(fontName: string, fontUrl: string) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
  }
  
  /**
   * Start automatic slide rotation (every 5 seconds)
   */
  startSlideRotation() {
    this.slideTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 4;
      
      // Update the active class on slides manually for better compatibility
      this.updateActiveSlide();
    }, 5000);
  }
  
  /**
   * Update active slide in the DOM (used as a fallback for Angular binding)
   */
  updateActiveSlide() {
    // Update desktop slides
    const desktopSlides = document.querySelectorAll('.desktop-view .slide');
    desktopSlides.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
    
    // Update mobile slides
    const mobileSlides = document.querySelectorAll('.mobile-view .slide');
    mobileSlides.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
    
    // Update desktop indicators
    const desktopDots = document.querySelectorAll('.desktop-view .dot');
    desktopDots.forEach((dot, index) => {
      if (index === this.currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    // Update mobile indicators
    const mobileDots = document.querySelectorAll('.mobile-view .dot');
    mobileDots.forEach((dot, index) => {
      if (index === this.currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
  
  /**
   * Handle registration button click
   */
  register() {
    console.log('Registration requested');
    // Implement registration functionality
  }
  
  /**
   * Handle Google SSO login
   */
  loginWithGoogle() {
    console.log('Google SSO requested');
    // Implement Google SSO functionality
    // This would typically integrate with Google Auth
    // and automatically capture username and password
  }
  
  /**
   * Clean up resources on component destruction
   */
  ngOnDestroy() {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }
}