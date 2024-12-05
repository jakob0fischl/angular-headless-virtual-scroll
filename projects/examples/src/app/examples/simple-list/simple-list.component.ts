import {Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {createSimpleVirtualScroll, simpleFlexLayout} from '../../../../../headless-virtual-scroll/src/public-api';

@Component({
  selector: 'app-simple-list',
  imports: [],
  templateUrl: './simple-list.component.html',
})
export class SimpleListComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly virtualScroll = createSimpleVirtualScroll<number>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    content: signal(Array.from({ length: 10000000 }).fill(0).map((_, i) => i)),
    itemPlacementStrategy: simpleFlexLayout('column', 100, 100, 8),
    cacheExtent: 1000,
  });
}
