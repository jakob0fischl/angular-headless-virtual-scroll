import {effect, signal, Signal} from '@angular/core';
import {Area} from './area';

interface ContainerVisibilityInfo {
  visiblePartOfContainer: Area;
  scrollOffsetInsideContainer: {
    top: number;
    left: number;
  };
}

export function visiblePartOfContainerWithPadding(
  container: Signal<HTMLElement>,
  padding: number,
): Signal<ContainerVisibilityInfo> {
  const visiblePartOfContainer = signal<ContainerVisibilityInfo>({
    scrollOffsetInsideContainer: {
      top: 0,
      left: 0,
    },
    visiblePartOfContainer: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  }, {
    equal: (a, b) => a.visiblePartOfContainer.top === b.visiblePartOfContainer.top &&
      a.visiblePartOfContainer.left === b.visiblePartOfContainer.left &&
      a.visiblePartOfContainer.right === b.visiblePartOfContainer.right &&
      a.visiblePartOfContainer.bottom === b.visiblePartOfContainer.bottom &&
      a.scrollOffsetInsideContainer.top === b.scrollOffsetInsideContainer.top &&
      a.scrollOffsetInsideContainer.left === b.scrollOffsetInsideContainer.left,
  });

  effect((onCleanup) => {
    // TODO intersection observer does not update when the viewport is resized. Should register a separate ResizeObserver for that
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];

      const containerValue = container();
      const containerRect = containerValue.getBoundingClientRect();
      visiblePartOfContainer.set({
        visiblePartOfContainer: {
          top: entry.intersectionRect.top - containerRect.top,
          left: entry.intersectionRect.left - containerRect.left,
          right: entry.intersectionRect.right - containerRect.left,
          bottom: entry.intersectionRect.bottom - containerRect.top,
        },
        scrollOffsetInsideContainer: {
          top: containerValue.scrollTop,
          left: containerValue.scrollLeft,
        }
      });
    }, {
      root: null, // browser viewport
      rootMargin: `${padding.toString(10)}px`,
    });

    /**
     * this is needed as the intersection observer does not rerun after the first intersection
     */
    const scroll = () => {
      observer.disconnect();
      observer.observe(container());
      // update offset immediately for faster updates of visible elements
      visiblePartOfContainer.update(it => {
        return {
          ...it,
          scrollOffsetInsideContainer: {
            top: container().scrollTop,
            left: container().scrollLeft,
          },
        };
      });
    };
    document.addEventListener('scroll', scroll, {
      passive: true,
      capture: true,
    });

    observer.observe(container());
    onCleanup(() => {
      observer.disconnect();
      document.removeEventListener('scroll', scroll);
    });
  });

  return visiblePartOfContainer;
}
