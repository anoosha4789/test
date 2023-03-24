import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import { NavItem } from 'bh-theme';

import { NavListItemComponent } from './nav-list-item.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: 'nav-list',
  styleUrls: ['./nav-list.component.scss'],
  templateUrl: './nav-list.component.html',
})
export class NavListComponent {
  @ContentChildren(NavListItemComponent)
  navListItemComponents: QueryList<NavListItemComponent> | null = null;
  @Input() item: NavItem | null = null;
  @Input() expandable = false;
  @Output() isActive = new EventEmitter<boolean>();

  @HostBinding('class.nav-list--expandable')
  get expandableClass() {
    return this.expandable;
  }
}
