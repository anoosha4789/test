import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { NavItem } from 'bh-theme';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nav-list-item',
  template: `   
      <a
        mat-list-item
        mat-ripple
        [routerLink]="item?.route"
        routerLinkActive="active"
        (isActiveChange)="isActive.emit($event)"
        ><mat-icon class="mr-2">{{item.iconName}}</mat-icon><ng-container *ngTemplateOutlet="templateContent"></ng-container
      ></a>
    <ng-template #templateContent>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class NavListItemComponent {
  // @Input() link: string | null = null;
  @Input() item: NavItem | null = null;
  @Output() isActive = new EventEmitter<boolean>();


}
