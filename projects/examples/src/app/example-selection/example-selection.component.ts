import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-example-selection',
  imports: [
    RouterLink,
  ],
  templateUrl: './example-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleSelectionComponent {

}
