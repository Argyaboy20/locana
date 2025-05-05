import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
  standalone: false,
})
export class SupportPage implements OnInit {
  @ViewChild('kendalaTextarea', { static: false }) kendalaTextarea!: ElementRef;
  
  email: string = '';
  kendalaText: string = '';
  selectedFile: File | null = null;
  
  emailStatus: { message: string, class: string } | null = null;
  kendalaStatus: { message: string, class: string } | null = null;
  
  // Simulasi email terdaftar
  registeredEmails: string[] = [
    'user@example.com',
    'admin@locana.com',
    'test@test.com'
  ];

  constructor(private toastController: ToastController) { }

  ngOnInit() {
  }
  
  checkOverflow(event: any) {
    if (!this.kendalaTextarea?.nativeElement) return;
    
    const textarea = this.kendalaTextarea.nativeElement;
    const isOverflowing = textarea.scrollHeight > textarea.clientHeight;
    
    if (isOverflowing) {
      textarea.classList.add('scrollable');
    } else {
      textarea.classList.remove('scrollable');
    }
  }

  validateEmail() {
    if (!this.email) {
      this.emailStatus = {
        message: 'Email tidak boleh kosong',
        class: 'error'
      };
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailStatus = {
        message: 'Format email tidak valid',
        class: 'error'
      };
      return false;
    }

    // Cek apakah email terdaftar (simulasi)
    if (!this.registeredEmails.includes(this.email)) {
      this.emailStatus = {
        message: 'Email tidak terdaftar dalam sistem',
        class: 'error'
      };
      return false;
    }

    this.emailStatus = {
      message: 'Email valid dan terdaftar',
      class: 'success'
    };
    return true;
  }

  validateKendala() {
    if (!this.kendalaText || this.kendalaText.trim() === '') {
      this.kendalaStatus = {
        message: 'Deskripsi kendala tidak boleh kosong',
        class: 'error'
      };
      return false;
    }

    if (this.kendalaText.length < 50) {
      this.kendalaStatus = {
        message: 'Deskripsi kendala terlalu singkat (min. 50 karakter)',
        class: 'error'
      };
      return false;
    }

    this.kendalaStatus = null;
    return true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    
    if (file) {
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.presentToast('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }
      
      // Validasi tipe file (hanya gambar)
      if (!file.type.startsWith('image/')) {
        this.presentToast('Hanya file gambar yang diizinkan.');
        return;
      }
      
      this.selectedFile = file;
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  async submitReport() {
    // Validasi form sebelum submit
    const isEmailValid = this.validateEmail();
    const isKendalaValid = this.validateKendala();
    
    if (!isEmailValid || !isKendalaValid) {
      this.presentToast('Mohon diisi data yang diperlukan');
      return;
    }
    
    // Simulasi pengiriman laporan
    try {
      // Di sini Anda bisa menambahkan kode untuk mengirim data ke API
      console.log('Mengirim laporan:');
      console.log('Email:', this.email);
      console.log('Kendala:', this.kendalaText);
      console.log('File:', this.selectedFile ? this.selectedFile.name : 'Tidak ada file');
      
      // Simulasi proses pengiriman
      await this.delay(1500);
      
      // Tampilkan pesan sukses
      this.presentToast('Laporan kendala berhasil dikirim! Tim kami akan segera menindaklanjuti.', 'success');
      
      // Reset form setelah berhasil
      this.resetForm();
    } catch (error) {
      this.presentToast('Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.', 'danger');
      console.error('Error submitting report:', error);
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private resetForm() {
    this.email = '';
    this.kendalaText = '';
    this.selectedFile = null;
    this.emailStatus = null;
    this.kendalaStatus = null;
  }
  
  async presentToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}