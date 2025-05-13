import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: false,
})
export class ContactPage implements OnInit {
  
  contactForm = {
    fullName: '',
    companyName: '',
    country: '',
    email: '',
    message: ''
  };

  formErrors = {
    fullName: '',
    companyName: '',
    country: '',
    email: '',
    message: ''
  };

  fieldStatus = {
    fullName: false,
    companyName: false,
    country: false,
    email: false,
    message: false
  };

  constructor(private toastController: ToastController) { }

  ngOnInit() {
    // Initialize component
  }

  validateField(fieldName: string): void {
    if (fieldName as keyof typeof this.fieldStatus) {
      // Explicitly cast to avoid TypeScript errors
      const field = fieldName as keyof typeof this.fieldStatus;
      
      this.fieldStatus[field] = true;
      this.formErrors[field] = '';
      
      const value = this.contactForm[field];
      
      if (!value || value.trim() === '') {
        this.formErrors[field] = 'Bidang ini wajib diisi';
        return;
      }
      
      switch (field) {
        case 'fullName':
        case 'companyName':
        case 'country':
          if (!/^[A-Za-z\s]+$/.test(value)) {
            this.formErrors[field] = 'Hanya boleh berisi huruf';
          }
          break;
          
        case 'email':
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value)) {
            this.formErrors[field] = 'Format email tidak valid';
          }
          break;
          
        case 'message':
          break;
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = fieldName as keyof typeof this.formErrors;
    return !!this.formErrors[field] && this.fieldStatus[field];
  }

  validateAllFields(): boolean {
    const fields = ['fullName', 'companyName', 'country', 'email', 'message'];
    fields.forEach(field => this.validateField(field));
    
    return !Object.values(this.formErrors).some(error => error !== '');
  }

  async submitForm(): Promise<void> {
    if (this.validateAllFields()) {
      const toast = await this.toastController.create({
        message: 'Pesan Anda telah berhasil dikirim!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      
      this.resetForm();
      
      toast.present();
    } else {
      const toast = await this.toastController.create({
        message: 'Mohon periksa kembali formulir Anda',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      
      toast.present();
    }
  }

  resetForm(): void {
    this.contactForm = {
      fullName: '',
      companyName: '',
      country: '',
      email: '',
      message: ''
    };
    
    this.formErrors = {
      fullName: '',
      companyName: '',
      country: '',
      email: '',
      message: ''
    };
    
    this.fieldStatus = {
      fullName: false,
      companyName: false,
      country: false,
      email: false,
      message: false
    };
  }
}