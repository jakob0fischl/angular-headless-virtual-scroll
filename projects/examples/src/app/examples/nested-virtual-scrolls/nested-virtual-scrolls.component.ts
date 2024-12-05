import {ChangeDetectionStrategy, Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {
  NestedScrollContentComponent,
  PRE_ALLOCATED_ARRAY,
} from './nested-scroll-content/nested-scroll-content.component';
import {
  createSimpleVirtualScroll,
  simpleFlexLayout,
} from '../../../../../headless-virtual-scroll/src/lib/simple-virtual-scroll';

@Component({
  selector: 'app-nested-virtual-scrolls',
  imports: [
    NestedScrollContentComponent,
  ],
  templateUrl: './nested-virtual-scrolls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NestedVirtualScrollsComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly virtualScroll = createSimpleVirtualScroll<number>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    content: signal(PRE_ALLOCATED_ARRAY),
    itemPlacementStrategy: simpleFlexLayout('column', 100, 100, 8),
    cacheExtent: 1000,
  });
}
