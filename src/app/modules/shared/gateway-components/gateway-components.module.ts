import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// vendor modules
import { ThemeLibModule} from 'bh-theme';


import { GwMobileMenuComponent } from '@shared/gateway-components/gw-mobile-menu/gw-mobile-menu.component';
import { GwAlertComponent } from '@shared/gateway-components/gw-alert/gw-alert.component';
import { GwLiquidBoxComponent } from './gw-liquid-box/gw-liquid-box.component';

@NgModule({
  declarations: [GwMobileMenuComponent, GwAlertComponent, GwLiquidBoxComponent],
  imports: [
    CommonModule,
    ThemeLibModule
  ],
  exports: [GwMobileMenuComponent, GwAlertComponent, GwLiquidBoxComponent],
  entryComponents: [GwMobileMenuComponent, GwAlertComponent]
})

export class GatewayComponentsModule {}
