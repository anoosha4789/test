import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
// Baker Design Components
import { ThemeLibModule, NavService } from 'bh-theme';
// Angular Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';

import { GwLayoutComponent } from './gw-layout.component';
import { GwNavListModule } from '@shared/gateway-treeview/components/nav-list/nav-list.module';
import { MatTreeModule } from '@angular/material/tree';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';



@NgModule({
  declarations: [GwLayoutComponent],
  imports: [
    CommonModule,
    ThemeLibModule,
    MatSidenavModule,
    MatStepperModule,
    MatListModule,
    MatTreeModule,
    GwNavListModule,
    GatewayPipesModule
  ],
  exports: [GwLayoutComponent]
})
export class GwLayoutModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GwLayoutModule,
      providers: [NavService]
    };
  }
}
