import {computed, effect, signal, Signal} from '@angular/core';

interface ElementPlacement {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface PlacementStrategy<T> {
  calculateTotalSize(allItems: T[]): {
    width: number;
    height: number;
  };
  calculateItemInformation(item: T): ElementPlacement;
  calculateRequiredOffset(visibleItems: T[], allItems: T[]): {
    top: number;
    left: number;
  };
}

export interface VirtualScrollConfig<T> {
  scrollContainer: Signal<HTMLElement>;
  content: Signal<T[]>;
  itemPlacementStrategy: PlacementStrategy<T>;
  cacheExtent: number;
}

export interface VirtualScroll<T> {
  elementsToRender: Signal<T[]>;
  viewportOffset: Signal<{
    top: number;
    left: number;
  }>;
  totalSize: Signal<{
    width: number;
    height: number;
  }>;
}

export function createVirtualScroll<T>(config: VirtualScrollConfig<T>): VirtualScroll<T> {
  const visiblePartOfContainer = visiblePartOfContainerWithPadding(config.scrollContainer, config.cacheExtent);
  const scrollOffset = currentScrollOffset(config.scrollContainer);

  const visiblePart = computed(() => {
    const visiblePartOfContainerValue = visiblePartOfContainer();
    const scrollOffsetValue = scrollOffset();
    return {
      top: visiblePartOfContainerValue.top + scrollOffsetValue.top,
      left: visiblePartOfContainerValue.left + scrollOffsetValue.left,
      width: visiblePartOfContainerValue.width,
      height: visiblePartOfContainerValue.height,
    };
  });

  const activeArea = computed(() => {
    const visiblePartValue = visiblePart();
    return {
      top: visiblePartValue.top - config.cacheExtent,
      left: visiblePartValue.left - config.cacheExtent,
      width: visiblePartValue.width + config.cacheExtent * 2,
      height: visiblePartValue.height + config.cacheExtent * 2,
    };
  });

  const visibleElements = computed(() => {
    const visiblePartValue = visiblePart();
    const contentValue = config.content();
    return contentValue.filter((item) => {
      const itemPlacement = config.itemPlacementStrategy.calculateItemInformation(item);
      return (
        itemPlacement.top >= visiblePartValue.top &&
        itemPlacement.top + itemPlacement.height <= visiblePartValue.top + visiblePartValue.height &&
        itemPlacement.left >= visiblePartValue.left &&
        itemPlacement.left + itemPlacement.width <= visiblePartValue.left + visiblePartValue.width
      );
    });
  });

  return {
    totalSize: computed(() => config.itemPlacementStrategy.calculateTotalSize(config.content())),
    elementsToRender: visibleElements,
    viewportOffset: computed(() =>
      config.itemPlacementStrategy.calculateRequiredOffset(visibleElements(), config.content()),
    ),
  };
}

function visiblePartOfContainerWithPadding(
  container: Signal<HTMLElement>,
  padding: number,
): Signal<ElementPlacement> {
  // TODO I think this is currently not relative to the container, but to the viewport
  const visiblePartOfContainer = signal<ElementPlacement>({
    top: 0,
    left: 0,
    width: container().clientWidth,
    height: container().clientHeight,
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
        width: entry.intersectionRect.width,
        height: entry.intersectionRect.height,
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

function currentScrollOffset(
  container: Signal<HTMLElement>,
): Signal<{
  top: number;
  left: number;
}> {
  const scrollOffset = signal<{
    top: number;
    left: number;
  }>({
    top: container().scrollTop,
    left: container().scrollLeft,
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
