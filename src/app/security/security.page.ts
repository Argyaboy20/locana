import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from "@vercel/analytics";

inject();

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
  standalone: false,
})
export class SecurityPage implements OnInit {
  activeTab: string = 'security';

  constructor(private router: Router) { }

  ngOnInit() {
    /* Set active tab as security since we're on the security page */
    this.activeTab = 'security';
  }

  ionViewDidEnter() {
    /* Ketika kembali ke halaman Beranda (security), pastikan tab yang aktif adalah 'security' */
    this.activeTab = 'security';
  }

  navigateToTab(tabName: string) {
    /* Set tab yang aktif */
    this.activeTab = tabName;
  
    if (tabName === 'home') {
      /* Jika sudah di halaman home, hanya perlu mengubah indikator tab aktif */
      if (this.router.url !== '/beranda') {
        this.router.navigate(['/beranda'], {
          state: { animation: 'tab-transition' }
        });
      }
    } else if (tabName === 'security') {
      /* Navigasi ke halaman security */
      this.router.navigate(['/security'], {
        state: { animation: 'tab-transition' }
      });
    }
  }
  
  selectTab(tabName: string) {
    /* Hapus selected dari semua tab */
    const tabButtons = document.querySelectorAll('ion-tab-button');
    tabButtons.forEach(button => {
      button.removeAttribute('selected');
    });
    
    /* Tambahkan selected ke tab yang dipilih */
    const selectedTab = document.querySelector(`ion-tab-button[tab="${tabName}"]`);
    if (selectedTab) {
      selectedTab.setAttribute('selected', 'true');
    }
  }
}