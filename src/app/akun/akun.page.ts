import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/* Interface for profile data structure */
interface ProfileData {
  nama: string;
  jenisKelamin: string;
  tanggalLahir: string;
  email: string;
  nomorTelepon: string;
}

@Component({
  selector: 'app-akun',
  templateUrl: './akun.page.html',
  styleUrls: ['./akun.page.scss'],
  standalone: false,
})
export class AkunPage implements OnInit {

  /* Profile data model with initial values from database simulation */
  profileData: ProfileData = {
    nama: 'Maulana Farras',
    jenisKelamin: '',
    tanggalLahir: '',
    email: 'maulanafarras030520@gmail.com',
    nomorTelepon: ''
  };

  /* Original profile data for comparison to detect changes */
  originalProfileData: ProfileData = { ...this.profileData };

  /* Flag to show/hide save button based on data changes */
  showSaveButton: boolean = false;

  /* Date picker related properties */
  isDatePickerOpen: boolean = false;
  formattedDate: string = '';
  maxDate: string = '';
  minDate: string = '';

  /* Validation patterns for input fields */
  namePattern: string = '^[a-zA-Z\\s]+$'; /* Only letters and spaces allowed */
  phonePattern: string = '^62[0-9]+$'; /* Must start with 62 followed by numbers */

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    /* Initialize original data copy for change detection */
    this.originalProfileData = { ...this.profileData };
    
    /* Set date picker constraints */
    this.setDateConstraints();
    
    /* Format initial date if exists */
    if (this.profileData.tanggalLahir) {
      this.formatDisplayDate();
    }
  }

  /* Set min and max date constraints for date picker */
  private setDateConstraints(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    /* Set maximum date to today */
    this.maxDate = currentDate.toISOString();
    
    /* Set minimum date to 100 years ago */
    const minYear = currentYear - 100;
    this.minDate = new Date(minYear, 0, 1).toISOString();
  }

  /* Format date for display in input field */
  private formatDisplayDate(): void {
    if (this.profileData.tanggalLahir) {
      const date = new Date(this.profileData.tanggalLahir);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        this.formattedDate = `${day}/${month}/${year}`;
      }
    }
  }

  /* Open date picker */
  openDatePicker(): void {
    this.isDatePickerOpen = true;
  }

  /* Close date picker */
  closeDatePicker(): void {
    this.isDatePickerOpen = false;
  }

  /* Handle date change from date picker */
  onDateChange(event: any): void {
    if (event.detail.value) {
      this.profileData.tanggalLahir = event.detail.value;
      this.formatDisplayDate();
      this.onInputChange();
      this.closeDatePicker();
    }
  }

  /* Navigation method to handle back button functionality */
  navigateBack(): void {
    this.router.navigate(['/setting']);
  }

  /* Method to detect input changes and show/hide save button */
  onInputChange(): void {
    /* Check if any field has been modified */
    const hasChanges = this.hasProfileChanges();
    this.showSaveButton = hasChanges;
  }

  /* Method to compare current data with original data */
  private hasProfileChanges(): boolean {
    return (
      this.profileData.nama !== this.originalProfileData.nama ||
      this.profileData.jenisKelamin !== this.originalProfileData.jenisKelamin ||
      this.profileData.tanggalLahir !== this.originalProfileData.tanggalLahir ||
      this.profileData.email !== this.originalProfileData.email ||
      this.profileData.nomorTelepon !== this.originalProfileData.nomorTelepon
    );
  }

  /* Method to validate profile data before saving */
  private validateProfileData(): boolean {
    /* Check if required name field is filled and valid */
    if (!this.profileData.nama || !this.profileData.nama.trim()) {
      this.showValidationError('Nama wajib diisi');
      return false;
    }

    /* Validate name contains only letters and spaces */
    const nameRegex = new RegExp(this.namePattern);
    if (!nameRegex.test(this.profileData.nama)) {
      this.showValidationError('Nama hanya boleh berisi huruf');
      return false;
    }

    /* Validate phone number format if provided */
    if (this.profileData.nomorTelepon && this.profileData.nomorTelepon.trim()) {
      const phoneRegex = new RegExp(this.phonePattern);
      if (!phoneRegex.test(this.profileData.nomorTelepon)) {
        this.showValidationError('Nomor telepon harus dimulai dengan 62 dan hanya berisi angka');
        return false;
      }
    }

    /* Validate email format if provided */
    if (this.profileData.email && this.profileData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.profileData.email)) {
        this.showValidationError('Format email tidak valid');
        return false;
      }
    }

    return true;
  }

  /* Method to display validation error messages */
  private showValidationError(message: string): void {
    /* Here you would typically show a toast or alert */
    console.error('Validation Error:', message);
    /* You can implement toast notification here */
  }

  /* Method to save profile changes locally */
  saveProfile(): void {
    /* Validate data before saving */
    if (!this.validateProfileData()) {
      return;
    }

    try {
      /* Save profile data to local storage for persistence */
      localStorage.setItem('profileData', JSON.stringify(this.profileData));
      
      /* Update original data to reflect saved state */
      this.originalProfileData = { ...this.profileData };
      
      /* Hide save button after successful save */
      this.showSaveButton = false;
      
      /* Show success message */
      this.showSuccessMessage('Profil berhasil disimpan');
      
    } catch (error) {
      /* Handle save error */
      console.error('Error saving profile:', error);
      this.showValidationError('Gagal menyimpan profil');
    }
  }

  /* Method to display success messages */
  private showSuccessMessage(message: string): void {
    /* Here you would typically show a success toast */
    console.log('Success:', message);
    /* You can implement toast notification here */
  }

  /* Method to load saved profile data from local storage */
  private loadSavedProfile(): void {
    try {
      const savedProfile = localStorage.getItem('profileData');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        /* Merge saved data with default data */
        this.profileData = { ...this.profileData, ...parsedProfile };
        this.originalProfileData = { ...this.profileData };
        
        /* Format date for display */
        this.formatDisplayDate();
      }
    } catch (error) {
      console.error('Error loading saved profile:', error);
    }
  }

  /* Lifecycle hook called after component initialization */
  ionViewWillEnter() {
    /* Load saved profile data when entering the page */
    this.loadSavedProfile();
  }
}