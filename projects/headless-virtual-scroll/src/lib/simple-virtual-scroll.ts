import {computed, Signal} from '@angular/core';
import {createVirtualScroll, VirtualScroll} from './virtual-scroll';
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

export function createSimpleVirtualScroll<T>(config: SimpleVirtualScrollConfig<T>): VirtualScroll<T> {
  const itemPlacements = computed(() =>
    config.content().map(item => config.itemPlacementStrategy.calculateItemInformation(item))
  );

  return createVirtualScroll({
    scrollContainer: config.scrollContainer,
    itemPlacementStrategy: {
      setup(areaToRender: Signal<Area>): VirtualScroll<T> {

        const visibleElements = computed(() => {
          const activeAreaValue = areaToRender();
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
    },
    cacheExtent: config.cacheExtent,
  });
}
