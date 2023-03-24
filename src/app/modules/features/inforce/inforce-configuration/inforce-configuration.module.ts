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
import { MatListModule } from '@angular/material/list';

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

// Shared Modules
import { GwLayoutModule } from '@shared/gw-layout/gw-layout.module';
import { GatewayComponentsModule } from '@shared/gateway-components/gateway-components.module';
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';
import { ConfigurationModule } from '@shared/configuration/configuration.module';
import { WellModule } from '@shared/well/well.module';
import { CommunicationModule } from '@shared/communication/communication.module';
import { PublishingModule } from '@shared/publishing/publishing.module';
import { SurefloModule } from '@shared/sureflo/sureflo.module';
import { DataLoggerModule } from '@shared/data-logger/data-logger.module';

// Module Components
import { InforceHomeComponent } from './components/inforce-home/inforce-home.component';
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';
import { ShiftDefaultsComponent } from './components/shift-defaults/shift-defaults.component';
import { ReturnsBasedComponent } from './components/shift-defaults/components/returns-based/returns-based.component';
import { TimeBasedComponent } from './components/shift-defaults/components/time-based/time-based.component';
import { PanelDefaultsComponent } from './components/panel-defaults/panel-defaults.component';
import { InforceWellComponent } from './components/inforce-well/inforce-well.component';
import { InforceZoneDialogComponent } from './components/inforce-zone-dialog/inforce-zone-dialog.component';
import { ShiftSettingsDialogComponent } from './components/shift-settings-dialog/shift-settings-dialog.component';
import { OutputMappingComponent } from './components/output-mapping/output-mapping.component';
import { ZoneMappingComponent } from './components/zone-mapping/zone-mapping.component';
import { InforceZoneDetailComponent } from './components/inforce-zone-detail/inforce-zone-detail.component';


// Module routes
import { routes } from './inforce-configuration-routing.module';

// Custom Pipes Module
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';

import { AdminGuard } from '@core/services/adminGaurd.service';
import { DirtyCheckGuard } from '@core/services/dirty-check-guard';
import { InforceConfigService } from './services/inforce-config.service';


@NgModule({
  declarations: [
    InforceHomeComponent,
    GeneralSettingsComponent,
    ShiftDefaultsComponent,
    ReturnsBasedComponent,
    TimeBasedComponent,
    PanelDefaultsComponent,
    InforceWellComponent,
    InforceZoneDialogComponent,
    ShiftSettingsDialogComponent,
    OutputMappingComponent,
    ZoneMappingComponent,
    InforceZoneDetailComponent
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
    GwLayoutModule,
    GatewayComponentsModule,
    GatewayDirectivesModule,
    GatewayPipesModule,
    ConfigurationModule,
    WellModule,
    CommunicationModule,
    PublishingModule,
    SurefloModule,
    MatListModule,
    DataLoggerModule
  ],
  providers: [AdminGuard, DirtyCheckGuard],
  entryComponents: [
    InforceZoneDialogComponent, 
    ShiftSettingsDialogComponent
  ]
})
export class InforceConfigurationModule { 
  constructor(private inFORCEConfigService: InforceConfigService){}
}
