import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-status-pill',
  standalone: true,
  template: `<span class="status-pill" [class]="'status-pill status-pill--' + tone()">{{ label() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPillComponent {
  readonly label = input.required<string>();
  readonly tone = input<'blue' | 'green' | 'orange' | 'gray' | 'violet'>('blue');
}
