import {Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {
  createSimpleVirtualScroll,
  simpleFlexLayout,
} from '../../../../../../headless-virtual-scroll/src/lib/simple-virtual-scroll';

@Component({
  selector: 'app-nested-scroll-content',
  imports: [],
  templateUrl: './nested-scroll-content.component.html',
})
export class NestedScrollContentComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly virtualScroll = createSimpleVirtualScroll<number>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    content: signal(Array.from({ length: 100000 }).fill(0).map((_, i) => i)),
    itemPlacementStrategy: simpleFlexLayout('row', 100, 100, 8),
    cacheExtent: 1000,
  });
}
