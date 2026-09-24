import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ROLE_LABELS, UserRole } from '../../../core/auth/auth.models';
import { IconComponent } from '../../../shared/components/icon/icon';

interface DemoAccount {
  role: UserRole;
  email: string;
  label: string;
  description: string;
  initials: string;
  tone: string;
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly rememberMe = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly selectedRole = signal<UserRole>('learner');
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly demoAccounts: DemoAccount[] = [
    { role: 'learner', email: 'learner@learnsphere.com', label: 'Learner', description: 'Continue your learning journey', initials: 'AJ', tone: 'blue' },
    { role: 'instructor', email: 'instructor@learnsphere.com', label: 'Instructor', description: 'Create and guide learning', initials: 'MT', tone: 'violet' },
    { role: 'management', email: 'manager@learnsphere.com', label: 'Management', description: 'Align teams and impact', initials: 'JL', tone: 'orange' },
    { role: 'admin', email: 'admin@learnsphere.com', label: 'Admin', description: 'Manage the platform', initials: 'SR', tone: 'green' },
  ];

  protected selectDemo(account: DemoAccount): void {
    this.selectedRole.set(account.role);
    this.email.set(account.email);
    this.password.set('demo123');
    this.errorMessage.set('');
  }

  protected submit(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.errorMessage.set('');
    this.isSubmitting.set(true);
    const loggedIn = this.auth.login(this.email(), this.password(), this.rememberMe());
    if (!loggedIn) {
      this.errorMessage.set('We could not sign you in. Check your email and password and try again.');
      this.isSubmitting.set(false);
      return;
    }
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    void this.router.navigateByUrl(returnUrl || this.auth.homeRoute());
    this.isSubmitting.set(false);
  }
}
