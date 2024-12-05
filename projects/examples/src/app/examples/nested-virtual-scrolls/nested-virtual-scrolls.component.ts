import {Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {NestedScrollContentComponent} from './nested-scroll-content/nested-scroll-content.component';
import {
  createSimpleVirtualScroll,
  simpleFlexLayout,
} from '../../../../../headless-virtual-scroll/src/lib/simple-virtual-scroll';

// TODO add example where there is one big virtual scroll and other virtual scrolls inside that don't scroll themselves,
//  but react to the visible area of the big one
@Component({
  selector: 'app-nested-virtual-scrolls',
  imports: [
    NestedScrollContentComponent,
  ],
  templateUrl: './nested-virtual-scrolls.component.html',
})
export class NestedVirtualScrollsComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly virtualScroll = createSimpleVirtualScroll<number>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    content: signal(Array.from({ length: 100000 }).fill(0).map((_, i) => i)),
    itemPlacementStrategy: simpleFlexLayout('column', 100, 100, 8),
    cacheExtent: 1000,
  });
}
