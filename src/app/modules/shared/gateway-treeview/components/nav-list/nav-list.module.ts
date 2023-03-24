import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
// Baker Design Components
import { ThemeLibModule, NavService } from 'bh-theme';
// Angular Material Modules
import { MatListModule } from '@angular/material/list';

import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { NavListItemComponent } from './nav-list-item.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ExpandOnActiveLinkDirective } from './expand-on-active-link.directive';
import { NavListComponent } from './nav-list.component';
import { MatIconModule } from '@angular/material/icon';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [NavListItemComponent, NavListComponent, ExpandOnActiveLinkDirective],
  imports: [
    CommonModule, RouterModule, MatListModule, MatRippleModule,
    MatExpansionModule, MatIconModule, GatewayPipesModule, MatTooltipModule
  ],
  exports: [NavListItemComponent, NavListComponent, ExpandOnActiveLinkDirective]
})
export class GwNavListModule {
  /*  static forRoot(): ModuleWithProviders {
     return {
       ngModule: GwNavListModule,
       providers: [NavService]
     };
   } */
}
