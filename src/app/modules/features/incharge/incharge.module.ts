import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular material modules
import { A11yModule } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// Shared Modules
import { GwLayoutModule } from '@shared/gw-layout/gw-layout.module';
import { ConfigurationModule } from '@shared/configuration/configuration.module';
import { WellModule } from '@shared/well/well.module';
import { CommunicationModule } from '@shared/communication/communication.module';
import { PublishingModule } from '@shared/publishing/publishing.module';
import { SurefloModule } from '@shared/sureflo/sureflo.module';
import { DataLoggerModule } from '@shared/data-logger/data-logger.module';

// Module Components
import { InchargeHomeComponent } from './components/incharge-home/inchargeHome.component';
import { GeneralsettingsComponent } from './components/generalsettings/generalsettings.component';

// Module routes
import { routes } from './incharge-routing.module';

// Custom Pipes Module
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';
import { AdminGuard } from '@core/services/adminGaurd.service';
import { DirtyCheckGuard } from '@core/services/dirty-check-guard';
import { WellComponent } from './components/well/well.component';
import { InChargeMonitoringComponent } from './components/incharge-monitoring/incharge-monitoring.component';
import { MonitoringWellComponent } from './components/monitoring-well/monitoring-well.component';
import { MatTableModule } from '@angular/material/table';
import { MonitoringModule } from '@shared/monitoring/monitoring.module';
import { ShiftComponent } from './components/shift/shift.component';
import { GatewayChartModule } from '@shared/gateway-chart/gateway-chart.module';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { InchargeService } from './services/incharge.service';
import { InchargeFooterService } from './services/incharge-footer.service';

@NgModule({
  declarations: [
    InchargeHomeComponent,
    GeneralsettingsComponent,
    WellComponent,
    InChargeMonitoringComponent,
    MonitoringWellComponent,
    ShiftComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
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
    GwLayoutModule,
    GatewayPipesModule,
    ConfigurationModule,
    WellModule,
    CommunicationModule,
    PublishingModule,
    MonitoringModule,
    GatewayChartModule,
    SurefloModule,
    DataLoggerModule
    // StoreModule.forFeature('panelConfigState', panelConfigurationReducer),
    // EffectsModule.forFeature([PanelConfigurationEffects])
  ],
  providers: [AdminGuard, DirtyCheckGuard, InchargeService]
})
export class InchargeModule {
  constructor(private inCHARGEFooterService: InchargeFooterService){}
}
