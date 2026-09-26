import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/auth/auth.models';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly registrationForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    role: this.formBuilder.control<UserRole>('learner'),
  });

  protected submit(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.errorMessage.set('');
    this.registrationForm.markAllAsTouched();
    if (this.registrationForm.invalid) {
      this.errorMessage.set('Please fill in all fields correctly.');
      return;
    }

    const { name, email, password, confirmPassword, role } = this.registrationForm.getRawValue();
    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);
    this.auth.registerAccount(name.trim(), email.trim(), password, role).pipe(finalize(() => this.isSubmitting.set(false))).subscribe((registered) => {
      if (!registered) {
        this.errorMessage.set('Unable to create the account. Check your details and try again.');
        return;
      }
      void this.router.navigateByUrl(this.auth.homeRoute());
    });
  }
}
