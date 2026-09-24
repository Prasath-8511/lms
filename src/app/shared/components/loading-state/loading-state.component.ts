import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `<div class="loading-state" role="status"><span class="loading-spinner"></span><span>{{ label() }}</span></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  readonly label = input('Loading…');
  readonly visible = signal(true);
}
