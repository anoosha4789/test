import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultinodeRoutingModule } from './multinode-routing.module';
import { AdminGuard } from '@core/services/adminGaurd.service';
import { DirtyCheckGuard } from '@core/services/dirty-check-guard';
import { MultinodeHomeComponent } from './components/multinode-home/multinode-home.component';
import { A11yModule } from '@angular/cdk/a11y';
import { CdkTableModule } from '@angular/cdk/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { NgxPaginationModule } from 'ngx-pagination';
import { GwLayoutModule } from '@shared/gw-layout/gw-layout.module';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';
import { ConfigurationModule } from '@shared/configuration/configuration.module';
import { MultinodeWellComponent } from './components/multinode-well/multinode-well.component';
import { IgxFocusModule, IgxGridModule, IgxIconModule, IgxInputGroupModule, IgxRippleModule, IgxTooltipModule } from '@infragistics/igniteui-angular';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TecPowerSupplyComponent } from './components/tec-power-supply/tec-power-supply.component';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { SieComponent } from './components/sie/sie.component';
import { EFVCComponent } from './components/e-fvc/e-fvc.component';
import { EfcvPositionsSettingsComponent } from './components/efcv-positions-settings/efcv-positions-settings.component';
import { EfcvPositionsDialogComponent } from './components/efcv-positions-dialog/efcv-positions-dialog.component';
import { MultinodeSieComponent } from './components/multinode-sie/multinode-sie.component';
import { CommunicationModule } from '@shared/communication/communication.module';
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';
import { MultinodeMonitoringComponent } from './components/multinode-monitoring/multinode-monitoring.component';
import { ElectricalParametersDialogComponent } from './components/electrical-parameters-dialog/electrical-parameters-dialog.component';
import { MultinodeMonitoringCardComponent } from './components/multinode-monitoring-card/multinode-monitoring-card.component';
import { MultinodeAdvancedComponent } from './components/multinode-advanced/multinode-advanced.component';
import { MultinodeManualModeComponent } from './components/multinode-manual-mode/multinode-manual-mode.component';
import { MultinodeDiagnosticsComponent } from './components/multinode-diagnostics/multinode-diagnostics.component';
import { GatewayChartModule } from '@shared/gateway-chart/gateway-chart.module';
import { PublishingModule } from '@shared/publishing/publishing.module';
import { DataLoggerModule } from '@shared/data-logger/data-logger.module';
import { ManualModePowerSupplyComponent } from './components/multinode-manual-mode/manual-mode-power-supply/manual-mode-power-supply.component';
import { ManualModePowerSupplyCardsComponent } from './components/multinode-manual-mode/manual-mode-power-supply-cards/manual-mode-power-supply-cards.component';
import { MultinodeService } from './services/multinode.service';
import { MultinodePowerSupplyGridComponent } from './components/multinode-power-supply-grid/multinode-power-supply-grid.component';
import { PerformActuationDialogComponent } from './components/perform-actuation-dialog/perform-actuation-dialog.component';
import { ConfirmActuationComponent } from './components/perform-actuation-dialog/confirm-actuation/confirm-actuation.component';
import { ViewActuationDialogComponent } from './components/view-actuation-dialog/view-actuation-dialog.component';
import { EndOfActuationDialogComponent } from './components/end-of-actuation-dialog/end-of-actuation-dialog.component';
import { MultinodeFooterService } from './services/multinode-footer.service';
import { MultinodeActuateHierarchyComponent } from './components/view-actuation-dialog/multinode-actuate-hierarchy/multinode-actuate-hierarchy.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DiagnosticTestService } from './services/diagnostic-test.service';
import { AbortActuationDialogComponent } from './components/view-actuation-dialog/abort-actuation-dialog/abort-actuation-dialog.component';
import { MonitoringModule } from '@shared/monitoring/monitoring.module';
import { MultinodeAlarmsService } from './services/multinode-alarms.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MultinodeWellStepperComponent } from './components/multinode-well-stepper/multinode-well-stepper.component';
import { MultiNodelocalstorageService } from './services/multi-nodelocalstorage.service';
@NgModule({
  declarations: [
    MultinodeHomeComponent, GeneralSettingsComponent, MultinodeWellComponent, TecPowerSupplyComponent, SieComponent, EFVCComponent, EfcvPositionsSettingsComponent, EfcvPositionsDialogComponent, MultinodeSieComponent, MultinodeMonitoringComponent, MultinodeMonitoringCardComponent, ElectricalParametersDialogComponent, MultinodeAdvancedComponent, MultinodeManualModeComponent, MultinodeDiagnosticsComponent, ManualModePowerSupplyComponent, ManualModePowerSupplyCardsComponent, MultinodePowerSupplyGridComponent, PerformActuationDialogComponent, ConfirmActuationComponent, EndOfActuationDialogComponent, ViewActuationDialogComponent, MultinodeActuateHierarchyComponent, AbortActuationDialogComponent, MultinodeWellStepperComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MultinodeRoutingModule,
    A11yModule,
    CdkTableModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSelectModule,
    MatRadioModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    NgxPaginationModule,
    GwLayoutModule,
    GatewayPipesModule,
    GatewayDirectivesModule,
    ConfigurationModule,
    IgxGridModule,
    IgxFocusModule,
    IgxTooltipModule,
    IgxIconModule,
    IgxInputGroupModule,
    IgxRippleModule,
    SatPopoverModule,
    CommunicationModule,
    GatewayChartModule,
    PublishingModule,
    DataLoggerModule,
    ScrollingModule,
    MonitoringModule,
    MatStepperModule
  ],
  entryComponents: [EFVCComponent, EfcvPositionsDialogComponent, ElectricalParametersDialogComponent, PerformActuationDialogComponent, ConfirmActuationComponent, EndOfActuationDialogComponent, ViewActuationDialogComponent, AbortActuationDialogComponent],
  providers: [AdminGuard, DirtyCheckGuard, MultinodeService, DiagnosticTestService, MultinodeAlarmsService, MultiNodelocalstorageService]
})
export class MultinodeModule {
  constructor(private _multinodeFooterService: MultinodeFooterService, 
    private _multiNodeAlarmService: MultinodeAlarmsService, 
    private _multiNodeLocalStorage: MultiNodelocalstorageService) { }
}
