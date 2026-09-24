import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideRouter(routes)],
    }).compileComponents();
    TestBed.inject(AuthService).logout();
  });

  afterEach(() => {
    TestBed.inject(AuthService).logout();
  });

  it('should create the application shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the login outlet when nobody is authenticated', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-frame')).toBeNull();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render the protected shell after a learner signs in', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.login('learner@learnsphere.com', 'demo123', false)).toBeTrue();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand-copy strong')?.textContent).toContain('LearnSphere');
    expect(compiled.querySelector('nav[aria-label="Primary navigation"]')).toBeTruthy();
    expect(compiled.querySelector('input[aria-label^="Search courses"]')).toBeTruthy();
  });
});

