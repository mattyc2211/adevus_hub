import { useState, useEffect, useRef } from 'react';
import { getInitials, getUserColor } from '@/lib/helpers';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserPickerProps {
  value: string;
  onChange: (v: string) => void;
  profiles: { id: string; name: string; email: string }[];
  label?: string;
  showLabel?: boolean;
}

export function UserPicker({ value, onChange, profiles, label = 'Assignee', showLabel = true }: UserPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = profiles.find((p) => p.name === value);

  return (
    <div ref={ref} className="relative">
      {showLabel && <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 text-sm bg-muted/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary text-left"
      >
        {selected ? (
          <>
            <Avatar className="h-5 w-5 text-[10px]">
              <AvatarFallback style={{ backgroundColor: getUserColor(selected.name), color: 'white', fontSize: '9px' }}>
                {getInitials(selected.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-foreground">{selected.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Select assignee...</span>
        )}
        <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors',
                !value && 'bg-muted/30'
              )}
            >
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] text-muted-foreground">?</div>
              <span className="text-muted-foreground">Unassigned</span>
              {!value && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
            </button>
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { onChange(p.name); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors',
                  value === p.name && 'bg-muted/30'
                )}
              >
                <Avatar className="h-5 w-5 text-[10px]">
                  <AvatarFallback style={{ backgroundColor: getUserColor(p.name), color: 'white', fontSize: '9px' }}>
                    {getInitials(p.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-foreground">{p.name}</span>
                <span className="text-[10px] text-muted-foreground truncate ml-auto">{p.email}</span>
                {value === p.name && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
