import {computed, Signal} from '@angular/core';
import {createVirtualScroll, VirtualScrollWithTransform} from './virtual-scroll';
import {Area} from './area';

interface SimplePlacementStrategy<T> {
  calculateTotalSize(allItems: T[], itemPlacements: Area[]): {
    width: number;
    height: number;
  };
  calculateItemInformation(item: T, index: number, previousItemPlacements: Area[]): Area;
}

export interface SimpleVirtualScrollConfig<T> {
  scrollContainer: Signal<HTMLElement>;
  content: Signal<T[]>;
  itemPlacementStrategy: SimplePlacementStrategy<T>;
  cacheExtent: number;
}

export function createSimpleVirtualScroll<T>(config: SimpleVirtualScrollConfig<T>): VirtualScrollWithTransform<T> {
  const itemPlacements = computed(() => {
    const result: Area[] = [];
    const contentArray = config.content()
    for (let i = 0; i < contentArray.length; i++) {
      const item = contentArray[i];
      result.push(config.itemPlacementStrategy.calculateItemInformation(item, i, result));
    }
    return result;
  });

  return createVirtualScroll({
    scrollContainer: config.scrollContainer,
    itemPlacementStrategy: {
      setup(areaToRender: Signal<Area>) {

        const visibilityInfo = computed(() => {
          const activeAreaValue = areaToRender();
          const contentValue = config.content();
          const itemPlacementsValue = itemPlacements();
          // With millions of elements this becomes performance critical
          const result: T[] = [];

          let minVisibleLeft = Number.MAX_SAFE_INTEGER;
          let minVisibleTop = Number.MAX_SAFE_INTEGER;
          // TODO under some conditions this can be optimized using a binary search
          //    - the visible section must be contiguous
          //    - the array must be sorted
          for (let i = 0; i < contentValue.length; i++) {
            const itemPlacement = itemPlacementsValue[i];
            if (
              itemPlacement.top <= activeAreaValue.bottom &&
              itemPlacement.bottom >= activeAreaValue.top &&
              itemPlacement.left <= activeAreaValue.right &&
              itemPlacement.right >= activeAreaValue.left
            ) {
              result.push(contentValue[i]);
              if (itemPlacement.left < minVisibleLeft)
                minVisibleLeft = itemPlacement.left;
              if (itemPlacement.top < minVisibleTop)
                minVisibleTop = itemPlacement.top;
            }
          }

          return {
            visibleElements: result,
            viewportOffset: {
              left: minVisibleLeft === Number.MAX_SAFE_INTEGER ? 0 : minVisibleLeft,
              top: minVisibleTop === Number.MAX_SAFE_INTEGER ? 0 : minVisibleTop,
            },
          };
        });

        return {
          totalSize: computed(() => config.itemPlacementStrategy.calculateTotalSize(config.content(), itemPlacements())),
          elementsToRender: computed(() => visibilityInfo().visibleElements),
          viewportOffset: computed(() => visibilityInfo().viewportOffset),
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
    };
  }
}
