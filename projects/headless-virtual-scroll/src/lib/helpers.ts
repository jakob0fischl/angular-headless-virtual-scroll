import {effect, signal, Signal} from '@angular/core';
import {Area} from './area';

export function visiblePartOfContainerWithPadding(
  container: Signal<HTMLElement>,
  padding: number,
): Signal<Area> {
  const visiblePartOfContainer = signal<Area>({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  effect((onCleanup) => {
    // TODO intersection observer does not update when the viewport is resized. Should register a separate ResizeObserver for that
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];

      const containerRect = container().getBoundingClientRect();
      visiblePartOfContainer.set({
        top: entry.intersectionRect.top - containerRect.top,
        left: entry.intersectionRect.left - containerRect.left,
        right: entry.intersectionRect.right - containerRect.left,
        bottom: entry.intersectionRect.bottom - containerRect.top,
      });
    }, {
      root: null, // browser viewport
      rootMargin: `${padding.toString(10)}px`,
    });

    observer.observe(container());
    onCleanup(() => {
      observer.disconnect();
    });
  });

  return visiblePartOfContainer;
}

export function currentScrollOffset(
  container: Signal<HTMLElement>,
): Signal<{
  top: number;
  left: number;
}> {
  const scrollOffset = signal<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });

  effect((onCleanup) => {
    const element = container();
    const listener = () => {
      scrollOffset.set({
        top: element.scrollTop,
        left: element.scrollLeft,
      });
    };
    element.addEventListener('scroll', listener);
    onCleanup(() => {
      element.removeEventListener('scroll', listener);
    });
  });

  return scrollOffset;
}
