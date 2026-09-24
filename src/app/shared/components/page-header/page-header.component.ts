import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div><span class="eyebrow">{{ eyebrow() }}</span><h1>{{ title() }}</h1><p>{{ description() }}</p></div>
      @if (actionLabel()) { @if (actionRoute()) { <a class="button button--primary" [routerLink]="actionRoute()!">{{ actionLabel() }}</a> } @else { <button class="button button--primary" type="button">{{ actionLabel() }}</button> } }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly actionLabel = input<string>();
  readonly actionRoute = input<string>();
}
