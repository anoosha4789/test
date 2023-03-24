import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular material modules
import { A11yModule } from '@angular/cdk/a11y';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatListModule} from '@angular/material/list';

// Infragistics
import {
  IgxGridModule,
  IgxFocusModule,
  IgxTooltipModule,
  IgxIconModule,
  IgxInputGroupModule,
  IgxRippleModule
} from 'igniteui-angular';

import { NgxLoadingModule } from 'ngx-loading';

import { NgxGaugeModule } from 'ngx-gauge';

// Shared Modules
import { GwLayoutModule } from '@shared/gw-layout/gw-layout.module';
import { GatewayComponentsModule } from '@shared/gateway-components/gateway-components.module';
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';
import { ConfigurationModule } from '@shared/configuration/configuration.module';
import { WellModule } from '@shared/well/well.module';
import { CommunicationModule } from '@shared/communication/communication.module';
import { PublishingModule } from '@shared/publishing/publishing.module';
import { SurefloModule } from '@shared/sureflo/sureflo.module';
import { MonitoringModule } from '@shared/monitoring/monitoring.module';
import { GatewayChartModule } from '@shared/gateway-chart/gateway-chart.module';
import { DataLoggerModule } from '@shared/data-logger/data-logger.module';

// Module routes
import { routes } from './inforce-routing.module';

// Custom Pipes Module
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';
import { GwInforceShiftPipe } from './pipes/gw-inforce-shift.pipe';

import { AdminGuard } from '@core/services/adminGaurd.service';
import { DirtyCheckGuard } from '@core/services/dirty-check-guard';

import { InforceMonitoringComponent } from './components/inforce-monitoring/inforce-monitoring.component';
import { SensorCalibrationComponent } from './components/sensor-calibration/sensor-calibration.component';
import { ManualModeComponent } from './components/manual-mode/manual-mode.component';
import { VentOutputComponent } from './components/vent-output/vent-output.component';
import { RecirculateComponent } from './components/recirculate/recirculate.component'
import { InforceValvePositionComponent } from './components/inforce-valve-position/inforce-valve-position.component';
import { InforcePerformShiftDialogComponent } from './components/inforce-perform-shift-dialog/inforce-perform-shift-dialog.component';
import { InforceConfirmShiftDialogComponent } from './components/inforce-confirm-shift-dialog/inforce-confirm-shift-dialog.component';
import { PumpPressureDialogComponent } from './components/pump-pressure-dialog/pump-pressure-dialog.component';
import { DownholeValvePositionDialogComponent } from './components/downhole-valve-position-dialog/downhole-valve-position-dialog.component';

import { InforceViewShiftComponent } from './components/inforce-view-shift/inforce-view-shift.component';
import { ManualModeGraphDialogComponent } from './components/manual-mode-graph-dialog/manual-mode-graph-dialog.component';
import { ConfirmVentDialogComponent } from './components/vent-output/confirm-vent-dialog/confirm-vent-dialog.component';
import { InforceShiftHierarchyComponent } from './components/inforce-shift-hierarchy/inforce-shift-hierarchy.component';
import { InfoceAbortShiftDialogComponent } from './components/infoce-abort-shift-dialog/infoce-abort-shift-dialog.component';
import { InforceUserInterventionComponent } from './components/inforce-user-intervention/inforce-user-intervention.component';
import { EndOfShiftDialogComponent } from './components/end-of-shift-dialog/end-of-shift-dialog.component';
import { InforceFooterService } from './services/inforce-footer.service';
import { InforceMonitoringService } from './services/inforce-monitoring.service';

@NgModule({
  declarations: [
    InforceMonitoringComponent,
    SensorCalibrationComponent,
    ManualModeComponent,
    VentOutputComponent,
    RecirculateComponent,
    InforceValvePositionComponent,
    InforcePerformShiftDialogComponent,
    InforceConfirmShiftDialogComponent,
    PumpPressureDialogComponent,
    DownholeValvePositionDialogComponent,
    InforceViewShiftComponent,
    ConfirmVentDialogComponent,
    ManualModeGraphDialogComponent,
    InforceShiftHierarchyComponent,
    GwInforceShiftPipe,
    InforceShiftHierarchyComponent,
    InfoceAbortShiftDialogComponent,
    InforceUserInterventionComponent,
    EndOfShiftDialogComponent
  ],

    imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    MatSelectModule,
    MatFormFieldModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    A11yModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatCheckboxModule,
    NgxLoadingModule.forRoot({}),
    IgxGridModule, 
    IgxFocusModule, 
    IgxTooltipModule, 
    IgxIconModule,
    IgxInputGroupModule,
    IgxRippleModule,
    NgxGaugeModule,
    GwLayoutModule,
    GatewayComponentsModule,
    GatewayDirectivesModule,
    GatewayPipesModule,
    ConfigurationModule,
    WellModule,
    CommunicationModule,
    PublishingModule,
    MonitoringModule,
    GatewayChartModule,
    SurefloModule,
    MatSlideToggleModule,
    MatListModule,
    DataLoggerModule
  ],
  providers: [
    AdminGuard, 
    DirtyCheckGuard, 
    GwInforceShiftPipe,
    InforceFooterService,
    InforceMonitoringService
  ],
  entryComponents: [
    InforcePerformShiftDialogComponent,
    InforceConfirmShiftDialogComponent,
    PumpPressureDialogComponent, 
    DownholeValvePositionDialogComponent,
    ConfirmVentDialogComponent,
    ManualModeGraphDialogComponent,
    InfoceAbortShiftDialogComponent,
    InforceUserInterventionComponent,
    EndOfShiftDialogComponent
  ]
})
export class InforceModule {
  constructor(private inFORCEFooterService: InforceFooterService){}
}
