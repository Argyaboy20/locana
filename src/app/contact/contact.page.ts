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

  countries: string[] = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
    'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Democratic Republic)', 'Congo (Republic)',
    'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland',
    'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
    'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
    'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo',
    'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
    'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
    'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
    'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
    'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
    'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
    'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
    'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
    'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
    'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  constructor(private toastController: ToastController) { }

  ngOnInit() {
  }

  validateField(fieldName: string): void {
    if (fieldName as keyof typeof this.fieldStatus) {
      /* Explicitly cast to avoid TypeScript errors */
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