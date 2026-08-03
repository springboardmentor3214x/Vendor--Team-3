import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { SidebarService } from '../layout/sidebar.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  // Font settings
  fontSize: string = 'medium';
  fontFamily: string = 'inter';

  // Theme
  colorTheme: string = 'light';

  // Language
  language: string = 'english';

  // Notifications
  emailNotifications: boolean = true;
  inAppNotifications: boolean = true;
  orderNotifications: boolean = true;

  // Change password
  showPasswordForm = false;
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordMessage = '';
  passwordError = '';
  showCurrentPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;

  successMessage = '';
  private apiUrl = 'http://localhost:8000'; // Note: adjust in production (e.g. environment.apiUrl)

  readonly fontSizes = [
    { value: 'small', label: 'Small', size: '13px' },
    { value: 'medium', label: 'Medium', size: '15px' },
    { value: 'large', label: 'Large', size: '17px' },
    { value: 'xlarge', label: 'Extra Large', size: '19px' }
  ];

  readonly fontFamilies = [
    { value: 'inter', label: 'Inter (Default)', css: "'Inter', sans-serif" },
    { value: 'roboto', label: 'Roboto', css: "'Roboto', sans-serif" },
    { value: 'opensans', label: 'Open Sans', css: "'Open Sans', sans-serif" },
    { value: 'lato', label: 'Lato', css: "'Lato', sans-serif" }
  ];

  readonly themes = [
    { value: 'light', label: '☀️ Light', preview: '#f8f9fa' },
    { value: 'dark', label: '🌙 Dark', preview: '#1e293b' },
    { value: 'blue', label: '💧 Blue Accent', preview: '#eff6ff' },
    { value: 'green', label: '🌿 Nature Green', preview: '#f0fdf4' }
  ];

  readonly languages = [
    { value: 'english', label: '🇬🇧 English' },
    { value: 'hindi', label: '🇮🇳 Hindi (हिंदी)' },
    { value: 'marathi', label: '🇮🇳 Marathi (मराठी)' },
    { value: 'gujarati', label: '🇮🇳 Gujarati (ગુજરાતી)' }
  ];

  constructor(
    public sidebarService: SidebarService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load saved preferences
    this.fontSize = localStorage.getItem('vrp_fontSize') || 'medium';
    this.fontFamily = localStorage.getItem('vrp_fontFamily') || 'inter';
    this.colorTheme = localStorage.getItem('vrp_theme') || 'light';
    this.language = localStorage.getItem('vrp_language') || 'english';
    this.emailNotifications = localStorage.getItem('vrp_emailNotif') !== 'false';
    this.inAppNotifications = localStorage.getItem('vrp_inAppNotif') !== 'false';
    this.orderNotifications = localStorage.getItem('vrp_orderNotif') !== 'false';
  }

  applyFontSize() {
    const sizeMap: { [key: string]: string } = {
      small: '13px', medium: '15px', large: '17px', xlarge: '19px'
    };
    document.documentElement.style.setProperty('--base-font-size', sizeMap[this.fontSize]);
    document.body.style.fontSize = sizeMap[this.fontSize];
    localStorage.setItem('vrp_fontSize', this.fontSize);
  }

  applyFontFamily() {
    const familyMap: { [key: string]: string } = {
      inter: "'Inter', sans-serif",
      roboto: "'Roboto', sans-serif",
      opensans: "'Open Sans', sans-serif",
      lato: "'Lato', sans-serif"
    };
    document.body.style.fontFamily = familyMap[this.fontFamily];
    localStorage.setItem('vrp_fontFamily', this.fontFamily);
  }

  applyTheme() {
    const themeMap: { [key: string]: { bgMain: string; bgCard: string; sidebar: string; primary: string; textMain: string } } = {
      light: { bgMain: '#f1f5f9', bgCard: '#ffffff', sidebar: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)', primary: '#6366f1', textMain: '#0f172a' },
      dark:  { bgMain: '#0f172a', bgCard: '#1e293b', sidebar: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)', primary: '#3b82f6', textMain: '#f8fafc' },
      blue:  { bgMain: '#eff6ff', bgCard: '#ffffff', sidebar: 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 100%)', primary: '#2563eb', textMain: '#0f172a' },
      green: { bgMain: '#f0fdf4', bgCard: '#ffffff', sidebar: 'linear-gradient(180deg, #14532d 0%, #166534 100%)', primary: '#16a34a', textMain: '#0f172a' }
    };
    const t = themeMap[this.colorTheme];
    
    // Update global CSS variables
    document.documentElement.style.setProperty('--bg-main', t.bgMain);
    document.documentElement.style.setProperty('--bg-card', t.bgCard);
    document.documentElement.style.setProperty('--gradient-sidebar', t.sidebar);
    document.documentElement.style.setProperty('--primary', t.primary);
    document.documentElement.style.setProperty('--text-main', t.textMain);
    
    // Ensure body background updates seamlessly
    document.body.style.backgroundColor = 'var(--bg-main)';
    
    localStorage.setItem('vrp_theme', this.colorTheme);
  }

  applyLanguage() {
    localStorage.setItem('vrp_language', this.language);
    // Language display label
    const langLabels: { [key: string]: string } = {
      english: 'English',
      hindi: 'Hindi',
      marathi: 'Marathi',
      gujarati: 'Gujarati'
    };
    localStorage.setItem('vrp_languageLabel', langLabels[this.language]);
  }

  saveAllSettings() {
    this.applyFontSize();
    this.applyFontFamily();
    this.applyTheme();
    this.applyLanguage();
    localStorage.setItem('vrp_emailNotif', String(this.emailNotifications));
    localStorage.setItem('vrp_inAppNotif', String(this.inAppNotifications));
    localStorage.setItem('vrp_orderNotif', String(this.orderNotifications));
    this.successMessage = '✅ Settings saved and applied!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  resetToDefaults() {
    this.fontSize = 'medium';
    this.fontFamily = 'inter';
    this.colorTheme = 'light';
    this.language = 'english';
    this.emailNotifications = true;
    this.inAppNotifications = true;
    this.orderNotifications = true;
    this.saveAllSettings();
    this.successMessage = '✅ Settings reset to defaults!';
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.passwordMessage = '';
    this.passwordError = '';
  }

  onChangePassword() {
    this.passwordMessage = '';
    this.passwordError = '';
    const email = localStorage.getItem('userEmail') || '';

    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.passwordError = 'Please fill in all password fields.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters.';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }

    fetch(`${this.apiUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, new_password: this.newPassword })
    }).then(res => {
      if (res.ok) {
        this.passwordMessage = '✅ Password changed successfully!';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        setTimeout(() => { this.showPasswordForm = false; this.passwordMessage = ''; }, 2500);
      } else {
        this.passwordError = '❌ Failed to change password. Please try again.';
      }
    }).catch(() => {
      this.passwordError = '❌ Could not connect to server.';
    });
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }
}
