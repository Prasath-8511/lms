import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LmsStoreService } from '../../../core/data-access/lms-store.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-announcements-page',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './announcements.html',
  styleUrl: './announcements.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementsPage {
  protected readonly store = inject(LmsStoreService);
  protected readonly activeFilter = signal<'All' | 'Learning' | 'Platform' | 'Community'>('All');
  protected readonly filters: Array<'All' | 'Learning' | 'Platform' | 'Community'> = ['All', 'Learning', 'Platform', 'Community'];
  protected readonly filteredAnnouncements = computed(() => {
    const filter = this.activeFilter();
    return filter === 'All' ? this.store.announcements() : this.store.announcements().filter((item) => item.category === filter);
  });
}
