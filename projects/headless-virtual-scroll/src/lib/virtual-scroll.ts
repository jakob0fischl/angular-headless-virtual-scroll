import {computed, effect, signal, Signal} from '@angular/core';

interface ElementPlacement {
  top: number;
  left: number;
  right: number;
  bottom: number;
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
      right: visiblePartOfContainerValue.right + scrollOffsetValue.left,
      bottom: visiblePartOfContainerValue.bottom + scrollOffsetValue.top,
    };
  });

  const activeArea = computed(() => {
    const visiblePartValue = visiblePart();
    return {
      top: visiblePartValue.top - config.cacheExtent,
      left: visiblePartValue.left - config.cacheExtent,
      right: visiblePartValue.right + config.cacheExtent,
      bottom: visiblePartValue.bottom + config.cacheExtent,
    };
  });

  const itemPlacements = computed(() =>
    config.content().map(item => config.itemPlacementStrategy.calculateItemInformation(item))
  );

  const visibleElements = computed(() => {
    const activeAreaValue = activeArea();
    const contentValue = config.content();
    const itemPlacementsValue = itemPlacements();
    // With millions of elements this becomes performance critical
    const result: T[] = [];
    for (let i = 0; i < contentValue.length; i++) {
      const itemPlacement = itemPlacementsValue[i];
      if (
        itemPlacement.top >= activeAreaValue.top &&
        itemPlacement.bottom <= activeAreaValue.bottom &&
        itemPlacement.right <= activeAreaValue.right &&
        itemPlacement.left >= activeAreaValue.left
      ) {
        result.push(contentValue[i]);
      }
    }
    return result;
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
    // TODO way to provide a default initial value?
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
    // TODO way to provide a default initial value?
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
