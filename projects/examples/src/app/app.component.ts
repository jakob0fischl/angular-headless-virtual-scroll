import {Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {createSimpleVirtualScroll} from '../../../headless-virtual-scroll/src/lib/simple-virtual-scroll';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  // TODO infinite 2d scroll example
  // TODO list with dynamically sized elements example
  protected readonly virtualScroll = createSimpleVirtualScroll<number>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    content: signal(Array.from({ length: 10000000 }).fill(0).map((_, i) => i)),
    itemPlacementStrategy: {
      calculateTotalSize(allItems) {
        return {
          width: 100,
          height: 108 * allItems.length,
        };
      },
      calculateItemInformation(item) {
        return {
          top: item * 108,
          left: 0,
          right: 108,
          bottom: (item + 1) * 108,
        };
      },
      calculateRequiredOffset(visibleItems, allItems) {
        const invisibleItems = allItems.indexOf(visibleItems[0]);
        return {
          top: invisibleItems * 108,
          left: 0,
        };
      },
    },
    cacheExtent: 1000,
  });

  protected readonly transform = computed(() => {
    return `translate(${this.virtualScroll.viewportOffset().left}px, ${this.virtualScroll.viewportOffset().top}px)`;
  });
}
