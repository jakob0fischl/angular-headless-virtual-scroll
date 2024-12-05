import {Component, signal, viewChild} from '@angular/core';
import {createVirtualScroll} from '../../../headless-virtual-scroll/src/lib/virtual-scroll';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly scrollContainer = viewChild.required('scrollContainer', { read: HTMLElement });

  protected readonly virtualScroll = createVirtualScroll<number>({
    scrollContainer: this.scrollContainer,
    content: signal(Array.from({ length: 100000 }).fill(0).map((_, i) => i)),
    itemPlacementStrategy: {
      calculateTotalSize(allItems) {
        return {
          width: 100,
          height: 100,
        };
      },
      calculateItemInformation(item) {
        return {
          top: item * 108,
          left: 0,
          width: 100,
          height: 100,
        };
      },
      calculateRequiredOffset(visibleItems, allItems) {
        return {
          top: 0,
          left: 0,
        };
      },
    },
    cacheExtent: 1000,
  })
}
