import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  
  // Mapping route ke title
  private titleMap = new Map([
    ['/signup', 'Sign Up - Locana App'],
    ['/signin', 'Sign In - Locana App'],
    ['/lupapassword', 'Lupa Akun - Locana App'],
    ['/support', 'Bantuan - Locana App'],
    ['/faq', 'FAQ - Locana App'],
    ['/beranda', 'Locana App'],
    ['/akun', 'Profil Akun - Locana App'],
    ['/ubahpassword', 'Perubahan Password - Locana App'],
    ['/security', 'Keamanan - Locana App'],
    ['/privacypolicy', 'Kebijakan Privasi - Locana App'],
    ['/contact', 'Contact Us - Locana App'],
    ['/setting', 'Pengaturan - Locana App'],
    ['/history', 'Riwayat - Locana App'],
  ]);

  constructor(
    private router: Router,
    private titleService: Title
  ) {
    // Listen to router events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('Navigation to:', event.urlAfterRedirects);
      
      // Set title berdasarkan route
      const title = this.titleMap.get(event.urlAfterRedirects) || 'Locana App - Pelacakan Nomor';
      
      // Set dengan delay untuk memastikan tidak ke-override
      setTimeout(() => {
        this.titleService.setTitle(title);
        console.log('Title set to:', title);
      }, 100);
    });
  }
}