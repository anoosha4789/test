import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { GwTruncatePipe } from './pipes/gw-truncate.pipe';
import { ToolConnectionFilterPipe } from './pipes/toolConnections.filter';
import { TruncateFileNameExtension } from './pipes/truncateFileExtension.pipe';
import { GwToolStatusPipe } from './pipes/gw-tool-status.pipe';
import { GwCardStatusPipe } from './pipes/gw-card-status.pipe';
import { GwValveTypeNamePipe } from './pipes/gw-valve-type-name.pipe';
import { GwNumberFormatterPipe } from './pipes/gw-number-formatter.pipe';
import { GwValvePositionNamePipe } from './pipes/gw-valve-position-name.pipe';
import { GwMinuteSecondsPipe } from './pipes/gw-minute-seconds.pipe';
import { GwGaugeLabelFormatterPipe } from './pipes/gw-gauge-label-formatter.pipe';


@NgModule({
  declarations: [
    GwTruncatePipe, 
    TruncateFileNameExtension, 
    ToolConnectionFilterPipe, 
    GwToolStatusPipe, 
    GwCardStatusPipe, 
    GwValveTypeNamePipe, 
    GwNumberFormatterPipe, 
    GwValvePositionNamePipe, 
    GwMinuteSecondsPipe, 
    GwGaugeLabelFormatterPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GwTruncatePipe, 
    TruncateFileNameExtension, 
    ToolConnectionFilterPipe, 
    GwToolStatusPipe, 
    GwValveTypeNamePipe, 
    GwNumberFormatterPipe, 
    GwValvePositionNamePipe, 
    GwMinuteSecondsPipe,
    GwGaugeLabelFormatterPipe
  ],
  providers: [DecimalPipe, GwMinuteSecondsPipe, GwTruncatePipe]
})
export class GatewayPipesModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GatewayPipesModule,
    };
  }
}
