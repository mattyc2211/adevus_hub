import { create } from 'zustand';
import type { Database } from '@/integrations/supabase/types';

type ItemType = Database['public']['Enums']['item_type'];
type ItemPriority = Database['public']['Enums']['item_priority'];

interface UIStore {
  selectedAppId: string | null; // null = dashboard, 'all', 'changelog', 'settings', 'roadmap', 'security', or app UUID
  selectedItemId: string | null;
  viewMode: Record<string, 'board' | 'list'>;
  filterType: ItemType | null;
  filterPriority: ItemPriority | null;
  filterAssignee: string | null;
  filterMilestone: string | null;
  filterOwner: string | null;
  quickAddOpen: boolean;

  setSelectedApp: (id: string | null) => void;
  setSelectedItem: (id: string | null) => void;
  setViewMode: (appId: string, mode: 'board' | 'list') => void;
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
  selectedAppId: null,
  selectedItemId: null,
  viewMode: {},
  filterType: null,
  filterPriority: null,
  filterAssignee: null,
  filterMilestone: null,
  filterOwner: null,
  quickAddOpen: false,

  setSelectedApp: (id) => set({ selectedAppId: id, selectedItemId: null }),
  setSelectedItem: (id) => set({ selectedItemId: id }),
  setViewMode: (appId, mode) => set((s) => ({ viewMode: { ...s.viewMode, [appId]: mode } })),
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
