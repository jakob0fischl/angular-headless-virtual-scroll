import {ChangeDetectionStrategy, Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {
  NESTED_ELEMENT_COUNT,
  NestedScrollContentAlternateComponent,
} from './nested-scroll-content-alternate/nested-scroll-content-alternate.component';
import {
  createSimpleVirtualScroll,
  simpleFlexLayout,
} from '../../../../../headless-virtual-scroll/src/lib/simple-virtual-scroll';

@Component({
  selector: 'app-nested-virtual-scrolls-alternate',
  imports: [
    NestedScrollContentAlternateComponent,
  ],
  templateUrl: './nested-virtual-scrolls-alternate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NestedVirtualScrollsAlternateComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly virtualScroll = createSimpleVirtualScroll<number>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    content: signal(Array.from({ length: 10 }).fill(0).map((_, i) => i)),
    itemPlacementStrategy: simpleFlexLayout('column', 100, NESTED_ELEMENT_COUNT * 108, 8),
    cacheExtent: 1000,
  });
}
