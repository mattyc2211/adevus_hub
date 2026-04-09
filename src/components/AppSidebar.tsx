import { LayoutDashboard, Settings, Plus, Boxes, Map, LayoutGrid, List, ChevronsUpDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import type { ActiveView } from '@/lib/store';
import { useApps, useItems } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { activeView, activeProjectId, setActiveView, setActiveProject, setQuickAddOpen } = useUIStore();
  const { data: apps = [] } = useApps();
  const { data: items = [] } = useItems();
  const { signOut, profile, isAdmin } = useAuth();
  const activeApps = apps.filter((a) => a.status !== 'Archived');

  const currentApp = activeProjectId ? activeApps.find((a) => a.id === activeProjectId) : null;
  const itemCount = activeProjectId ? items.filter((i) => i.app_id === activeProjectId).length : items.length;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-sidebar text-sidebar-foreground flex flex-col z-30">
      <div className="px-4 py-4 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-sidebar-primary-foreground">A</span>
        </div>
        <span className="font-semibold text-sm tracking-tight">Adevus</span>
      </div>

      <ProjectSwitcher
        apps={activeApps}
        currentApp={currentApp}
        activeProjectId={activeProjectId}
        onSelect={(id) => setActiveProject(id)}
      />

      <div className="px-3 mt-3 mb-2">
        <button
          onClick={() => setQuickAddOpen(true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Item
        </button>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="mb-3">
          <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">Views</p>
          <SidebarItem
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            active={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
          />
          <SidebarItem
            icon={<LayoutGrid className="w-4 h-4" />}
            label="Board"
            active={activeView === 'board'}
            onClick={() => setActiveView('board')}
            count={itemCount}
          />
          <SidebarItem
            icon={<List className="w-4 h-4" />}
            label="Table"
            active={activeView === 'table'}
            onClick={() => setActiveView('table')}
          />
          <SidebarItem
            icon={<Map className="w-4 h-4" />}
            label="Roadmap"
            active={activeView === 'roadmap'}
            onClick={() => setActiveView('roadmap')}
          />
        </div>
        <div>
          <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">Manage</p>
          <SidebarItem
            icon={<Boxes className="w-4 h-4" />}
            label="Products"
            active={activeView === 'apps-manage'}
            onClick={() => setActiveView('apps-manage')}
          />
          {isAdmin && (
            <SidebarItem
              icon={<Settings className="w-4 h-4" />}
              label="Settings"
              active={activeView === 'settings'}
              onClick={() => setActiveView('settings')}
            />
          )}
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-sidebar-muted truncate">{profile?.name || profile?.email}</p>
          <button onClick={signOut} className="text-[10px] text-sidebar-muted hover:text-sidebar-foreground transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

function ProjectSwitcher({ apps, currentApp, activeProjectId, onSelect }: {
  apps: any[];
  currentApp: any;
  activeProjectId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="px-3 relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-sidebar-accent transition-colors"
      >
        {currentApp ? (
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: currentApp.color_tag }} />
        ) : (
          <div className="w-2 h-2 rounded-full flex-shrink-0 bg-sidebar-muted" />
        )}
        <span className="flex-1 text-left text-xs font-medium truncate">
          {currentApp ? currentApp.name : 'All Projects'}
        </span>
        <ChevronsUpDown className="w-3 h-3 text-sidebar-muted flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-sidebar-accent border border-sidebar-border rounded shadow-lg z-50 py-1 max-h-[300px] overflow-y-auto">
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-sidebar-primary/15 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-sidebar-muted" />
            <span className="flex-1 text-left text-sidebar-foreground">All Projects</span>
            {activeProjectId === null && <Check className="w-3 h-3 text-sidebar-primary" />}
          </button>
          <div className="border-t border-sidebar-border my-1" />
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => { onSelect(app.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-sidebar-primary/15 transition-colors"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: app.color_tag }} />
              <span className="flex-1 text-left text-sidebar-foreground truncate">{app.name}</span>
              {activeProjectId === app.id && <Check className="w-3 h-3 text-sidebar-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, count }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-xs transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
    >
      <span className="flex items-center justify-center w-4">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-[10px] text-sidebar-muted">{count}</span>}
    </button>
  );
}
