import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { GatewayChartModule } from '@shared/gateway-chart/gateway-chart.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';
import { RouterModule } from '@angular/router';
import { SetServerValueComponent } from './components/setservervalue/setservervalue.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CardDetailsComponent } from './components/carddetails/card-details.component';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ToolboxComponent } from './components/toolbox/toolbox.component';
import { ToolboxCardComponent } from './components/toolbox-card/toolbox-card.component';
import { ToolDetailsComponent } from './components/tooldetails/tooldetails.component';
import { SetBaudrateComponent } from './components/setbaudrate/setbaudrate.component';
import { SurefloDetailsComponent } from './components/sureflodetails/sureflodetails.component';
import { SwampyFilterPipe } from './pipes/swampyCard.filter';
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';
import { GwMaintenanceModeIndicatorComponent } from './components/gw-maintenance-mode-indicator/gw-maintenance-mode-indicator.component';

@NgModule({
  declarations: [ ToolboxComponent, ToolboxCardComponent, ToolDetailsComponent, CardDetailsComponent, SetServerValueComponent, SetBaudrateComponent, SurefloDetailsComponent, SwampyFilterPipe, GwMaintenanceModeIndicatorComponent ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([]),
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    GatewayPipesModule,
    GatewayChartModule,
    MatExpansionModule,
    GatewayDirectivesModule
  ],
  exports: [ ToolboxComponent, ToolboxCardComponent, ToolDetailsComponent, CardDetailsComponent, SetServerValueComponent, SurefloDetailsComponent, GwMaintenanceModeIndicatorComponent ],
  entryComponents: [SetServerValueComponent, SetBaudrateComponent]
})
export class MonitoringModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MonitoringModule,
      providers: [SwampyFilterPipe]
    };
  }
}
