import {Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {createSimpleVirtualScroll} from '../../../../../headless-virtual-scroll/src/lib/simple-virtual-scroll';

@Component({
  selector: 'app-different-content-sizes',
  imports: [],
  templateUrl: './different-content-sizes.component.html',
})
export class DifferentContentSizesComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly virtualScroll = createSimpleVirtualScroll<number>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    content: signal(Array.from({ length: 10000 }).fill(0).map((_, i) => 10 * (i % 10 + 1))),
    // TODO this is much simpler than the config for same size elements, we should probably always use this
    itemPlacementStrategy: {
      calculateTotalSize(allItems, itemPlacements) {
        return {
          width: Math.max(...itemPlacements.map(it => it.right)),
          height: itemPlacements[itemPlacements.length - 1].bottom,
        };
      },
      calculateItemInformation(item, index, previousItemSizes) {
        const previousBottom = previousItemSizes[previousItemSizes.length - 1]?.bottom ?? 0;
        const gap = (index === 0 ? 0 : 8);
        return {
          top: previousBottom + gap,
          left: 0,
          right: 100,
          bottom: previousBottom + gap + item,
        };
      },
      calculateRequiredOffset(allItems, isVisible, itemPlacements) {
        for (let i = 0; i < allItems.length; i++) {
          if (isVisible[i])
            return {
              top: itemPlacements[i].top,
              left: 0,
            };
        }
        return {
          top: 0,
          left: 0,
        };
      },
    },
    cacheExtent: 1000,
  });
}
