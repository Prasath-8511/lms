import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input<number>(20);

  private readonly paths: Record<string, string> = {
    circle: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM4 5.5v16M8 7h8M8 11h7',
    play: 'm8 5 11 7-11 7V5Z',
    clipboard: 'M9 5h6M9 3h6v4H9zM6 5H4v16h16V5h-2M8 12h8M8 16h5',
    award: 'm12 15 3.5 2 3.5-2-.8-4.2L21 8l-3.5-1.8L12 3 6.5 6.2 3 8l2.8 2.8L5 17l3.5-2 3.5 2ZM8.2 8.2 12 12l3.8-3.8',
    megaphone: 'm3 11 17-6v14L3 13v-2ZM7 14l1.5 5H11l-1-4.3M21 10a2 2 0 0 1 0 4',
    chart: 'M4 19V5M4 19h17M8 16v-4M12 16V8M16 16v-7M20 16v-4',
    help: 'M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
    settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6v-2.6h.1A1.7 1.7 0 0 0 7.6 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1Z',
    logout: 'M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5',
    search: 'm21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
    'chevron-down': 'm6 9 6 6 6-6',
    'chevron-right': 'm9 18 6-6-6-6',
    'arrow-right': 'M5 12h14M13 6l6 6-6 6',
    clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    check: 'm5 12 4 4L19 6',
    calendar: 'M6 3v4M18 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1ZM8 13h3M8 17h3M14 13h2',
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'M6 6l12 12M18 6 6 18',
    download: 'M12 3v12M7 10l5 5 5-5M4 21h16',
    filter: 'M4 6h16M7 12h10M10 18h4',
    plus: 'M12 5v14M5 12h14',
    lock: 'M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    trend: 'M3 17 9 11l4 4 8-9M15 6h6v6',
    certificate: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM8.5 13.5 7 22l5-3 5 3-1.5-8.5',
    target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    external: 'M14 3h7v7M21 3l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5',
    sparkles: 'm12 3-1.2 4.2L7 8.5l3.8 1.3L12 14l1.2-4.2L17 8.5l-3.8-1.3L12 3ZM19 14l-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7L19 14ZM5 14l-.6 1.9L2.5 16.5l1.9.6L5 19l.6-1.9 1.9-.6-1.9-.6L5 14Z',
    code: 'm8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14',
    bug: 'M8 8h8v7a4 4 0 0 1-8 0V8ZM9 4l1 4M15 4l-1 4M4 13h4M16 13h4M5 8l3 2M19 8l-3 2M5 18l3-2M19 18l-3-2',
    robot: 'M8 8h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3ZM12 8V5M9 13h.01M15 13h.01M9 16h6',
    server: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01M12 7h5M12 17h5',
    palette: 'M12 3a9 9 0 0 0 0 18h1.2a1.8 1.8 0 0 0 1.2-3.1 1.8 1.8 0 0 1 1.2-3.1H18A3 3 0 0 0 21 12a9 9 0 0 0-9-9ZM7.5 11h.01M9 7.5h.01M14 7h.01M17 10h.01',
  };

  readonly path = computed(() => this.paths[this.name()] ?? this.paths['circle']);
}
