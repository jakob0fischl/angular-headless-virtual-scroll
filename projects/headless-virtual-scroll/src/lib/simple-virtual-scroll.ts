import {computed, Signal} from '@angular/core';
import {createVirtualScroll, VirtualScrollWithTransform} from './virtual-scroll';
import {Area, overlaps} from './area';

interface SimplePlacementStrategy<T> {
  calculateTotalSize(allItems: T[]): {
    width: number;
    height: number;
  };
  calculateItemInformation(item: T, index: number): Area;
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
    config.content().map(((item, index) => config.itemPlacementStrategy.calculateItemInformation(item, index)))
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
            if (overlaps(itemPlacement, activeAreaValue)) {
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


/**
 * does not support flex-wrap
 */
export function simpleFlexLayout<T>(
  direction: 'row' | 'column',
  itemWidth: number,
  itemHeight: number,
  gap: number,
): SimplePlacementStrategy<T> {
  if (direction === 'row') {
    const totalWidth = itemWidth + gap;
    return {
      calculateTotalSize(allItems) {
        return {
          width: totalWidth * allItems.length,
          height: itemHeight,
        };
      },
      calculateItemInformation(item, index) {
        return {
          top: 0,
          left: index * totalWidth,
          right: (index + 1) * totalWidth,
          bottom: itemHeight,
        };
      },
      calculateRequiredOffset(visibleItems, allItems) {
        const invisibleItems = allItems.indexOf(visibleItems[0]);
        return {
          top: 0,
          left: invisibleItems * totalWidth,
        };
      },
    };
  } else {
    const totalHeight = itemHeight + gap;
    return {
      calculateTotalSize(allItems) {
        return {
          width: itemWidth,
          height: totalHeight * allItems.length,
        };
      },
      calculateItemInformation(item, index) {
        return {
          top: index * totalHeight,
          left: 0,
          right: itemWidth,
          bottom: (index + 1) * totalHeight,
        };
      },
      calculateRequiredOffset(visibleItems, allItems) {
        const invisibleItems = allItems.indexOf(visibleItems[0]);
        return {
          top: invisibleItems * totalHeight,
          left: 0,
        };
      },
    };
  }
}
