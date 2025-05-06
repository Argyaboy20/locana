import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
  standalone: false,
})
export class FaqPage implements OnInit {
  // FAQ items array
  faqItems = [
    {
      id: 'first',
      question: 'Bagaimana cara kerja pelacakan nomor telepon di Locana?',
      answer: 'Locana bekerja dengan menganalisis sinyal seluler dari nomor target dan menggunakan teknologi triangulasi untuk menentukan lokasi perkiraan. Aplikasi ini menggunakan data dari menara seluler terdekat untuk memberikan informasi lokasi yang akurat.'
    },
    {
      id: 'second',
      question: 'Apakah saya memerlukan izin dari pemilik nomor untuk melacaknya?',
      answer: 'Ya, Anda harus mendapatkan izin dari pemilik nomor sebelum melacaknya. Penggunaan aplikasi untuk melacak nomor tanpa izin dapat melanggar privasi dan hukum yang berlaku. Locana hanya boleh digunakan untuk tujuan yang sah seperti menemukan ponsel yang hilang atau memantau anggota keluarga dengan persetujuan mereka.'
    },
    {
      id: 'third',
      question: 'Seberapa akurat pelacakan nomor telepon?',
      answer: 'Tingkat akurasi pelacakan nomor telepon bervariasi tergantung pada beberapa faktor seperti kekuatan sinyal, jumlah menara seluler di area tersebut, dan kondisi geografis. Di daerah perkotaan dengan banyak menara seluler, akurasi bisa mencapai 50-100 meter, sedangkan di daerah pedesaan akurasi mungkin berkurang.'
    },
    {
      id: 'fourth',
      question: 'Apakah Locana bekerja untuk semua operator seluler?',
      answer: 'Ya, Locana kompatibel dengan semua operator seluler utama di Indonesia. Namun, beberapa fitur mungkin memiliki keterbatasan tergantung pada operator dan jenis layanan yang digunakan oleh nomor target.'
    },
    {
      id: 'fifth',
      question: 'Berapa biaya untuk menggunakan Locana?',
      answer: 'Locana menawarkan versi gratis dengan fitur dasar dan versi premium dengan fitur tambahan. Versi premium tersedia dengan berlangganan bulanan atau tahunan. Silakan kunjungi halaman berlangganan untuk informasi harga terbaru.'
    },
    {
      id: 'sixth',
      question: 'Apakah saya perlu koneksi internet untuk menggunakan Locana?',
      answer: 'Ya, Locana memerlukan koneksi internet yang stabil untuk melakukan pelacakan nomor telepon. Koneksi Wi-Fi atau data seluler diperlukan untuk menjalankan aplikasi dan mendapatkan informasi lokasi terbaru.'
    },
    {
      id: 'seventh',
      question: 'Bagaimana cara memperbarui aplikasi Locana?',
      answer: 'Aplikasi Locana akan diperbarui secara otomatis melalui Google Play Store atau Apple App Store. Anda juga dapat memeriksa pembaruan manual dengan membuka toko aplikasi dan mencari Locana di bagian "Pembaruan Saya".'
    },
    {
      id: 'eighth',
      question: 'Apakah data pelacakan saya aman?',
      answer: 'Keamanan data adalah prioritas utama kami. Semua data pelacakan dienkripsi dan disimpan secara aman di server kami. Kami tidak membagikan informasi Anda kepada pihak ketiga tanpa persetujuan Anda. Untuk informasi lebih lanjut, silakan baca Kebijakan Privasi kami.'
    }
  ];

  // Search query
  searchQuery: string = '';
  filteredFaqItems = [...this.faqItems];

  constructor(private toastController: ToastController) { }

  ngOnInit() {
    // Initialize the FAQ page
  }

  // Search functionality
  onSearchChange(event: any) {
    const query = event.detail.value.toLowerCase();
    this.searchQuery = query;
    
    if (query.trim() === '') {
      this.filteredFaqItems = [...this.faqItems];
    } else {
      this.filteredFaqItems = this.faqItems.filter(item => 
        item.question.toLowerCase().includes(query) || 
        item.answer.toLowerCase().includes(query)
      );
    }
  }

  // Contact support
  async contactSupport() {
    const toast = await this.toastController.create({
      message: 'Permintaan dukungan Anda telah dikirim. Tim kami akan segera menghubungi Anda.',
      duration: 3000,
      position: 'bottom',
      color: 'success',
      buttons: [
        {
          text: 'Tutup',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }
}