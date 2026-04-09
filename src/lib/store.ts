import { create } from 'zustand';
import type { Database } from '@/integrations/supabase/types';

type ItemType = Database['public']['Enums']['item_type'];
type ItemPriority = Database['public']['Enums']['item_priority'];

export type ActiveView = 'dashboard' | 'board' | 'table' | 'roadmap' | 'settings' | 'apps-manage';

interface UIStore {
  activeView: ActiveView;
  activeProjectId: string | null; // null = All Projects, or app UUID
  selectedItemId: string | null;
  filterType: ItemType | null;
  filterPriority: ItemPriority | null;
  filterAssignee: string | null;
  filterMilestone: string | null;
  filterOwner: string | null;
  quickAddOpen: boolean;

  setActiveView: (view: ActiveView) => void;
  setActiveProject: (id: string | null) => void;
  setSelectedItem: (id: string | null) => void;
  setFilter: (filter: {
    type?: ItemType | null;
    priority?: ItemPriority | null;
    assignee?: string | null;
    milestone?: string | null;
    owner?: string | null;
  }) => void;
  clearFilters: () => void;
  setQuickAddOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: 'dashboard',
  activeProjectId: null,
  selectedItemId: null,
  filterType: null,
  filterPriority: null,
  filterAssignee: null,
  filterMilestone: null,
  filterOwner: null,
  quickAddOpen: false,

  setActiveView: (view) => set({ activeView: view, selectedItemId: null }),
  setActiveProject: (id) => set({ activeProjectId: id }),
  setSelectedItem: (id) => set({ selectedItemId: id }),
  setFilter: (filter) => set((s) => ({
    filterType: filter.type !== undefined ? filter.type : s.filterType,
    filterPriority: filter.priority !== undefined ? filter.priority : s.filterPriority,
    filterAssignee: filter.assignee !== undefined ? filter.assignee : s.filterAssignee,
    filterMilestone: filter.milestone !== undefined ? filter.milestone : s.filterMilestone,
    filterOwner: filter.owner !== undefined ? filter.owner : s.filterOwner,
  })),
  clearFilters: () => set({ filterType: null, filterPriority: null, filterAssignee: null, filterMilestone: null, filterOwner: null }),
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
}));
