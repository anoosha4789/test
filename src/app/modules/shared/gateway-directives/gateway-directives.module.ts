import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GwIpInputDirective } from './directives/gw-ip-input.directive';
import { GwNumberInputDirective } from './directives/gw-number-input.directive';
import { GwDecimalInputDirective } from './directives/gw-decimal-input.directive';
import { GwDisableControlDirective } from './directives/gw-disable-control.directive';



@NgModule({
  declarations: [GwIpInputDirective, GwNumberInputDirective, GwDecimalInputDirective, GwDisableControlDirective],
  imports: [
    CommonModule
  ],
  exports: [GwIpInputDirective, GwNumberInputDirective, GwDecimalInputDirective, GwDisableControlDirective]
})
export class GatewayDirectivesModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GatewayDirectivesModule,
    };
  }
}
