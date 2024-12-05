import {computed, Signal} from '@angular/core';
import {currentScrollOffset, visiblePartOfContainerWithPadding} from './helpers';
import {createVirtualScroll, VirtualScroll} from './virtual-scroll';

interface SimplePlacementStrategy<T> {
  calculateTotalSize(allItems: T[]): {
    width: number;
    height: number;
  };
  calculateItemInformation(item: T): Area;
  calculateRequiredOffset(visibleItems: T[], allItems: T[]): {
    top: number;
    left: number;
  };
}

export interface SimpleVirtualScrollConfig<T> {
  scrollContainer: Signal<HTMLElement>;
  content: Signal<T[]>;
  itemPlacementStrategy: SimplePlacementStrategy<T>;
  cacheExtent: number;
}

export function createSimpleVirtualScroll<T>(config: SimpleVirtualScrollConfig<T>): VirtualScroll<T> {
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

  return createVirtualScroll({
    scrollContainer: config.scrollContainer,
    content: config.content,
    itemPlacementStrategy: {
      setup(areaToRender: Signal<Area>): VirtualScroll<T> {
        return {
          totalSize: computed(() => config.itemPlacementStrategy.calculateTotalSize(config.content())),
          elementsToRender: visibleElements,
          viewportOffset: computed(() =>
            config.itemPlacementStrategy.calculateRequiredOffset(visibleElements(), config.content()),
          ),
        };
      }
    },
    cacheExtent: config.cacheExtent,
  });
}
