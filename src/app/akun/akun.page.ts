import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonToolbar } from '@ionic/angular';

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
export class AkunPage implements OnInit, OnDestroy, AfterViewInit {

  /* ViewChild references for scroll detection */
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild(IonToolbar, { static: false, read: ElementRef }) toolbar!: ElementRef;

  /* Observers for scroll detection */
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

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

  ngAfterViewInit() {
    /* Initialize scroll detection after view is ready */
    setTimeout(() => {
      this.initializeScrollDetection();
    }, 100);
  }

  ngOnDestroy() {
    /* Clean up observers */
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  /* Initialize scroll detection system */
  private async initializeScrollDetection() {
    try {
      /* Get the native scroll element */
      const scrollElement = await this.content.getScrollElement();
      
      if (scrollElement && this.toolbar) {
        /* Initial check */
        this.checkScrollbar(scrollElement);

        /* Create ResizeObserver to watch for content changes */
        this.resizeObserver = new ResizeObserver(() => {
          this.checkScrollbar(scrollElement);
        });

        /* Observe the scroll element */
        this.resizeObserver.observe(scrollElement);

        /* Also observe the content for dynamic changes */
        this.mutationObserver = new MutationObserver(() => {
          setTimeout(() => this.checkScrollbar(scrollElement), 50);
        });

        this.mutationObserver.observe(scrollElement, {
          childList: true,
          subtree: true,
          attributes: true
        });

        /* Listen for window resize */
        window.addEventListener('resize', () => {
          setTimeout(() => this.checkScrollbar(scrollElement), 100);
        });
      }
    } catch (error) {
      console.warn('Could not initialize scroll detection:', error);
    }
  }

  /* Check if scrollbar is present and adjust toolbar accordingly */
  private checkScrollbar(scrollElement: HTMLElement) {
    const hasVerticalScrollbar = scrollElement.scrollHeight > scrollElement.clientHeight;
    const toolbarElement = this.toolbar?.nativeElement;

    if (toolbarElement) {
      if (hasVerticalScrollbar) {
        /* Calculate scrollbar width dynamically */
        const scrollbarWidth = this.getScrollbarWidth();
        toolbarElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        toolbarElement.classList.add('has-scrollbar');
      } else {
        toolbarElement.classList.remove('has-scrollbar');
        toolbarElement.style.removeProperty('--scrollbar-width');
      }
    }
  }

  /* Calculate scrollbar width dynamically */
  private getScrollbarWidth(): number {
    /* Create temporary element to measure scrollbar width */
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.width = '100px';
    outer.style.height = '100px';
    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '200px';
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    document.body.removeChild(outer);

    return scrollbarWidth || 17; /* Fallback to 17px */
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
    
    /* Recheck scrollbar when content changes */
    setTimeout(() => {
      if (this.content) {
        this.content.getScrollElement().then(scrollElement => {
          if (scrollElement) {
            this.checkScrollbar(scrollElement);
          }
        });
      }
    }, 100);
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
      
      /* Recheck scrollbar after save button is hidden */
      setTimeout(() => {
        if (this.content) {
          this.content.getScrollElement().then(scrollElement => {
            if (scrollElement) {
              this.checkScrollbar(scrollElement);
            }
          });
        }
      }, 100);
      
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
    
    /* Initialize scroll detection when entering the page */
    setTimeout(() => {
      this.initializeScrollDetection();
    }, 200);
  }
}