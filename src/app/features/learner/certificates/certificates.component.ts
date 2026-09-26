import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { CertificateApiService } from '../data-access/certificate-api.service';
import { FeaturePageComponent } from '../../../shared/components/feature-page/feature-page.component';
import { FeaturePageConfig, FeaturePageItem } from '../../../shared/models/feature-page.models';
import { Certificate } from '../../../shared/models/lms.models';

@Component({
  selector: 'app-certificates-page',
  standalone: true,
  imports: [FeaturePageComponent],
  template: '<app-feature-page [config]="config()" (itemAction)="download($event)" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificatesPage {
  private readonly api = inject(CertificateApiService);
  protected readonly busyId = signal<number | null>(null);
  protected readonly config = signal<FeaturePageConfig>({
    eyebrow: 'Learner', title: 'Certificates', description: 'View, verify, and download the credentials you have earned.', icon: 'award', primaryAction: 'Explore courses', primaryRoute: '/courses', secondaryAction: 'View learning progress', secondaryRoute: '/progress', stats: [], items: [], loading: true, errorMessage: '', emptyMessage: 'You have not earned any certificates yet.',
  });

  constructor() { this.load(); }

  private load(): void {
    this.api.list().pipe(finalize(() => this.config.update((config) => ({ ...config, loading: false })))).subscribe({
      next: (certificates) => this.updateConfig(certificates),
      error: (error: { error?: { message?: string }; message?: string }) => this.config.update((config) => ({ ...config, errorMessage: error.error?.message ?? error.message ?? 'Unable to load your certificates.' })),
    });
  }

  protected download(item: FeaturePageItem): void {
    if (!item.id || this.busyId() !== null) return;
    this.busyId.set(item.id);
    this.api.download(item.id).pipe(finalize(() => this.busyId.set(null))).subscribe({
      next: (file) => this.saveFile(file, `certificate-${item.id}`),
      error: (error: { error?: { message?: string }; message?: string }) => this.config.update((config) => ({ ...config, errorMessage: error.error?.message ?? error.message ?? 'Unable to download this certificate.' })),
    });
  }

  private saveFile(blob: Blob, name: string): void {
    if (typeof blob === 'string' || typeof URL === 'undefined') return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private updateConfig(certificates: Certificate[]): void {
    const items: FeaturePageItem[] = certificates.map((certificate) => ({ id: certificate.id, title: certificate.title, subtitle: certificate.issuer, meta: certificate.issuedOn, status: 'Verified', statusTone: 'green', action: 'Download' }));
    this.config.update((config) => ({ ...config, errorMessage: '', items, stats: [{ label: 'Earned', value: String(certificates.length), change: 'Verified credentials', tone: 'green' }, { label: 'This quarter', value: String(certificates.filter((certificate) => certificate.issuedOn.includes('2026')).length), change: 'Current year', tone: 'blue' }, { label: 'Skills verified', value: String(new Set(certificates.flatMap((certificate) => certificate.skills)).size), change: 'Across all certificates', tone: 'violet' }, { label: 'Expiring soon', value: '0', change: 'Nothing to renew', tone: 'orange' }] }));
  }
}

