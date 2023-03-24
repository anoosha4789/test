import { Directive, Input, QueryList, AfterContentInit } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { from } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

import { NavListItemComponent } from './nav-list-item.component';

@Directive({
  selector: '[expandOnActiveLink]',
})
export class ExpandOnActiveLinkDirective implements AfterContentInit {
  @Input()
  navListItemComponents: QueryList<NavListItemComponent> | null = null;

  constructor(private panel: MatExpansionPanel) { }

  ngAfterContentInit(): void {
    const navListItems = this.navListItemComponents?.toArray();

    if (navListItems) {
      from(navListItems)
        .pipe(
          mergeMap((item) => item.isActive),
          filter((isActive, index) => isActive === true)
        )
        .subscribe(() => {
          // Looks like there's a bug in `mat-drawer` component
          // that prevents `mat-expansion-panel` from expanding
          setTimeout(() => this.panel.open(), 0);
        });
    }
  }
}
