import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '@env/environment';
import { NgxLoadingModule } from 'ngx-loading';

import { A11yModule } from '@angular/cdk/a11y';

// Baker Common CSS Modules
// vendor modules
import {
  ThemeLibModule,
  NavService,
  BhAlertService,
  BhSystemAlertComponent
} from 'bh-theme';


// modules
import { CoreModule } from '@core/core.module';
import { AppRoutingModule } from './app-routing.module';

// Interceptor
import { jwtInterceptor } from '@core/Interceptors/jwtInterceptor';

// components
import { AppComponent } from './app.component';
import { GatewayComponent } from './components/gateway/gateway.component';
import { HeaderComponent } from './components/header/header.component';
import { GatewayFooterComponent } from './components/gateway-footer/gateway-footer.component';
import { LoginComponent } from './components/login/login.component';
import { AboutComponent } from './components/about/about.component';

// services
import { appInitFactory, AppInitService } from '@core/services/appInitService.service';
import { NavigationService } from '@core/services/navigation.service';
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';
import { ValidationService } from '@core/services/validation.service';

// Ngrx modules
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

// Reducers & Effects
import { panelTypesReducer } from '@store/reducers/panelType.reducer';
import { PanelTypeEffects } from '@store/effects/panelType.effects';
import { toolTypesReducer } from '@store/reducers/toolType.reducer';
import { ToolTypeEffects } from '@store/effects/toolType.effect';
import { unitSystemReducer } from '@store/reducers/unit-system.reducer';
import { UnitSystemEffects } from '@store/effects/unit-system.effects';
import { DeviceDataPointsReducer } from '@store/reducers/deviceDataPoints.reducer';
import { DeviceDataPointsEffects } from '@store/effects/deviceDataPoints.effect';
import { UsersReducer } from '@store/reducers/users.reducer';
import { UsersEffects } from '@store/effects/users.effects';
import { errorReducer } from '@store/reducers/error.reducer';
import { ErrorEffects } from '@store/effects/error.effect';
import { serialChannelPropertiesReducer } from '@store/reducers/serialChannelProperties.reducer';
import { SerialChannelPropertiesEffects } from '@store/effects/serialChannelProperties.effects';
import { ErrorHandlingSettingsReducer } from '@store/reducers/errorHandlingSettings.reducer';
import { ErrorHandlingSettingsEffects } from '@store/effects/errorHandlingSettings.effects';
import { panelConfigurationCommonReducer } from '@store/reducers/panelConfigurationCommon.reducer';
import { PanelConfigurationCommonEffects } from '@store/effects/panelConfigurationCommon.effects';
import { ServerRunningStatusStateReducer } from '@store/reducers/serverRunningStatus.reducer';
import { modbusProtocolReducer } from '@store/reducers/modbusProocol.reducer';
import { ModbusProtocolEffects } from '@store/effects/modbusProtocol.effect';
import { mapTemplateDetailsReducer } from '@store/reducers/mapTemplateDetails.reducer';
import { MapTemplateDetailsEffects } from '@store/effects/mapTemplateDetails.effect';

import { wellEntityReducer } from '@store/reducers/well.entity.reducer';
import { WellEntityEffects } from '@store/effects/well.entity.effect';
import { dataSourcesEntityReducer } from '@store/reducers/dataSources.entity.reducer';
import { DataSourcesEntityEffects } from '@store/effects/dataSources.entity.effect';
import { PublishingEntityEffects } from '@store/effects/publishing.entity.effect';
import { publishingEntityReducer } from '@store/reducers/publishing.entity.reducer';
import { toolConnectionEntityReducer } from '@store/reducers/tool-connection.entity.reducer';
import { ToolConnectionEntityEffects } from '@store/effects/tool-connection.entity.effect';
import { pointTemplatesEntityReducer } from '@store/reducers/dataPointTemplate.entity.reducer';
import { PointTemplatesEntityEffects } from '@store/effects/dataPointTemplates.entity.effect';
import { surefloEntityReducer } from '@store/reducers/sureflo.entity.reducer';
import { SurefloEntityEffects } from '@store/effects/sureflo.entity.effect';
import { ShiftDefaultReducer } from '@store/reducers/shift-default.reducer';
import { ShiftDefaultEffects } from '@store/effects/shift-default.effects';
import { PanelDefaultReducer } from '@store/reducers/panel-default.reducer';
import { PanelDefaultEffects } from '@store/effects/panel-default.effects';
import { AlarmsAndLimitsReducer } from '@store/reducers/alarms-and-limits.reducer';
import { AlarmsAndLimitsEffects } from '@store/effects/alarms-and-limits.effects';
import { SieEntityReducer } from '@store/reducers/sie.entity.reducer';
import { SieEffects } from '@store/effects/sie.entity.effects';

import { BrowseFileDialogComponent } from '@shared/gateway-dialogs/components/browse-file-dialog/browse-file-dialog.component';
import { GatewayDialogComponent } from '@shared/gateway-dialogs/components/gateway-dialog/gateway-dialog.component';
import { SystemInfoComponent } from './components/system-info/system-info.component';
import { GatewayDialogsModule } from '@shared/gateway-dialogs/gateway-dialogs.module';
import { GatewayComponentsModule } from '@shared/gateway-components/gateway-components.module';

import { AlarmsReducer } from '@store/reducers/alarms.reducer';
import { AlarmsEffects } from '@store/effects/alarms.effects';
import { InforceDeviceReducer } from '@store/reducers/inforcedevices.reducer';
import { InforceDeviceEffects } from '@store/effects/inforcedevices.effects';
import { FlowmeterTransmitterReducer } from '@store/reducers/flowmeterTransmitter.reducer';
import { FlowmeterTransmitterEffects } from '@store/effects/flowmeterTransmitter.effects';
import { DataLoggerTypesReducer } from '@store/reducers/dataLoggerTypes.reducer';
import { DataLoggerTypesEffects } from '@store/effects/dataLoggerTypes.effect';
import { DataLoggerEntityReducer } from '@store/reducers/dataLogger.entity.reducer';
import { DataLoggerEntityEffects } from '@store/effects/dataLogger.entity.effect';
import { eFCVPositionSettingsReducer } from '@store/reducers/efcvPositionSettings.reducer';
import { eFCVPositionSettingsEffects } from '@store/effects/efcvPositionSettings.effects';
import { DiagnosticsTestTypesReducer } from '@store/reducers/diagnosticsTestTypes.reducer';
import { DiagnosticsTestTypesEffects } from '@store/effects/diagonsticsTestTypes.effect';

// I keep the new line
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GatewayComponent,
    LoginComponent,
    AboutComponent,
    SystemInfoComponent,
    GatewayFooterComponent
  ],
  imports: [
    BrowserModule,
    HammerModule,
    BrowserAnimationsModule,
    HttpClientModule,
    A11yModule,
    ThemeLibModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    GatewayComponentsModule,
    GatewayDialogsModule,
    AppRoutingModule,
    NgxLoadingModule.forRoot({}),
    StoreModule.forRoot({
      serverRunningStatusState: ServerRunningStatusStateReducer,
      panelState: panelTypesReducer,
      panelConfigCommonState: panelConfigurationCommonReducer,
      toolTypesState: toolTypesReducer,
      unitSystemState: unitSystemReducer,
      deviceDataPointsState: DeviceDataPointsReducer,
      usersState: UsersReducer,
      serialChannelPropertiesState: serialChannelPropertiesReducer,
      errorHandlingSettingsState: ErrorHandlingSettingsReducer,
      shiftDefaultState: ShiftDefaultReducer,
      panelDefaultState: PanelDefaultReducer,
      alarmsAndLimitsState: AlarmsAndLimitsReducer,
      modbusProtocolState: modbusProtocolReducer,
      mapTemplateDetailsState: mapTemplateDetailsReducer,
      error: errorReducer,
      toolConnections: toolConnectionEntityReducer,
      alarmsState: AlarmsReducer,
      inforcedevicesState: InforceDeviceReducer,
      flowmeterTransmitterState: FlowmeterTransmitterReducer,
      loggerTypeState: DataLoggerTypesReducer,
      diagnosticsTestTypeState: DiagnosticsTestTypesReducer,
      eFCVPositionSettingsState: eFCVPositionSettingsReducer
    }),
    StoreModule.forFeature('well', wellEntityReducer),
    StoreModule.forFeature('dataSources', dataSourcesEntityReducer),
    StoreModule.forFeature('publishing', publishingEntityReducer),
    StoreModule.forFeature('pointTemplates', pointTemplatesEntityReducer),
    StoreModule.forFeature('sureflo', surefloEntityReducer),
    StoreModule.forFeature('dataLogger', DataLoggerEntityReducer),
    StoreModule.forFeature('sie', SieEntityReducer),
    EffectsModule.forRoot([
      PanelTypeEffects,
      PanelConfigurationCommonEffects,
      ToolTypeEffects,
      UnitSystemEffects,
      DeviceDataPointsEffects,
      UsersEffects,
      SerialChannelPropertiesEffects,
      ErrorHandlingSettingsEffects,
      ShiftDefaultEffects,
      PanelDefaultEffects,
      AlarmsAndLimitsEffects,
      ModbusProtocolEffects,
      MapTemplateDetailsEffects,
      ErrorEffects,
      ToolConnectionEntityEffects,
      AlarmsEffects,
      InforceDeviceEffects,
      FlowmeterTransmitterEffects,
      DataLoggerEntityEffects,
      DataLoggerTypesEffects,
      DiagnosticsTestTypesEffects,
      SieEffects,
      eFCVPositionSettingsEffects
    ]),
    EffectsModule.forFeature([WellEntityEffects, DataSourcesEntityEffects, PublishingEntityEffects, PointTemplatesEntityEffects, SurefloEntityEffects, DataLoggerEntityEffects]),
    // Instrumentation must be imported after importing StoreModule (config is optional)
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  providers: [
    DatePipe,
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: { disabled: true } },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitFactory,
      deps: [AppInitService],
      multi: true,
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: jwtInterceptor, multi: true }, // Interceptor
    NavService,
    NavigationService,
    BhAlertService,
    ValidationService
  ],
  entryComponents: [
    BhSystemAlertComponent,
    LoginComponent,
    AboutComponent,
    SystemInfoComponent,
    BrowseFileDialogComponent,
    GatewayDialogComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
