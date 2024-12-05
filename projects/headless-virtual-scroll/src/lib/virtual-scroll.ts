import {computed, Signal} from '@angular/core';
import {currentScrollOffset, visiblePartOfContainerWithPadding} from './helpers';
import type {Area} from './area';

interface PlacementStrategy<T> {
  setup(areaToRender: Signal<Area>): VirtualScroll<T>;
}

export interface VirtualScrollConfig<T> {
  scrollContainer: Signal<HTMLElement>;
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

  const areaToRender = computed(() => {
    const visiblePartValue = visiblePart();
    return {
      top: visiblePartValue.top - config.cacheExtent,
      left: visiblePartValue.left - config.cacheExtent,
      right: visiblePartValue.right + config.cacheExtent,
      bottom: visiblePartValue.bottom + config.cacheExtent,
    };
  });

  return config.itemPlacementStrategy.setup(areaToRender);
}
