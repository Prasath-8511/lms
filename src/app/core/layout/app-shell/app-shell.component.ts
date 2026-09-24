import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserRole } from '../../auth/auth.models';
import { LmsStoreService } from '../../data-access/lms-store.service';
import { IconComponent } from '../../../shared/components/icon/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly store = inject(LmsStoreService);
  private readonly router = inject(Router);
  protected readonly sidebarOpen = signal(false);
  protected readonly notificationsOpen = signal(false);
  protected readonly profileOpen = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly currentUser = this.auth.user;
  protected readonly profile = computed(() => {
    const user = this.currentUser();
    return user
      ? { name: user.name, role: user.roleLabel, email: user.email, initials: user.initials }
      : this.store.profile();
  });
  protected readonly unreadCount = this.store.unreadAnnouncements;
  protected readonly dataSourceLabel = computed(() =>
    this.store.dataSource() === 'mock' ? 'Demo data' : 'Live API',
  );
  protected readonly navGroups = computed<NavGroup[]>(() => this.buildNavigation(this.auth.role()));

  private buildNavigation(role: UserRole | null): NavGroup[] {
    if (role === 'instructor') {
      return [{ label: 'Instructor workspace', items: [
        { label: 'Overview', icon: 'grid', route: '/instructor/overview', exact: true },
        { label: 'My courses', icon: 'book', route: '/instructor/courses' },
        { label: 'Course content', icon: 'book', route: '/instructor/courses/101/content' },
        { label: 'Assessments', icon: 'clipboard', route: '/instructor/courses/101/assessments' },
        { label: 'Grading', icon: 'check', route: '/instructor/grading' },
        { label: 'Learners', icon: 'users', route: '/instructor/people' },
        { label: 'Announcements', icon: 'megaphone', route: '/instructor/announcements' },
        { label: 'Reports', icon: 'chart', route: '/instructor/reports' },
      ] }];
    }
    if (role === 'management') {
      return [{ label: 'Management workspace', items: [
        { label: 'Overview', icon: 'grid', route: '/management/overview', exact: true },
        { label: 'Programs', icon: 'book', route: '/management/catalog' },
        { label: 'People & teams', icon: 'users', route: '/management/people' },
        { label: 'Course review', icon: 'clipboard', route: '/management/course-review' },
        { label: 'Announcements', icon: 'megaphone', route: '/management/announcements' },
        { label: 'Learning dashboard', icon: 'chart', route: '/management/dashboard' },
        { label: 'Enrollments', icon: 'users', route: '/management/enrollments' },
        { label: 'Reports', icon: 'chart', route: '/management/reports' },
      ] }];
    }
    if (role === 'admin') {
      return [{ label: 'Administration', items: [
        { label: 'Overview', icon: 'grid', route: '/admin/overview', exact: true },
        { label: 'Content', icon: 'book', route: '/admin/catalogue' },
        { label: 'Users', icon: 'users', route: '/admin/users' },
        { label: 'User details', icon: 'users', route: '/admin/users/1' },
        { label: 'Roles & permissions', icon: 'lock', route: '/admin/roles' },
        { label: 'Audit history', icon: 'clipboard', route: '/admin/audit' },
        { label: 'Reports', icon: 'chart', route: '/admin/reports' },
      ] }];
    }
    return [
      { label: 'Workspace', items: [
        { label: 'Dashboard', icon: 'grid', route: '/dashboard', exact: true },
        { label: 'Courses', icon: 'book', route: '/courses' },
        { label: 'My Learning', icon: 'play', route: '/my-learning' },
        { label: 'Enrollments', icon: 'clipboard', route: '/enrollments' },
        { label: 'Player', icon: 'play', route: '/player' },
        { label: 'Progress', icon: 'trend', route: '/progress' },
        { label: 'Assessments', icon: 'clipboard', route: '/assessments' },
        { label: 'Attempts', icon: 'clipboard', route: '/attempts' },
        { label: 'Certifications', icon: 'award', route: '/certificates' },
      ] },
      { label: 'Stay connected', items: [
        { label: 'Announcements', icon: 'megaphone', route: '/announcements' },
        { label: 'Reports', icon: 'chart', route: '/reports' },
      ] },
    ];
  }

  protected submitSearch(): void {
    const query = this.searchTerm().trim();
    const role = this.auth.role();
    const destination = role === 'learner' ? '/courses' : `/${role ?? 'learner'}/catalog`;
    void this.router.navigate([destination], { queryParams: query ? { q: query } : {} });
    this.sidebarOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
    this.closeOverlays();
    this.sidebarOpen.set(false);
    void this.router.navigateByUrl('/login');
  }

  protected closeOverlays(): void {
    this.notificationsOpen.set(false);
    this.profileOpen.set(false);
  }

  protected toggleNotifications(): void {
    this.profileOpen.set(false);
    this.notificationsOpen.update((open) => !open);
  }

  protected toggleProfile(): void {
    this.notificationsOpen.set(false);
    this.profileOpen.update((open) => !open);
  }
}

