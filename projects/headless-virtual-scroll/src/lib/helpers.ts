import {effect, signal, Signal} from '@angular/core';

export function visiblePartOfContainerWithPadding(
  container: Signal<HTMLElement>,
  padding: number,
): Signal<Area> {
  // TODO I think this is currently not relative to the container, but to the viewport
  const visiblePartOfContainer = signal<Area>({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  effect((onCleanup) => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.length !== 1) {
        console.warn('IntersectionObserver should only return one entry');
        return;
      }

      const entry = entries[0];
      visiblePartOfContainer.set({
        top: entry.intersectionRect.top,
        left: entry.intersectionRect.left,
        right: entry.intersectionRect.right,
        bottom: entry.intersectionRect.bottom,
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
