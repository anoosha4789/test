import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


// infragistics
import {
  IgxAvatarModule,
  IgxButtonModule,
  IgxIconModule,
  IgxCardModule,
  IgxDividerModule,
  IgxDialogModule,
  IgxRippleModule,
  IgxChipsModule,
  IgxSliderModule,
  IgxListModule,
  IgxExpansionPanelModule,
  IgxGridModule,
  IgxTooltipModule,
  IgxTimePickerModule,
  IgxInputGroupModule,
} from 'igniteui-angular';

// Import sharedModule
import { GwLayoutModule } from '@shared/gw-layout/gw-layout.module';

import { routes } from '@features/diagnostics/diagnostics-routing.module';
import { DataPointTrendComponent } from '@features/diagnostics/components/data-point-trend/data-point-trend.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DevicetreeComponent } from './components/devicetree/devicetree.component';
import { DatapointtableComponent } from './components/datapointtable/datapointtable.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { MatInputModule } from '@angular/material/input';
import { DiagnosticsHomeComponent } from './components/diagnostics-home/diagnostics-home.component';
import { GatewayChartModule } from '@shared/gateway-chart/gateway-chart.module';
import { HistorianTrendComponent } from './components/historian-trend/historian-trend.component';
import { MatDividerModule } from '@angular/material/divider';
import { PointTrendDataPointsDialogComponent } from './components/data-point-trend/point-trend-data-points-dialog/point-trend-data-points-dialog.component';
import { GatewayTreeviewModule } from '@shared/gateway-treeview/gateway-treeview.module';
import { DiagnosticsModbusTemplatePointsComponent } from './components/data-point-trend/diagnostics-modbus-template-points/diagnostics-modbus-template-points.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GatewayDialogsModule } from '@shared/gateway-dialogs/gateway-dialogs.module';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { HistorianDatapointsDialogComponent } from './components/historian-trend/historian-datapoints-dialog/historian-datapoints-dialog.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DateTimePickerComponent } from './components/historian-trend/historian-datapoints-dialog/date-time-picker/date-time-picker.component';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';
import { HistorianEditDateDialogComponent } from './components/historian-trend/historian-edit-date-dialog/historian-edit-date-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatDateFormats, NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
const INTL_DATE_INPUT_FORMAT = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hourCycle: 'h23',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
};

const MAT_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: INTL_DATE_INPUT_FORMAT,
  },
  display: {
    dateInput: INTL_DATE_INPUT_FORMAT,
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

@NgModule({
  declarations: [
    DataPointTrendComponent,
    DevicetreeComponent,
    DatapointtableComponent,
    DiagnosticsHomeComponent,
    HistorianTrendComponent,
    PointTrendDataPointsDialogComponent,
    DiagnosticsModbusTemplatePointsComponent,
    HistorianDatapointsDialogComponent,
    DateTimePickerComponent,
    HistorianEditDateDialogComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FontAwesomeModule,
    IgxAvatarModule,
    IgxButtonModule,
    IgxIconModule,
    IgxCardModule,
    IgxDividerModule,
    IgxDialogModule,
    IgxRippleModule,
    IgxChipsModule,
    IgxListModule,
    IgxExpansionPanelModule,
    IgxSliderModule,
    MatGridListModule,
    MatCardModule,
    MatTreeModule,
    MatCheckboxModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    SatPopoverModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    GwLayoutModule,
    GatewayChartModule,
    MatDividerModule,
    GatewayTreeviewModule,
    IgxGridModule,
    IgxTooltipModule,
    ScrollingModule,
    GatewayDialogsModule,
    MatTabsModule,
    MatStepperModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    IgxTimePickerModule,
    IgxInputGroupModule,
    GatewayPipesModule,
    MatTooltipModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule
  ],
  providers: [MatDatepickerModule, MatNativeDateModule, { provide: NGX_MAT_DATE_FORMATS, useValue: MAT_DATE_FORMATS }],
  entryComponents: [PointTrendDataPointsDialogComponent,
    HistorianDatapointsDialogComponent, HistorianEditDateDialogComponent]
})
export class DiagnosticsModule { }
