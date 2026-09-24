import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiClientService } from '../../../core/data-access/api-client.service';
import { LmsStoreService } from '../../../core/data-access/lms-store.service';
import { IconComponent } from '../../../shared/components/icon/icon';

interface UtilityCard {
  icon: string;
  title: string;
  description: string;
  action: string;
}

interface UtilityContent {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  cards: UtilityCard[];
}

@Component({
  selector: 'app-utility-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './utility.html',
  styleUrl: './utility.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilityPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiClientService);
  protected readonly store = inject(LmsStoreService);
  protected readonly content = this.route.snapshot.data['content'] as UtilityContent;
  protected readonly isSettings = this.route.snapshot.data['mode'] === 'settings';
  protected readonly apiKey = signal('');
  protected readonly keySaved = signal(false);

  protected saveApiKey(): void {
    const value = this.apiKey().trim();
    if (value) {
      this.api.setRuntimeApiKey(value);
      this.keySaved.set(true);
    }
  }
}
