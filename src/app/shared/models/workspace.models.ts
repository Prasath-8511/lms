import { UserRole } from '../../core/auth/auth.models';

export type WorkspaceView = 'overview' | 'catalog' | 'people' | 'reports';

export interface WorkspaceStat {
  label: string;
  value: string;
  change: string;
  icon: string;
  tone: 'blue' | 'green' | 'violet' | 'orange';
}

export interface WorkspaceItem {
  id: number;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  initials: string;
  tone: 'blue' | 'green' | 'violet' | 'orange' | 'pink' | 'cyan';
  progress?: number;
}

export interface WorkspaceTask {
  title: string;
  detail: string;
  status: string;
  icon: string;
  tone: 'blue' | 'green' | 'orange' | 'violet';
}

export interface WorkspaceAction {
  label: string;
  route?: string;
  action?: string;
}

export interface WorkspaceConfig {
  role: UserRole;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  view: WorkspaceView;
  stats: WorkspaceStat[];
  items: WorkspaceItem[];
  tasks: WorkspaceTask[];
  chart: number[];
  chartTitle: string;
  chartDescription: string;
  primaryAction: WorkspaceAction;
  secondaryAction: WorkspaceAction;
  searchPlaceholder: string;
  primaryColumn: string;
  secondaryColumn: string;
  metricColumn: string;
  itemAction: string;
}
