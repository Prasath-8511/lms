import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  template: `<div class="empty-state"><app-icon [name]="icon()" [size]="24" /><strong>{{ title() }}</strong><p>{{ description() }}</p>@if (actionLabel()) { <button class="button button--secondary button--small" type="button">{{ actionLabel() }}</button> }</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input('sparkles');
  readonly actionLabel = input<string>();
}
