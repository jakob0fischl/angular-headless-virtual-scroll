import {computed, Signal} from '@angular/core';
import {visiblePartOfContainerWithPadding} from './container-visibility-info';
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

export type VirtualScrollWithTransform<T> = VirtualScroll<T> & {
  transform: Signal<string>;
};

export function createVirtualScroll<T>(config: VirtualScrollConfig<T>): VirtualScrollWithTransform<T> {
  const containerVisibilityInfo = visiblePartOfContainerWithPadding(config.scrollContainer, config.cacheExtent);

  const areaToRender = computed(() => {
    const {
      visiblePartOfContainer,
      scrollOffsetInsideContainer,
    } = containerVisibilityInfo();
    return {
      top: visiblePartOfContainer.top + scrollOffsetInsideContainer.top - config.cacheExtent,
      left: visiblePartOfContainer.left + scrollOffsetInsideContainer.left - config.cacheExtent,
      right: visiblePartOfContainer.right + scrollOffsetInsideContainer.left + config.cacheExtent,
      bottom: visiblePartOfContainer.bottom + scrollOffsetInsideContainer.top + config.cacheExtent,
    };
  });

  const result = config.itemPlacementStrategy.setup(areaToRender);
  return {
    ...result,
    transform: computed(() => {
      return `translate(${result.viewportOffset().left}px, ${result.viewportOffset().top}px)`;
    }),
  };
}
