import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

// Infragistics Modules
import {
  IgxDataChartCoreModule,
  IgxDataChartCategoryModule,
  IgxLegendModule,
  IgxDataChartInteractivityModule,
  IgxCategoryChartModule,
  IgxZoomSliderModule,
  IgxTimeXAxisModule,
} from 'igniteui-angular-charts';

import {
  IgxButtonModule,
  IgxDialogModule,
  IgxInputGroupModule,
  IgxRippleModule,
  IgxIconModule,
  IgxTooltipModule
} from 'igniteui-angular';

import { ColorPickerModule } from 'ngx-color-picker';

import { ChartComponent } from './chart/chart.component';
import { FormsModule } from '@angular/forms';
import { GatewayChartService } from './gatewayChart.service';
import { MultiaxisChartComponent } from './multiaxis-chart/components/multiaxis-chart/multiaxis-chart.component';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';

@NgModule({
  declarations: [ChartComponent, MultiaxisChartComponent],
  imports: [
    CommonModule,
    FormsModule,
    IgxDataChartCoreModule,
    IgxDataChartCategoryModule,
    IgxLegendModule,
    IgxDataChartInteractivityModule,
    IgxCategoryChartModule,
    IgxZoomSliderModule,
    IgxTimeXAxisModule,
    IgxDialogModule,
    IgxTooltipModule,
    IgxRippleModule,
    ColorPickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
    SatPopoverModule,
    MatTooltipModule,
    GatewayPipesModule,
    GatewayDirectivesModule
  ],
  providers: [GatewayChartService, DatePipe],
  exports: [ChartComponent, MultiaxisChartComponent],
})
export class GatewayChartModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GatewayChartModule,
      providers: [],
    };
  }
}
