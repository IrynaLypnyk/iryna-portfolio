'use client';

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';

const message = 'У вас є незбережені зміни. Залишити сторінку без збереження?';
const historyKey = '__adminHistoryIndex';
const UnsavedChangesContext = createContext<{
  register: (guard: () => boolean) => () => void;
  confirmLeave: () => boolean;
}>({
  register: () => () => {},
  confirmLeave: () => true,
});

/** Persists across admin routes so Back/Forward entries have known positions. */
export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const guards = useRef(new Set<() => boolean>());
  const isDirty = useCallback(() => [...guards.current].some((guard) => guard()), []);
  const register = useCallback((guard: () => boolean) => {
    guards.current.add(guard);
    return () => {
      guards.current.delete(guard);
    };
  }, []);
  const confirmLeave = useCallback(() => !isDirty() || window.confirm(message), [isDirty]);

  useEffect(() => {
    let index: number = window.history.state?.[historyKey] ?? 0;
    let restoring = false;
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.replaceState({ ...window.history.state, [historyKey]: index }, '');

    const push: History['pushState'] = function (this: History, data, unused, url) {
      originalPush.call(this, { ...data, [historyKey]: index + 1 }, unused, url);
      index += 1;
    };
    const replace: History['replaceState'] = function (this: History, data, unused, url) {
      originalReplace.call(this, { ...data, [historyKey]: index }, unused, url);
    };
    window.history.pushState = push;
    window.history.replaceState = replace;

    function onPopState(event: PopStateEvent) {
      if (restoring) {
        restoring = false;
        event.stopImmediatePropagation();
        return;
      }

      const destination = event.state?.[historyKey];
      if (destination === index) return;
      if (!confirmLeave()) {
        // Run before Next's popstate handler so it cannot unmount the form.
        event.stopImmediatePropagation();
        restoring = true;
        window.history.go(typeof destination === 'number' ? index - destination : 1);
      } else {
        index = typeof destination === 'number' ? destination : index - 1;
      }
    }

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self')
      )
        return;
      const destination = new URL(link.href, window.location.href);
      // Document navigations use the browser's beforeunload prompt.
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      )
        return;
      if (!confirmLeave()) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty()) return;
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('popstate', onPopState, true);
    document.addEventListener('click', onClick, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('popstate', onPopState, true);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
      if (window.history.pushState === push) window.history.pushState = originalPush;
      if (window.history.replaceState === replace) window.history.replaceState = originalReplace;
    };
  }, [confirmLeave, isDirty]);

  return (
    <UnsavedChangesContext.Provider value={{ register, confirmLeave }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useConfirmLeave() {
  return useContext(UnsavedChangesContext).confirmLeave;
}

export function useUnsavedChanges(isDirty: boolean) {
  const { register } = useContext(UnsavedChangesContext);
  useEffect(() => register(() => isDirty), [isDirty, register]);
}
