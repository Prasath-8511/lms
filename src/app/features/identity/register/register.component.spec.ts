import { provideHttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { RegisterPage } from './register.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('RegisterPage', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    localStorage.clear();
    localStorage.removeItem('learnsphere_mock_accounts');
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(AuthService).logout();
  });

  it('renders a normal registration form and registers when the button is clicked', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const inputs = element.querySelectorAll('input');
    const select = element.querySelector('select') as HTMLSelectElement;
    const button = element.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(element.querySelector('.register-card')).toBeTruthy();
    expect(element.querySelector('app-feature-page')).toBeNull();
    expect(inputs.length).toBe(4);
    expect(button.textContent).toContain('Create account');

    const form = (fixture.componentInstance as unknown as { registrationForm: FormGroup })
      .registrationForm;
    form.setValue({
      name: 'Taylor Reed',
      email: 'taylor@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'management',
    });
    fixture.detectChanges();
    button.click();
    fixture.detectChanges();

    expect(TestBed.inject(AuthService).role()).toBe('management');
    expect(TestBed.inject(AuthService).homeRoute()).toBe('/management/overview');
  });
});
