'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home, Search, Users, Settings, LayoutTemplate, HelpCircle,
  Plus, FilePlus, FileText, Briefcase, Loader2, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/providers/command-palette-provider';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { useForms } from '@/modules/form/form.queries';
import { getWorkspaceIdFromPath } from '@/components/layout/sidebar';
import { ROUTES } from '@/constants/routes';
import type { LucideIcon } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  group: string;
  keywords?: string;
  onExecute: () => void;
}

// ─── Fuzzy filter ───────────────────────────────────────────

function matchesQuery(label: string, keywords: string, query: string): boolean {
  const q = query.toLowerCase();
  const text = `${label} ${keywords}`.toLowerCase();
  return q.split(/\s+/).every((word) => text.includes(word));
}

// ─── Component ──────────────────────────────────────────────

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const router = useRouter();
  const pathname = usePathname();
  const workspaceId = getWorkspaceIdFromPath(pathname);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ─── Fetch real data ────────────────────────────────────────
  const { data: workspaces } = useWorkspaces();
  const { data: forms, isLoading: formsLoading } = useForms({
    workspaceId: workspaceId ?? '',
  });

  // ─── Build items list ───────────────────────────────────────
  const allItems = useMemo(() => {
    const items: PaletteItem[] = [];

    // Actions (always shown)
    items.push({
      id: 'action-new-form',
      label: 'New form',
      icon: FilePlus,
      group: 'Actions',
      keywords: 'create add form',
      onExecute: () => {
        if (workspaceId) router.push(ROUTES.workspace(workspaceId).NEW_FORM);
        else router.push(ROUTES.WORKSPACES);
      },
    });
    items.push({
      id: 'action-new-workspace',
      label: 'New workspace',
      icon: Plus,
      group: 'Actions',
      keywords: 'create add workspace',
      onExecute: () => router.push(ROUTES.NEW_WORKSPACE),
    });

    // Forms from current workspace
    if (forms && workspaceId) {
      for (const form of forms) {
        items.push({
          id: `form-${form.id}`,
          label: form.title,
          description: form.status === 'DRAFT' ? 'Draft' : form.status === 'PUBLISHED' ? 'Published' : 'Closed',
          icon: FileText,
          group: 'Forms',
          keywords: `${form.title} ${form.slug ?? ''}`,
          onExecute: () => router.push(ROUTES.workspace(workspaceId).form(form.id).EDIT),
        });
      }
    }

    // Workspaces
    if (workspaces) {
      for (const ws of workspaces) {
        items.push({
          id: `ws-${ws.id}`,
          label: ws.name,
          description: ws.role,
          icon: Briefcase,
          group: 'Workspaces',
          keywords: `${ws.name} workspace`,
          onExecute: () => router.push(ROUTES.workspace(ws.id).ROOT),
        });
      }
    }

    // Navigation
    items.push(
      {
        id: 'nav-home',
        label: 'Go to home',
        icon: Home,
        group: 'Navigation',
        keywords: 'home dashboard',
        onExecute: () => {
          if (workspaceId) router.push(ROUTES.workspace(workspaceId).ROOT);
          else router.push(ROUTES.WORKSPACES);
        },
      },
      {
        id: 'nav-templates',
        label: 'Go to templates',
        icon: LayoutTemplate,
        group: 'Navigation',
        keywords: 'templates gallery',
        onExecute: () => router.push(ROUTES.TEMPLATES),
      },
      {
        id: 'nav-settings',
        label: 'Go to settings',
        icon: Settings,
        group: 'Navigation',
        keywords: 'settings preferences',
        onExecute: () => {
          if (workspaceId) router.push(ROUTES.workspace(workspaceId).SETTINGS);
          else router.push(ROUTES.SETTINGS);
        },
      },
      {
        id: 'nav-members',
        label: 'Go to members',
        icon: Users,
        group: 'Navigation',
        keywords: 'members team people',
        onExecute: () => {
          if (workspaceId) router.push(ROUTES.workspace(workspaceId).MEMBERS);
          else router.push(ROUTES.MEMBERS);
        },
      },
      {
        id: 'nav-help',
        label: 'Go to help center',
        icon: HelpCircle,
        group: 'Navigation',
        keywords: 'help support docs',
        onExecute: () => router.push(ROUTES.HELP_CENTER),
      },
    );

    return items;
  }, [forms, workspaces, workspaceId, router]);

  // ─── Filter & group ─────────────────────────────────────────
  // Only show forms & workspaces when user is actively searching
  const filtered = query
    ? allItems.filter((item) => matchesQuery(item.label, item.keywords ?? '', query))
    : allItems.filter((item) => item.group === 'Actions' || item.group === 'Navigation');

  const GROUP_ORDER = ['Actions', 'Forms', 'Workspaces', 'Navigation'];

  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of filtered) {
      const existing = map.get(item.group);
      if (existing) existing.push(item);
      else map.set(item.group, [item]);
    }
    return GROUP_ORDER
      .filter((g) => map.has(g))
      .map((g) => ({ label: g, items: map.get(g)! }));
  }, [filtered]);

  const flatItems = groups.flatMap((g) => g.items);

  // ─── Effects ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeItem = useCallback(
    (item: PaletteItem) => {
      close();
      item.onExecute();
    },
    [close],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(flatItems.length, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(flatItems.length, 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatItems[selectedIndex]) executeItem(flatItems[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatItems, executeItem, close]);

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 supports-backdrop-filter:backdrop-blur-xs animate-in fade-in-0 duration-100"
        onClick={close}
      />

      {/* Palette */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 pointer-events-none">
        <div
          className="w-full max-w-lg rounded-xl bg-popover text-popover-foreground ring-1 ring-foreground/10 shadow-lg pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search forms, workspaces, and more..."
              className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            {formsLoading && query && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
            )}
            <button
              type="button"
              onClick={close}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {flatItems.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No results found
              </p>
            )}

            {groups.map((group) => (
              <div key={group.label}>
                <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const itemIndex = flatIndex++;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-selected={isSelected}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isSelected
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground hover:bg-muted',
                      )}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 text-left min-w-0">
                        <span className="truncate block">{item.label}</span>
                      </div>
                      {item.description && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {item.description}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-3 border-t px-4 py-2">
            <span className="text-[11px] text-muted-foreground">
              <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↑↓</kbd> navigate
            </span>
            <span className="text-[11px] text-muted-foreground">
              <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↵</kbd> select
            </span>
            <span className="text-[11px] text-muted-foreground">
              <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
