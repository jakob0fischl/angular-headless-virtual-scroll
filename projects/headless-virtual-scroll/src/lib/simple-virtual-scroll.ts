import {computed, Signal} from '@angular/core';
import {createVirtualScroll, VirtualScrollWithTransform} from './virtual-scroll';
import {Area, overlaps} from './area';

interface SimplePlacementStrategy<T> {
  calculateTotalSize(allItems: T[], itemPlacements: Area[]): {
    width: number;
    height: number;
  };
  calculateItemInformation(item: T, index: number, previousItemPlacements: Area[]): Area;
  calculateRequiredOffset(allItems: T[], isVisible: boolean[], itemPlacements: Area[]): {
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
          const isVisible = new Array(contentValue.length).fill(false);
          // TODO under some conditions this can be optimized using a binary search
          //    - the visible section must be contiguous
          //    - the array must be sorted
          for (let i = 0; i < contentValue.length; i++) {
            const itemPlacement = itemPlacementsValue[i];
            if (overlaps(itemPlacement, activeAreaValue)) {
              result.push(contentValue[i]);
              isVisible[i] = true;
            }
          }
          return {
            visibleElements: result,
            isVisible,
          };
        });

        const viewportOffset = computed(() =>
          config.itemPlacementStrategy.calculateRequiredOffset(config.content(), visibilityInfo().isVisible, itemPlacements()),
        );

        return {
          totalSize: computed(() => config.itemPlacementStrategy.calculateTotalSize(config.content(), itemPlacements())),
          elementsToRender: computed(() => visibilityInfo().visibleElements),
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
      calculateRequiredOffset(allItems, isVisible) {
        for (let i = 0; i < allItems.length; i++) {
          if (isVisible[i])
            return {
              top: 0,
              left: i * totalWidth,
            };
        }
        return {
          top: 0,
          left: 0,
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
      calculateRequiredOffset(allItems, isVisible) {
        for (let i = 0; i < allItems.length; i++) {
          if (isVisible[i])
            return {
              top: i * totalHeight,
              left: 0,
            };
        }
        return {
          top: 0,
          left: 0,
        };
      },
    };
  }
}
