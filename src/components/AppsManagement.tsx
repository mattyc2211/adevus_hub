import { useState } from 'react';
import { useApps, useCreateApp, useUpdateApp } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Archive, RotateCcw, ChevronDown, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppStatus = Database['public']['Enums']['app_status'];

const PRESET_COLORS = ['#0066FF', '#FF4F4F', '#00C853', '#FFB300', '#9C27B0', '#FF6D00', '#00BCD4', '#E91E63'];

export function AppsManagement() {
  const { data: apps = [] } = useApps();
  const createApp = useCreateApp();
  const updateApp = useUpdateApp();
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorTag, setColorTag] = useState(PRESET_COLORS[0]);
  const [prompts, setPrompts] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ appId: string; field: 'prompts' | 'documentation' } | null>(null);
  const [fieldValue, setFieldValue] = useState('');

  const activeApps = apps.filter((a) => a.status !== 'Archived');
  const archivedApps = apps.filter((a) => a.status === 'Archived');

  const resetForm = () => {
    setName(''); setDescription(''); setColorTag(PRESET_COLORS[0]); setPrompts(''); setDocumentation('');
    setShowForm(false); setEditingId(null);
  };

  const startEdit = (app: typeof apps[0]) => {
    setEditingId(app.id);
    setName(app.name);
    setDescription(app.description);
    setColorTag(app.color_tag);
    setPrompts((app as any).prompts || '');
    setDocumentation((app as any).documentation || '');
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editingId) {
      updateApp.mutate({ id: editingId, name: name.trim(), description: description.trim(), color_tag: colorTag, prompts: prompts.trim(), documentation: documentation.trim() } as any);
    } else {
      createApp.mutate({ name: name.trim(), description: description.trim(), color_tag: colorTag, prompts: prompts.trim(), documentation: documentation.trim() } as any);
    }
    resetForm();
  };

  const handleArchive = (appId: string, currentStatus: AppStatus) => {
    updateApp.mutate({ id: appId, status: currentStatus === 'Archived' ? 'Active' : 'Archived' });
  };

  const startFieldEdit = (appId: string, field: 'prompts' | 'documentation', currentValue: string) => {
    setEditingField({ appId, field });
    setFieldValue(currentValue || '');
  };

  const saveField = () => {
    if (!editingField) return;
    updateApp.mutate({ id: editingField.appId, [editingField.field]: fieldValue.trim() } as any);
    setEditingField(null);
    setFieldValue('');
  };

  const cancelFieldEdit = () => {
    setEditingField(null);
    setFieldValue('');
  };

  const toggleExpand = (appId: string) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
    if (editingField) cancelFieldEdit();
  };

  // Non-admin view with read-only prompts/docs
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-3xl">
        <h1 className="text-base font-semibold text-foreground mb-1">Apps</h1>
        <p className="text-xs text-muted-foreground mb-6">You need admin access to manage apps.</p>
        <div className="space-y-2">
          {activeApps.map((app) => {
            const isExpanded = expandedAppId === app.id;
            const appData = app as any;
            const hasContent = appData.prompts || appData.documentation;
            return (
              <div key={app.id} className="rounded bg-card card-shadow overflow-hidden">
                <button onClick={() => hasContent && toggleExpand(app.id)} className={cn("w-full flex items-center gap-3 px-4 py-3 text-left", hasContent && "cursor-pointer hover:bg-muted/30 transition-colors")}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: app.color_tag }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{app.name}</p>
                    {app.description && <p className="text-xs text-muted-foreground mt-0.5">{app.description}</p>}
                  </div>
                  {hasContent && (isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />)}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
                    {appData.prompts && <DocSection icon={<Sparkles className="w-3.5 h-3.5" />} label="AI Prompts" content={appData.prompts} />}
                    {appData.documentation && <DocSection icon={<BookOpen className="w-3.5 h-3.5" />} label="Documentation" content={appData.documentation} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold text-foreground">Products</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create and manage your products.</p>
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> New App
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-card rounded p-5 card-shadow mb-6 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">{editingId ? 'Edit App' : 'Create New App'}</h3>
          <div className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="App name" autoFocus className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Colour Tag</p>
              <div className="flex gap-2">
                {PRESET_COLORS.map((c) => (
                  <button key={c} onClick={() => setColorTag(c)} className={cn('w-7 h-7 rounded-full transition-transform', colorTag === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105')} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> AI Prompts
              </label>
              <textarea value={prompts} onChange={(e) => setPrompts(e.target.value)} placeholder="Paste the prompts used to create this app with AI..." rows={4} className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-y" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Documentation
              </label>
              <textarea value={documentation} onChange={(e) => setDocumentation(e.target.value)} placeholder="Architecture notes, setup instructions, key decisions..." rows={4} className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-y" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSubmit} disabled={createApp.isPending || updateApp.isPending} className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {editingId ? 'Save Changes' : 'Create App'}
              </button>
              <button onClick={resetForm} className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Active Apps */}
      <div className="space-y-2">
        {activeApps.map((app) => {
          const isExpanded = expandedAppId === app.id;
          const appData = app as any;
          return (
            <div key={app.id} className="rounded bg-card card-shadow overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 group">
                <button onClick={() => toggleExpand(app.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: app.color_tag }} />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(app.id)}>
                  <p className="text-sm font-medium text-foreground">{app.name}</p>
                  {app.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{app.description}</p>}
                </div>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', app.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>{app.status}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(app)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleArchive(app.id, app.status)} className="p-1.5 rounded-md text-muted-foreground hover:text-coral hover:bg-coral/10 transition-colors" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-border pt-3 ml-7">
                  {/* AI Prompts */}
                  <EditableDocSection
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    label="AI Prompts"
                    content={appData.prompts || ''}
                    placeholder="Paste the prompts used to create this app..."
                    isEditing={editingField?.appId === app.id && editingField.field === 'prompts'}
                    editValue={fieldValue}
                    onEditChange={setFieldValue}
                    onStartEdit={() => startFieldEdit(app.id, 'prompts', appData.prompts || '')}
                    onSave={saveField}
                    onCancel={cancelFieldEdit}
                  />
                  {/* Documentation */}
                  <EditableDocSection
                    icon={<BookOpen className="w-3.5 h-3.5" />}
                    label="Documentation"
                    content={appData.documentation || ''}
                    placeholder="Architecture notes, setup instructions, key decisions..."
                    isEditing={editingField?.appId === app.id && editingField.field === 'documentation'}
                    editValue={fieldValue}
                    onEditChange={setFieldValue}
                    onStartEdit={() => startFieldEdit(app.id, 'documentation', appData.documentation || '')}
                    onSave={saveField}
                    onCancel={cancelFieldEdit}
                  />
                </div>
              )}
            </div>
          );
        })}
        {activeApps.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-foreground mb-1">No apps yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first app to start tracking work.</p>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">Create First App</button>
          </div>
        )}
      </div>

      {/* Archived */}
      {archivedApps.length > 0 && (
        <div className="mt-8">
          <button onClick={() => setShowArchived(!showArchived)} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
            {showArchived ? 'Hide' : 'Show'} Archived ({archivedApps.length})
          </button>
          {showArchived && (
            <div className="space-y-2 mt-3">
              {archivedApps.map((app) => (
                <div key={app.id} className="flex items-center gap-3 px-4 py-3 rounded bg-muted/30 group">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 opacity-40" style={{ backgroundColor: app.color_tag }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{app.name}</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">Archived</span>
                  <button onClick={() => handleArchive(app.id, app.status)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all" title="Restore"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DocSection({ icon, label, content }: { icon: React.ReactNode; label: string; content: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">{icon} {label}</p>
      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded p-3">{content}</div>
    </div>
  );
}

function EditableDocSection({ icon, label, content, placeholder, isEditing, editValue, onEditChange, onStartEdit, onSave, onCancel }: {
  icon: React.ReactNode; label: string; content: string; placeholder: string;
  isEditing: boolean; editValue: string; onEditChange: (v: string) => void;
  onStartEdit: () => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">{icon} {label}</p>
        {!isEditing && (
          <button onClick={onStartEdit} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            {content ? 'Edit' : 'Add'}
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea value={editValue} onChange={(e) => onEditChange(e.target.value)} placeholder={placeholder} rows={5} autoFocus className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-y" />
          <div className="flex gap-2">
            <button onClick={onSave} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">Save</button>
            <button onClick={onCancel} className="px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      ) : content ? (
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded p-3">{content}</div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No {label.toLowerCase()} added yet.</p>
      )}
    </div>
  );
}
