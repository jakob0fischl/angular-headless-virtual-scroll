import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: async () => import('./example-selection/example-selection.component').then(m => m.ExampleSelectionComponent),
  },
  {
    path: 'examples/simple-list',
    loadComponent: async () => import('./examples/simple-list/simple-list.component').then(m => m.SimpleListComponent),
  },
  {
    path: 'examples/infinite-two-dimensional',
    loadComponent: async () => import('./examples/infinite-two-dimensional/infinite-two-dimensional.component').then(m => m.InfiniteTwoDimensionalComponent),
  },
  {
    path: 'examples/different-content-sizes',
    loadComponent: async () => import('./examples/different-content-sizes/different-content-sizes.component').then(m => m.DifferentContentSizesComponent),
  },
  {
    path: 'examples/nested-virtual-scrolls',
    loadComponent: async () => import('./examples/nested-virtual-scrolls/nested-virtual-scrolls.component').then(m => m.NestedVirtualScrollsComponent),
  },
  {
    path: 'examples/nested-virtual-scrolls-2',
    loadComponent: async () => import('./examples/nested-virtual-scrolls-alternate/nested-virtual-scrolls-alternate.component').then(m => m.NestedVirtualScrollsAlternateComponent),
  },
];
