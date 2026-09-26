import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon';
import { StatusPillComponent } from '../status-pill/status-pill.component';
import { FeaturePageConfig, FeaturePageItem } from '../../models/feature-page.models';

@Component({
  selector: 'app-feature-page',
  standalone: true,
  imports: [RouterLink, IconComponent, StatusPillComponent],
  templateUrl: './feature-page.component.html',
  styleUrl: './feature-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturePageComponent {
  readonly config = input.required<FeaturePageConfig>();
  readonly primaryAction = output<void>();
  readonly secondaryAction = output<void>();
  readonly itemAction = output<FeaturePageItem>();
}
