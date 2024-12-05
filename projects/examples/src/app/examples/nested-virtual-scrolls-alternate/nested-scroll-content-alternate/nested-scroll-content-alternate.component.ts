import {ChangeDetectionStrategy, Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {
  createSimpleVirtualScroll,
  simpleFlexLayout,
} from '../../../../../../headless-virtual-scroll/src/lib/simple-virtual-scroll';

export const NESTED_ELEMENT_COUNT = 100;

@Component({
  selector: 'app-nested-scroll-content-alternate',
  imports: [],
  templateUrl: './nested-scroll-content-alternate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NestedScrollContentAlternateComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly virtualScroll = createSimpleVirtualScroll<number>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    content: signal(Array.from({ length: NESTED_ELEMENT_COUNT }).fill(0).map((_, i) => i)),
    itemPlacementStrategy: simpleFlexLayout('column', 100, 100, 8),
    cacheExtent: 1000,
  });
}
