import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const days = Math.max(0, Math.round((Date.now() - date.getTime()) / 86_400_000));
    return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
  }
}
