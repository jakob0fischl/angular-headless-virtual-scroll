import {Component, computed, ElementRef, Signal, viewChild} from '@angular/core';
import {createVirtualScroll} from '../../../../../headless-virtual-scroll/src/public-api';
import {Area} from '../../../../../headless-virtual-scroll/src/lib/area';
import {TransformPipe} from './transform.pipe';

@Component({
  selector: 'app-infinite-two-dimensional',
  imports: [
    TransformPipe,
  ],
  templateUrl: './infinite-two-dimensional.component.html',
})
export class InfiniteTwoDimensionalComponent {
  protected readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly virtualScroll = createVirtualScroll<{
    x: number;
    y: number;
  }>({
    scrollContainer: computed(() => this.scrollContainer().nativeElement),
    cacheExtent: 1000,
    itemPlacementStrategy: {
      setup(areaToRender: Signal<Area>) {
        const GRID_SIZE = 100;

        return {
          totalSize: computed(() => ({
            width: 10000000,
            height: 10000000,
          })),
          viewportOffset: computed(() => ({
            top: 0,
            left: 0,
          })),
          elementsToRender: computed(() => {
            const areaValue = areaToRender();

            const firstColumn = Math.floor(areaValue.left / GRID_SIZE);
            const lastColumn = Math.ceil(areaValue.right / GRID_SIZE);
            const firstRow = Math.floor(areaValue.top / GRID_SIZE);
            const lastRow = Math.ceil(areaValue.bottom / GRID_SIZE);

            const result: {
              x: number;
              y: number;
            }[] = [];
            for (let column = firstColumn; column <= lastColumn; column++) {
              for (let row = firstRow; row <= lastRow; row++) {
                const x = pseudoRandom(pseudoRandom(row) + pseudoRandom(column));
                const y = pseudoRandom(pseudoRandom(row) - pseudoRandom(column));
                result.push({
                  x: column * GRID_SIZE + x * GRID_SIZE,
                  y: row * GRID_SIZE + y * GRID_SIZE,
                });
              }
            }
            return result;
          }),
        }
      },
    }
  });
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
