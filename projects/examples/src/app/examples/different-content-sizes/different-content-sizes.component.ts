import {ChangeDetectionStrategy, Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {createSimpleVirtualScroll} from '../../../../../headless-virtual-scroll/src/lib/simple-virtual-scroll';

@Component({
  selector: 'app-different-content-sizes',
  imports: [],
  templateUrl: './different-content-sizes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifferentContentSizesComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly virtualScroll = createSimpleVirtualScroll<number>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    content: signal(Array.from({ length: 10000 }).fill(0).map((_, i) => 10 * (i % 10 + 1))),
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
    },
    cacheExtent: 1000,
  });
}
