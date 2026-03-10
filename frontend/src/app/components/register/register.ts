import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  // Signals to hold form values and UI states
  fullName = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');

  error = signal<string>('');
  loading = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Handles form submission for registration.
   * - Prevents default form submission
   * - Validates required fields + password match
   * - Calls AuthService.register
   * - Redirects to login on success
   */
  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    this.error.set('');

    const nameVal = this.fullName().trim();
    const emailVal = this.email().trim();
    const passwordVal = this.password();
    const confirmPasswordVal = this.confirmPassword();

    // Basic client-side validation (template handles detailed validation)
    if (!nameVal || !emailVal || !passwordVal || !confirmPasswordVal) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (passwordVal !== confirmPasswordVal) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);

    try {
      const success = await this.authService.register({
        fullName: nameVal,
        email: emailVal,
        password: passwordVal,
      });

      if (success) {
        // Redirect to login after successful registration
        await this.router.navigate(['/agent/dashboard']);

      } else {
        this.error.set('Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Registration error:', err);
      this.error.set('Registration failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
