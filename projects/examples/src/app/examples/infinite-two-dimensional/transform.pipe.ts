import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'transform'
})
export class TransformPipe implements PipeTransform {
  public transform(value: {
    x: number;
    y: number;
  }): string {
    return `translate(${value.x}px, ${value.y}px)`;
  }
}
