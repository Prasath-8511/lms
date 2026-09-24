export interface FeaturePageStat {
  label: string;
  value: string;
  change: string;
  tone: 'blue' | 'green' | 'violet' | 'orange' | 'gray';
}

export interface FeaturePageItem {
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  statusTone: 'blue' | 'green' | 'orange' | 'gray' | 'violet';
  action: string;
}

export interface FeaturePageConfig {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  primaryAction: string;
  primaryRoute?: string;
  secondaryAction?: string;
  secondaryRoute?: string;
  stats: FeaturePageStat[];
  items: FeaturePageItem[];
}
