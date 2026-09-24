import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ROLE_LABELS, UserRole } from '../../../core/auth/auth.models';
import { IconComponent } from '../../components/icon/icon';
import { WorkspaceConfig, WorkspaceItem, WorkspaceView } from '../../models/workspace.models';

@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './workspace-page.component.html',
  styleUrl: './workspace-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleWorkspacePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  protected readonly config = computed(() => this.routeData()['config'] as WorkspaceConfig);
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal('All');
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly currentRole = computed<UserRole>(() => this.auth.role() ?? 'learner');
  protected readonly visibleItems = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.config().items.filter((item) => {
      const matchesQuery = !query || `${item.title} ${item.subtitle} ${item.meta}`.toLowerCase().includes(query);
      const matchesStatus = status === 'All' || item.status === status;
      return matchesQuery && matchesStatus;
    });
  });
  protected readonly statuses = computed(() => ['All', ...new Set(this.config().items.map((item) => item.status))]);

  protected runAction(action: string | undefined, route: string | undefined): void {
    if (route) {
      void this.router.navigateByUrl(route);
    } else if (action) {
      this.searchTerm.set(action === 'Export report' ? 'report' : '');
    }
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('All');
  }

  protected itemActionLabel(item: WorkspaceItem): string {
    return this.config().view === 'people' ? 'View profile' : this.config().view === 'reports' ? 'View report' : 'Open details';
  }

  protected setView(view: WorkspaceView): void {
    const base = `/${this.config().role === 'admin' ? 'admin' : this.config().role === 'instructor' ? 'instructor' : 'management'}`;
    const route = view === 'overview' ? `${base}/overview` : view === 'catalog' ? `${base}/catalog` : view === 'people' ? `${base}/people` : `${base}/reports`;
    void this.router.navigateByUrl(route);
  }
}
