import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminGuard } from '@core/services/adminGaurd.service';
import { DirtyCheckGuard } from '@core/services/dirty-check-guard';

// Angular material modules
import { A11yModule } from '@angular/cdk/a11y';
import {CdkTableModule} from '@angular/cdk/table';
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
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';

// Shared Modules
import { GwLayoutModule } from '@shared/gw-layout/gw-layout.module';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';
import { ConfigurationModule } from '@shared/configuration/configuration.module';
import { WellModule } from '@shared/well/well.module';
import { CommunicationModule } from '@shared/communication/communication.module';
import { PublishingModule } from '@shared/publishing/publishing.module';
import { MonitoringModule } from '@shared/monitoring/monitoring.module';
import { GatewayChartModule } from '@shared/gateway-chart/gateway-chart.module';
import { SuresensRoutingModule } from './suresens-routing.module';
import { SurefloModule } from '@shared/sureflo/sureflo.module';
import { DataLoggerModule } from '@shared/data-logger/data-logger.module';

import { SuresensHomeComponent } from '@features/suresens/components/suresens-home/suresens-home.component';
import { GeneralSettingComponent } from '@features/suresens/components/general-setting/general-setting.component';
import { SuresensWellComponent } from './components/suresens-well/suresens-well.component';
import { SuresensMonitoringComponent } from './components/suresens-monitoring/suresens-monitoring.component';
import { SuresensGeneralSettingDetailsComponent } from './components/suresens-general-setting-details/suresens-general-setting-details.component';
import { SuresensMonitoringCardComponent } from './components/suresens-monitoring-card/suresens-monitoring-card.component';
import { SureSENSFooterService } from './services/suresens-footer.service';


@NgModule({
  declarations: [SuresensHomeComponent, GeneralSettingComponent, SuresensWellComponent, SuresensMonitoringComponent, SuresensGeneralSettingDetailsComponent, SuresensMonitoringCardComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SuresensRoutingModule,
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
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    NgxPaginationModule,
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
  ],
  providers: [AdminGuard, DirtyCheckGuard]
})
export class SuresensModule {
  constructor(private sureSENSFooterService: SureSENSFooterService){}
}
