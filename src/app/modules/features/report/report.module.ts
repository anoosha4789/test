import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
// Angular material modules
import { A11yModule } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import {MatTreeModule} from '@angular/material/tree';
import {MatTooltipModule} from '@angular/material/tooltip';

import { GatewayDialogsModule } from '@shared/gateway-dialogs/gateway-dialogs.module';
// Module routes
import { ReportsRoutingModule, routes } from './report-routing.module';

import { ConfigurationReportComponent } from './components/configuration-report/configuration-report.component';
import { ModbusmapReportComponent } from './components/modbusmap-report/modbusmap-report.component';
import { ReportHomeComponent } from './components/report-home/report-home.component';
import { ModbusmapDialogComponent } from './components/modbusmap-dialog/modbusmap-dialog.component';
import { AlarmHistoryReportComponent } from './components/alarm-history-report/alarm-history-report.component';
import { ShiftHistoryReportComponent } from './components/shift-history-report/shift-history-report.component';


@NgModule({
  declarations: [
    ConfigurationReportComponent, 
    ModbusmapReportComponent, ReportHomeComponent, ModbusmapDialogComponent, AlarmHistoryReportComponent, ShiftHistoryReportComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    A11yModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTreeModule,
    MatTooltipModule,
    GatewayDialogsModule
  ],
  entryComponents:[
    ModbusmapDialogComponent
  ],
  providers: [TitleCasePipe]
})

export class ReportModule { }
