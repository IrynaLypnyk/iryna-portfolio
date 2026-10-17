'use client';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
export const editorTabs = ['General', 'Content', 'Media', 'Settings'] as const;
export type EditorTab = (typeof editorTabs)[number];
export function useEditorTabs() {
  const [tab, setTab] = useState<EditorTab>('General');
  const id = useId();
  function reveal(control: HTMLElement | null) {
    const panel = control?.closest<HTMLElement>('[data-editor-tab]');
    if (panel) flushSync(() => setTab(panel.dataset.editorTab as EditorTab));
    const details = control?.closest('details');
    if (details) details.open = true;
    control?.focus();
  }
  return { tab, setTab, id, reveal };
}
type Tabs = ReturnType<typeof useEditorTabs>;
export function EditorTabs({ tabs }: { tabs: Tabs }) {
  const [vertical, setVertical] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const breakpoint = window.matchMedia('(min-width: 1024px)');
    const updateOrientation = () => setVertical(breakpoint.matches);
    updateOrientation();
    breakpoint.addEventListener('change', updateOrientation);
    const header = document.querySelector('header[data-component="Header"]');
    const observer = new ResizeObserver(() =>
      setHeaderHeight(header?.getBoundingClientRect().height ?? 0)
    );
    if (header) {
      observer.observe(header);
    }
    return () => {
      breakpoint.removeEventListener('change', updateOrientation);
      observer.disconnect();
    };
  }, []);
  return (
    <div
      role="tablist"
      aria-label="Editor sections"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      style={{ top: headerHeight }}
      className="sticky z-10 flex gap-1 self-start overflow-x-auto border-b border-neutral-200 bg-white py-2 lg:flex-col lg:overflow-visible lg:border-b-0"
    >
      {editorTabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={`${tabs.id}-${tab}-tab`}
          aria-controls={`${tabs.id}-${tab}-panel`}
          aria-selected={tabs.tab === tab}
          tabIndex={tabs.tab === tab ? 0 : -1}
          onClick={() => tabs.setTab(tab)}
          onKeyDown={(event) => {
            const next =
              event.key === (vertical ? 'ArrowDown' : 'ArrowRight')
                ? (index + 1) % 4
                : event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')
                  ? (index + 3) % 4
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? 3
                      : -1;
            if (next < 0) return;
            event.preventDefault();
            tabs.setTab(editorTabs[next]);
            document.getElementById(`${tabs.id}-${editorTabs[next]}-tab`)?.focus();
          }}
          className={`flex-1 shrink-0 rounded-sm border-b-2 px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 lg:flex-none lg:border-b-0 lg:border-l-2 ${tabs.tab === tab ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-transparent text-neutral-600 hover:bg-neutral-50'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
export function EditorPanel({
  tabs,
  name,
  children,
}: {
  tabs: Tabs;
  name: EditorTab;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`${tabs.id}-${name}-panel`}
      aria-labelledby={`${tabs.id}-${name}-tab`}
      data-editor-tab={name}
      hidden={tabs.tab !== name}
      className="space-y-6"
    >
      {children}
    </div>
  );
}
