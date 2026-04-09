import type { Database } from '@/integrations/supabase/types';

type ItemType = Database['public']['Enums']['item_type'];
type ItemStatus = Database['public']['Enums']['item_status'];
type ItemPriority = Database['public']['Enums']['item_priority'];
type DeployEnvironment = Database['public']['Enums']['deploy_environment'];

export const STATUS_ORDER: ItemStatus[] = ['Idea', 'In Progress', 'In Review', 'Done', 'Deployed', 'Blocked'];

export function getTypeColor(type: ItemType) {
  switch (type) {
    case 'Feature': return { bg: 'bg-primary/8', text: 'text-primary', dot: 'bg-primary', border: 'border-l-primary' };
    case 'Bug': return { bg: 'bg-coral/8', text: 'text-coral', dot: 'bg-coral', border: 'border-l-coral' };
    case 'Decision': return { bg: 'bg-warning/8', text: 'text-warning', dot: 'bg-warning', border: 'border-l-warning' };
    case 'Deployment': return { bg: 'bg-success/8', text: 'text-success', dot: 'bg-success', border: 'border-l-success' };
    case 'Security': return { bg: 'bg-orange-500/8', text: 'text-orange-600', dot: 'bg-orange-500', border: 'border-l-orange-500' };
  }
}

export const MILESTONE_OPTIONS = ['60-day', '90-day', '6-month', '12-month'] as const;
export const OWNER_OPTIONS = ['Matty', 'Paul', 'Both'] as const;
export const SECURITY_SEVERITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'] as const;

export function getMilestoneLabel(milestone: string) {
  switch (milestone) {
    case '60-day': return '60-Day (May 2026)';
    case '90-day': return '90-Day (Jun 2026)';
    case '6-month': return '6-Month (Oct 2026)';
    case '12-month': return '12-Month (Apr 2027)';
    default: return milestone;
  }
}

export function getMilestoneColor(milestone: string) {
  switch (milestone) {
    case '60-day': return 'bg-coral/10 text-coral';
    case '90-day': return 'bg-warning/10 text-warning';
    case '6-month': return 'bg-primary/10 text-primary';
    case '12-month': return 'bg-navy/10 text-navy';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function getSecuritySeverityColor(severity: string) {
  switch (severity) {
    case 'Critical': return 'bg-coral/10 text-coral font-semibold';
    case 'High': return 'bg-orange-500/10 text-orange-600';
    case 'Medium': return 'bg-warning/10 text-warning';
    case 'Low': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function getStatusColor(status: ItemStatus) {
  switch (status) {
    case 'Idea': return 'bg-muted text-muted-foreground';
    case 'In Progress': return 'bg-warning/10 text-warning';
    case 'In Review': return 'bg-primary/10 text-primary';
    case 'Done': return 'bg-success/10 text-success';
    case 'Deployed': return 'bg-success/15 text-success';
    case 'Blocked': return 'bg-coral/10 text-coral';
  }
}

export function getStatusBorderColor(status: ItemStatus) {
  switch (status) {
    case 'Idea': return 'border-l-muted-foreground';
    case 'In Progress': return 'border-l-warning';
    case 'In Review': return 'border-l-primary';
    case 'Done': return 'border-l-success';
    case 'Deployed': return 'border-l-success';
    case 'Blocked': return 'border-l-coral';
  }
}

export function getPriorityColor(priority: ItemPriority) {
  switch (priority) {
    case 'Low': return 'text-muted-foreground';
    case 'Medium': return 'text-warning';
    case 'High': return 'text-coral';
    case 'Critical': return 'text-coral font-semibold';
  }
}

export function getEnvColor(env: DeployEnvironment) {
  switch (env) {
    case 'Dev': return 'bg-primary/10 text-primary';
    case 'Staging': return 'bg-warning/10 text-warning';
    case 'Production': return 'bg-success/10 text-success';
  }
}

export function getInitials(name: string) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  'hsl(238 50% 55%)',
  'hsl(0 50% 52%)',
  'hsl(43 55% 45%)',
  'hsl(152 40% 38%)',
  'hsl(210 45% 48%)',
  'hsl(280 40% 48%)',
  'hsl(340 40% 48%)',
  'hsl(160 40% 38%)',
];

export function getUserColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getStatusDot(status: ItemStatus) {
  switch (status) {
    case 'Idea': return 'bg-muted-foreground';
    case 'In Progress': return 'bg-warning';
    case 'In Review': return 'bg-primary';
    case 'Done': return 'bg-success';
    case 'Deployed': return 'bg-success';
    case 'Blocked': return 'bg-coral';
  }
}
