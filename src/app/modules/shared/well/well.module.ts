import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';

// Angular Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import  { MatTooltipModule } from '@angular/material/tooltip';

// Infragistics
import { IgxGridModule, IgxFocusModule, IgxTooltipModule } from 'igniteui-angular';
import { IgxCategoryChartModule, IgxDataChartCoreModule,
  IgxDataChartScatterModule,
  IgxDataChartScatterCoreModule,
  IgxDataChartInteractivityModule,
  IgxLegendModule } from "igniteui-angular-charts";

// Gateway Chart Module
import { GatewayChartModule } from '@shared/gateway-chart/gateway-chart.module';
// Custom Pipes Module
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';

import { WellDetailsComponent } from './components/well-details/well-details.component';
import { ZoneDialogComponent } from './components/zone-dialog/zone-dialog.component';
import { ZoneDetailsComponent } from './components/zone-details/zone-details.component';
import { ValvePositionComponent } from './components/valve-position/valve-position.component';
import { ShiftVolumeChartComponent } from './components/shift-volume-chart/shift-volume-chart.component';
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';
import { ToolConnectionDetailsComponent } from './components/tool-connection-details/tool-connection-details.component';


@NgModule({
  declarations: [WellDetailsComponent, ZoneDetailsComponent, ZoneDialogComponent, ValvePositionComponent, ShiftVolumeChartComponent, ToolConnectionDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    A11yModule,
    MatTabsModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    IgxGridModule,
    IgxFocusModule,
    IgxTooltipModule,
    IgxCategoryChartModule,
    IgxDataChartCoreModule,
		IgxDataChartScatterModule,
		IgxDataChartScatterCoreModule,
    IgxDataChartInteractivityModule,
    IgxLegendModule,
    GatewayChartModule,
    GatewayDirectivesModule,
    GatewayPipesModule
  ],
  exports: [ WellDetailsComponent, ZoneDetailsComponent ],
  entryComponents: [ZoneDialogComponent]
})
export class WellModule { }
