import {computed, Signal} from '@angular/core';
import {createVirtualScroll, VirtualScrollWithTransform} from './virtual-scroll';
import {Area} from './area';

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

export function createSimpleVirtualScroll<T>(config: SimpleVirtualScrollConfig<T>): VirtualScrollWithTransform<T> {
  const itemPlacements = computed(() =>
    config.content().map(item => config.itemPlacementStrategy.calculateItemInformation(item))
  );

  return createVirtualScroll({
    scrollContainer: config.scrollContainer,
    itemPlacementStrategy: {
      setup(areaToRender: Signal<Area>) {

        const visibleElements = computed(() => {
          const activeAreaValue = areaToRender();
          const contentValue = config.content();
          const itemPlacementsValue = itemPlacements();
          // With millions of elements this becomes performance critical
          const result: T[] = [];
          // TODO under some conditions this can be optimized using a binary search
          //    - the visible section must be contiguous
          //    - the array must be sorted
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

        const viewportOffset = computed(() =>
          config.itemPlacementStrategy.calculateRequiredOffset(visibleElements(), config.content()),
        );

        return {
          totalSize: computed(() => config.itemPlacementStrategy.calculateTotalSize(config.content())),
          elementsToRender: visibleElements,
          viewportOffset,
        };
      }
    },
    cacheExtent: config.cacheExtent,
  });
}
